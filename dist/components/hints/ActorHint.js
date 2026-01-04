import { getActorInitials } from '../../utils.js';
export class ActorHint {
    static create(config) {
        const { actor, isMatch } = config;
        return {
            type: 'photo',
            color: (isMatch ? 'green' : 'red'),
            content: getActorInitials(actor.name),
            tooltip: `Aktor: ${actor.name}`,
            imageUrl: actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : undefined
        };
    }
}
//# sourceMappingURL=ActorHint.js.map