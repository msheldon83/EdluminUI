import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// the translations. We do not have an EN-US file.
const resources = {
  // en: {
  //   translation: {
  //      ...translations here
  //   },
  // },
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en",
    nsSeparator: false, // char to split namespace from key
    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
