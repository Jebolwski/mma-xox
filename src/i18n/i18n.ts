import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import tr from './locales/tr.json';
import pt from './locales/pt.json';
import sp from './locales/sp.json';
import ru from './locales/ru.json';
import de from './locales/de.json';
import ar from './locales/ar.json';
import hi from './locales/in.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            tr: { translation: tr },
            pt: { translation: pt },
            sp: { translation: sp },
            ru: { translation: ru },
            de: { translation: de },
            ar: { translation: ar },
            hi: { translation: hi },
        },
        lng: 'en',
        fallbackLng: 'en',
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'language',
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
