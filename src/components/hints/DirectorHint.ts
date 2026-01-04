import { HintItemConfig } from '../HintItem.js';
import { Director } from '../../types.js';
import { getActorInitials } from '../../utils.js';

export interface DirectorHintConfig {
    director: Director;
    isMatch: boolean;
}

export class DirectorHint {
    static create(config: DirectorHintConfig): HintItemConfig {
        const { director, isMatch } = config;
        
        return {
            type: 'photo',
            color: (isMatch ? 'green' : 'red') as 'green' | 'red',
            content: getActorInitials(director.name),
            tooltip: `Reżyser: ${director.name}`,
            imageUrl: director.profile_path ? `https://image.tmdb.org/t/p/w185${director.profile_path}` : undefined
        };
    }
}
