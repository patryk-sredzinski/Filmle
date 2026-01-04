import { HintItemConfig } from '../HintItem.js';
import { CastMember } from '../../types.js';
import { getActorInitials } from '../../utils.js';

export interface ActorHintConfig {
    actor: CastMember;
    isMatch: boolean;
}

export class ActorHint {
    static create(config: ActorHintConfig): HintItemConfig {
        const { actor, isMatch } = config;
        
        return {
            type: 'photo',
            color: (isMatch ? 'green' : 'red') as 'green' | 'red',
            content: getActorInitials(actor.name),
            tooltip: `Aktor: ${actor.name}`,
            imageUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : undefined
        };
    }
}
