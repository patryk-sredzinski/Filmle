import { getCountryFlagUrl, getCountryNamePL } from '../../utils.js';
export class CountryHint {
    static create(config) {
        const { country, isMatch } = config;
        return {
            type: 'flag',
            color: (isMatch ? 'green' : 'red'),
            content: getCountryFlagUrl(country.iso_3166_1),
            tooltip: getCountryNamePL(country.iso_3166_1) || country.name,
            imageUrl: getCountryFlagUrl(country.iso_3166_1)
        };
    }
}
//# sourceMappingURL=CountryHint.js.map