// import i18n from 'i18next';
// import { initReactI18next } from 'react-i18next';
// import en from './locales/en.json'
// import es from './locales/es.json';
// import fr from './locales/fr.json';

// i18n
//   .use(initReactI18next)
//   .init({
//     resources: {
//       en: { translation: en },
//       es: { translation: es },
//       fr: { translation: fr },
//     },
//     lng: 'en',
//     fallbackLng: 'en',
//     interpolation: { escapeValue: false },
//   });

// export default i18n;




import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const loadTranslations = (copies) => {
  const resources = {
    en: { translation: {} },
    es: { translation: {} },
    fr: { translation: {} },
    ar: { translation: {} },
    'zh-Hans': { translation: {} },
    hi: { translation: {} },
    de: { translation: {} },

  };

  copies.forEach(item => {
    const key = item._id;

    resources.en.translation[key] = item.translations?.en || item.default_text;
    resources.es.translation[key] = item.translations?.es || item.default_text;
    resources.fr.translation[key] = item.translations?.fr || item.default_text;
    resources.ar.translation[key] = item.translations?.ar || item.default_text;
    // resources.zh-Hans.translation[key] = item.translations?.zh-Hans. || item.default_text;
    resources["zh-Hans"].translation[key] = item.translations?.["zh-Hans"] || item.default_text;
    resources.hi.translation[key] = item.translations?.hi || item.default_text;
    resources.de.translation[key] = item.translations?.de || item.default_text;
  });

  Object.keys(resources).forEach(lang => {
    i18n.addResources(lang, 'translation', resources[lang].translation);
  });
};

i18n
  .use(initReactI18next)
  .init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;