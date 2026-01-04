import { getActorInitials } from '../../utils.js';
export class ActorHint {
    static createForGuess(config) {
        const { cast, comparison } = config;
        if (!comparison || !comparison.guessedWithOrder) {
            return {
                type: 'cast',
                items: []
            };
        }
        // Use actors from comparison (already sorted: matches first, then non-matches)
        // Limit to max 3, prioritizing matches
        const castItems = comparison.guessedWithOrder.slice(0, 3).map(actorInfo => {
            // Find the actor in cast to get profile_path
            const actor = cast.find(a => a.name === actorInfo.name);
            const profileUrl = actor?.profile_path
                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                : undefined;
            return {
                type: 'photo',
                color: (actorInfo.isMatch ? 'green' : 'red'),
                content: getActorInitials(actorInfo.name),
                tooltip: `Aktor: ${actorInfo.name}`,
                imageUrl: profileUrl
            };
        });
        return {
            type: 'cast',
            items: castItems
        };
    }
    static createForMystery(config) {
        const { matchedActorNames, allGuesses } = config;
        if (!matchedActorNames || matchedActorNames.length === 0) {
            return {
                type: 'cast',
                items: []
            };
        }
        // Find profile paths for matched actors from guesses
        const castItems = matchedActorNames.slice(0, 3).map(actorName => {
            let profileUrl = undefined;
            if (allGuesses) {
                for (const guess of allGuesses) {
                    const actor = guess.movie.top_cast.find(a => a.name === actorName);
                    if (actor && actor.profile_path) {
                        profileUrl = `https://image.tmdb.org/t/p/w500${actor.profile_path}`;
                        break;
                    }
                }
            }
            return {
                type: 'photo',
                color: 'green',
                content: getActorInitials(actorName),
                tooltip: `Aktor: ${actorName}`,
                imageUrl: profileUrl
            };
        });
        return {
            type: 'cast',
            items: castItems
        };
    }
}
//# sourceMappingURL=ActorHint.js.map