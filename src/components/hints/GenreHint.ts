import { HintGroupConfig } from '../HintGroup.js';
import { Genre, GenresComparison } from '../../types.js';
import { getGenreIcon } from '../../utils.js';

export interface GenreHintConfig {
    genres: Genre[];
    comparison?: GenresComparison;
    // For mystery info - only matched genre IDs
    matchedGenreIds?: number[];
}

export class GenreHint {
    static createForGuess(config: GenreHintConfig): HintGroupConfig {
        const { genres, comparison } = config;

        if (!comparison) {
            return {
                type: 'genres',
                items: []
            };
        }

        const genreItems = genres.map(genre => ({
            type: 'genre' as const,
            color: (comparison.matches.includes(genre.id) ? 'green' : 'red') as 'green' | 'red',
            content: getGenreIcon(genre.id),
            tooltip: genre.name
        }));

        return {
            type: 'genres',
            items: genreItems
        };
    }

    static createForMystery(config: GenreHintConfig): HintGroupConfig {
        const { matchedGenreIds, genres } = config;

        if (!matchedGenreIds || matchedGenreIds.length === 0) {
            return {
                type: 'genres',
                items: []
            };
        }

        // Find genre names for matched IDs
        const genreItems = matchedGenreIds.map(genreId => {
            const genre = genres.find(g => g.id === genreId);
            return {
                type: 'genre' as const,
                color: 'green' as const,
                content: getGenreIcon(genreId),
                tooltip: genre?.name || ''
            };
        });

        return {
            type: 'genres',
            items: genreItems
        };
    }
}

