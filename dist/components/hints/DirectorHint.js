import { getActorInitials } from '../../utils.js';
export class DirectorHint {
    static create(config) {
        const { director, isMatch } = config;
        return {
            type: 'photo',
            color: (isMatch ? 'green' : 'red'),
            content: getActorInitials(director.name),
            tooltip: `Reżyser: ${director.name}`,
            imageUrl: director.profile_path ? `https://image.tmdb.org/t/p/w185${director.profile_path}` : undefined
        };
    }
}
//# sourceMappingURL=DirectorHint.js.map