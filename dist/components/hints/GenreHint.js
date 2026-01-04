import { getGenreIcon } from '../../utils.js';
export class GenreHint {
    static createForGuess(config) {
        const { genres, comparison } = config;
        if (!comparison) {
            return {
                type: 'genres',
                items: []
            };
        }
        const genreItems = genres.map(genre => ({
            type: 'genre',
            color: (comparison.matches.includes(genre.id) ? 'green' : 'red'),
            content: getGenreIcon(genre.id),
            tooltip: genre.name
        }));
        return {
            type: 'genres',
            items: genreItems
        };
    }
    static createForMystery(config) {
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
                type: 'genre',
                color: 'green',
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
//# sourceMappingURL=GenreHint.js.map