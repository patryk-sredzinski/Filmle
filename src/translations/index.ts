import { translationsPL } from './pl.js';
import { translationsEN } from './en.js';

export type Language = 'pl' | 'en';
export type TranslationKey = keyof typeof translationsPL;

export const translations: Record<Language, typeof translationsPL> = {
    pl: translationsPL,
    en: translationsEN
};

export function t(key: TranslationKey, lang: Language, params?: Record<string, string | number>): string {
    let text = translations[lang][key] || translations['pl'][key] || key;
    
    if (params) {
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, String(params[param]));
        });
    }
    
    return text;
}

