import { describe, expect, it } from "vitest";
import { clearSnapshot, loadSnapshot, saveSnapshot, SNAPSHOT_VERSION, type DemoSnapshot, type StorageLike } from "@/core/state/persist";

const KEY = "test-demo-state";
const DAY = "2026-10-07";

const snapshot = (over: Partial<DemoSnapshot> = {}): DemoSnapshot => ({
  v: SNAPSHOT_VERSION,
  day: DAY,
  reservations: [],
  clients: [],
  rooms: [],
  staff: [],
  adminSiteId: "s1",
  ...over,
});

const fakeStorage = (): StorageLike & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => void data.set(k, v),
    removeItem: (k) => void data.delete(k),
  };
};

const brokenStorage: StorageLike = {
  getItem: () => {
    throw new Error("SecurityError");
  },
  setItem: () => {
    throw new Error("QuotaExceededError");
  },
  removeItem: () => {
    throw new Error("SecurityError");
  },
};

describe("persistance de l'état de la démo", () => {
  it("relit ce qui a été écrit", () => {
    const storage = fakeStorage();
    saveSnapshot(KEY, snapshot({ adminSiteId: "s2" }), storage);
    expect(loadSnapshot(KEY, DAY, storage)?.adminSiteId).toBe("s2");
  });

  it("ignore un instantané d'un autre jour (les dates relatives du seed ont changé)", () => {
    const storage = fakeStorage();
    saveSnapshot(KEY, snapshot(), storage);
    expect(loadSnapshot(KEY, "2026-10-08", storage)).toBeNull();
  });

  it("ignore un instantané corrompu ou d'une autre version", () => {
    const storage = fakeStorage();
    storage.setItem(KEY, "{pas du json");
    expect(loadSnapshot(KEY, DAY, storage)).toBeNull();
    storage.setItem(KEY, JSON.stringify({ ...snapshot(), v: 99 }));
    expect(loadSnapshot(KEY, DAY, storage)).toBeNull();
    storage.setItem(KEY, JSON.stringify({ ...snapshot(), reservations: "x" }));
    expect(loadSnapshot(KEY, DAY, storage)).toBeNull();
  });

  it("ne lève jamais d'exception si le stockage est bloqué, et se replie en mémoire", () => {
    expect(() => saveSnapshot(KEY, snapshot({ adminSiteId: "mem" }), brokenStorage)).not.toThrow();
    expect(loadSnapshot(KEY, DAY, brokenStorage)?.adminSiteId).toBe("mem");
    expect(() => clearSnapshot(KEY, brokenStorage)).not.toThrow();
    expect(loadSnapshot(KEY, DAY, brokenStorage)).toBeNull();
  });

  it("fonctionne sans stockage du tout (rendu serveur)", () => {
    expect(() => saveSnapshot(KEY, snapshot(), null)).not.toThrow();
    expect(loadSnapshot(KEY, DAY, null)?.day).toBe(DAY);
    clearSnapshot(KEY, null);
    expect(loadSnapshot(KEY, DAY, null)).toBeNull();
  });

  it("clearSnapshot efface le stockage et le repli en mémoire", () => {
    const storage = fakeStorage();
    saveSnapshot(KEY, snapshot(), storage);
    clearSnapshot(KEY, storage);
    expect(storage.data.size).toBe(0);
    expect(loadSnapshot(KEY, DAY, storage)).toBeNull();
  });
});
