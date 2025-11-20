import "server-only";

const dictionaries = {
  "en-US": () => import("./dictionaries/en-US.json").then((module) => module.default),
  "es-MX": () => import("./dictionaries/es-MX.json").then((module) => module.default),
};

export type Locale = keyof typeof dictionaries;

export const getDictionary = async (locale: Locale) => {
  if (dictionaries[locale]) {
    return dictionaries[locale]();
  }
  // Fallback to en-US if locale not found
  return dictionaries["en-US"]();
};
