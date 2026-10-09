import { describe, expect, it } from "vitest";
import { parseAppEnv, recipientlessLinks, showDevBanner } from "@/core/lib/runtime";
import { whatsappLink } from "@/core/whatsapp/whatsapp";
import { giftCardWaLink } from "@/core/booking/gift-card";
import { reminderLink } from "@/core/whatsapp/reminders";
import { brand, reservation } from "./fixtures";

describe("APP_ENV", () => {
  it("accepte les trois environnements, sinon retombe sur « development »", () => {
    expect(parseAppEnv("production")).toBe("production");
    expect(parseAppEnv("staging")).toBe("staging");
    expect(parseAppEnv("development")).toBe("development");
    expect(parseAppEnv(undefined)).toBe("development");
    expect(parseAppEnv("")).toBe("development");
    expect(parseAppEnv("Production")).toBe("development");
    expect(parseAppEnv("prod")).toBe("development");
  });

  it("bandeau et liens sans destinataire partout sauf en production", () => {
    expect(showDevBanner("production")).toBe(false);
    expect(showDevBanner("staging")).toBe(true);
    expect(showDevBanner("development")).toBe(true);
    expect(recipientlessLinks("production")).toBe(false);
    expect(recipientlessLinks("staging")).toBe(true);
    expect(recipientlessLinks("development")).toBe(true);
  });
});

describe("liens WhatsApp sans destinataire", () => {
  it("whatsappLink : numéro conservé en production, absent sinon", () => {
    expect(whatsappLink("+237 600 00 00 01", "Bonjour & merci")).toBe("https://wa.me/237600000001?text=Bonjour%20%26%20merci");
    expect(whatsappLink("+237 600 00 00 01", "Bonjour", true)).toBe("https://wa.me/?text=Bonjour");
    expect(whatsappLink("", "Bonjour")).toBe("https://wa.me/?text=Bonjour");
  });

  it("giftCardWaLink et reminderLink suivent la même règle", () => {
    expect(giftCardWaLink("670000001", "x", true)).toBe("https://wa.me/?text=x");
    expect(giftCardWaLink("670000001", "x")).toBe("https://wa.me/670000001?text=x");
    const r = reservation({ lines: [{ serviceId: "vi-soin-lumiere", practitionerId: "site-aurore-p1", roomId: "site-aurore-r-visage", start: "10:00", durationMin: 60, noPreference: false }] });
    const ctx = { brand: brand.name, siteName: "Site Aurore", services: brand.services, staff: brand.practitioners };
    expect(reminderLink(r, ctx).startsWith("https://wa.me/237600000099?text=")).toBe(true);
    expect(reminderLink(r, { ...ctx, recipientless: true }).startsWith("https://wa.me/?text=")).toBe(true);
  });
});
