import { getGenreIcon } from '../../utils.js';
export class GenreHint {
    static create(config) {
        const { genre, isMatch } = config;
        return {
            type: 'genre',
            color: (isMatch ? 'green' : 'red'),
            content: getGenreIcon(genre.name),
            tooltip: genre.name
        };
    }
}
//# sourceMappingURL=GenreHint.js.map