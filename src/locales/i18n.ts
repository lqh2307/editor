import translationVI from "./vietnamese/translation.json";
import translationEN from "./english/translation.json";
import { initReactI18next } from "react-i18next";
import i18n from "i18next";

const resources = {
  english: { translation: translationEN },
  vietnamese: { translation: translationVI },
};

i18n.use(initReactI18next).init({
  resources,
  fallbackLng: "vietnamese",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
