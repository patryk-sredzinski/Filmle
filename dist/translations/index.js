import { translationsPL } from './pl.js';
import { translationsEN } from './en.js';
export const translations = {
    pl: translationsPL,
    en: translationsEN
};
export function t(key, lang, params) {
    let text = translations[lang][key] || translations['pl'][key] || key;
    if (params) {
        Object.keys(params).forEach(param => {
            text = text.replace(`{${param}}`, String(params[param]));
        });
    }
    return text;
}
//# sourceMappingURL=index.js.map