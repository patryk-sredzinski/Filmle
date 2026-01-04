import { HintGroupConfig } from '../HintGroup.js';
import { ProductionCountry, CountriesComparison } from '../../types.js';
import { getCountryFlagUrl, getCountryNamePL } from '../../utils.js';

export interface CountryHintConfig {
    countries: ProductionCountry[];
    comparison?: CountriesComparison;
    // For mystery info - only matched country names
    matchedCountryNames?: string[];
}

export class CountryHint {
    static createForGuess(config: CountryHintConfig): HintGroupConfig {
        const { countries, comparison } = config;

        if (!comparison) {
            return {
                type: 'countries',
                items: []
            };
        }

        const countryItems = countries.map(country => ({
            type: 'flag' as const,
            color: (comparison.matches.includes(country.name) ? 'green' : 'red') as 'green' | 'red',
            content: getCountryFlagUrl(country.iso_3166_1),
            tooltip: getCountryNamePL(country.iso_3166_1) || country.name,
            imageUrl: getCountryFlagUrl(country.iso_3166_1)
        }));

        return {
            type: 'countries',
            items: countryItems
        };
    }

    static createForMystery(config: CountryHintConfig): HintGroupConfig {
        const { matchedCountryNames, countries } = config;

        if (!matchedCountryNames || matchedCountryNames.length === 0) {
            return {
                type: 'countries',
                items: []
            };
        }

        // Find country codes for matched names
        const countryItems = matchedCountryNames.slice(0, 3).map(countryName => {
            const country = countries.find(c => c.name === countryName);
            const countryCode = country?.iso_3166_1 || '';
            return {
                type: 'flag' as const,
                color: 'green' as const,
                content: getCountryFlagUrl(countryCode),
                tooltip: getCountryNamePL(countryCode) || countryName,
                imageUrl: getCountryFlagUrl(countryCode)
            };
        });

        return {
            type: 'countries',
            items: countryItems
        };
    }
}

