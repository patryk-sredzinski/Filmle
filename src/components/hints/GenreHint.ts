import { HintItemConfig } from '../HintItem.js';
import { Genre } from '../../types.js';
import { getGenreIcon } from '../../utils.js';

export interface GenreHintConfig {
    genre: Genre;
    isMatch: boolean;
}

export class GenreHint {
    static create(config: GenreHintConfig): HintItemConfig {
        const { genre, isMatch } = config;
        
        return {
            type: 'genre',
            color: (isMatch ? 'green' : 'red') as 'green' | 'red',
            content: getGenreIcon(genre.name),
            tooltip: genre.name
        };
    }
}
