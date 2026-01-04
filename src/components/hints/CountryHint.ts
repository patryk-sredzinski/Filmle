import { HintItemConfig } from '../HintItem.js';
import { ProductionCountry } from '../../types.js';
import { getCountryFlagUrl, getCountryNamePL } from '../../utils.js';

export interface CountryHintConfig {
    country: ProductionCountry;
    isMatch: boolean;
}

export class CountryHint {
    static create(config: CountryHintConfig): HintItemConfig {
        const { country, isMatch } = config;
        
        return {
            type: 'flag',
            color: (isMatch ? 'green' : 'red') as 'green' | 'red',
            content: getCountryFlagUrl(country.iso_3166_1),
            tooltip: getCountryNamePL(country.iso_3166_1) || country.name,
            imageUrl: getCountryFlagUrl(country.iso_3166_1)
        };
    }
}
