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
import zh from './locales/zh.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import fr from './locales/fr.json';
import sw from './locales/sw.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            tr: { translation: tr },
            pt: { translation: pt },
            ru: { translation: ru },
            sp: { translation: sp },
            de: { translation: de },
            ar: { translation: ar },
            hi: { translation: hi },
            zh: { translation: zh },
            ja: { translation: ja },
            ko: { translation: ko },
            fr: { translation: fr },
            sw: { translation: sw },
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
