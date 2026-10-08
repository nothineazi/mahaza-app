/** Texte comparable pour une recherche : sans accents, en minuscules. */
export const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
