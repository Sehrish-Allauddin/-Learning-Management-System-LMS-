import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ur from "./locales/ur.json";

const LANGUAGE_STORAGE_KEY = "lms_language";

const applyDirection = (language) => {
  if (typeof document === "undefined") return;
  const safeLanguage = language === "ur" ? "ur" : "en";
  document.documentElement.lang = safeLanguage;
  document.documentElement.dir = safeLanguage === "ur" ? "rtl" : "ltr";
};

const savedLanguage =
  typeof window !== "undefined"
    ? window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    : null;

const initialLanguage = savedLanguage === "ur" ? "ur" : "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur }
  },
  lng: initialLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false },
  react: { useSuspense: false }
});

applyDirection(initialLanguage);

export const changeLanguage = (language) => {
  const safeLanguage = language === "ur" ? "ur" : "en";
  if (typeof window !== "undefined") {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, safeLanguage);
  }
  i18n.changeLanguage(safeLanguage);
  applyDirection(safeLanguage);
};

export default i18n;