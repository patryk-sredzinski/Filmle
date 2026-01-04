import { getActorInitials } from '../../utils.js';
export class DirectorHint {
    static createForGuess(config) {
        const { director, comparison } = config;
        if (!director) {
            return {
                type: 'director',
                items: []
            };
        }
        const hasMatch = comparison?.hasMatch || false;
        return {
            type: 'director',
            items: [{
                    type: 'photo',
                    color: (hasMatch ? 'green' : 'red'),
                    content: getActorInitials(director.name),
                    tooltip: `Reżyser: ${director.name}`,
                    imageUrl: director.profile_path ? `https://image.tmdb.org/t/p/w185${director.profile_path}` : undefined
                }]
        };
    }
    static createForMystery(config) {
        const { matchedDirectorName, matchedDirectorProfilePath } = config;
        if (!matchedDirectorName) {
            return {
                type: 'director',
                items: []
            };
        }
        const profileUrl = matchedDirectorProfilePath
            ? `https://image.tmdb.org/t/p/w500${matchedDirectorProfilePath}`
            : undefined;
        return {
            type: 'director',
            items: [{
                    type: 'photo',
                    color: 'green',
                    content: getActorInitials(matchedDirectorName),
                    tooltip: `Reżyser: ${matchedDirectorName}`,
                    imageUrl: profileUrl
                }]
        };
    }
}
//# sourceMappingURL=DirectorHint.js.map