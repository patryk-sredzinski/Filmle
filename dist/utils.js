export function formatCurrencyShort(amount) {
    if (amount === 0 || !amount)
        return '?';
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)} MLD $`;
    }
    else if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)} MLN $`;
    }
    else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)} TYS $`;
    }
    return `${amount} $`;
}
const genreIcons = {
    // Polish names
    'Akcja': '💥',
    'Przygoda': '🌍',
    'Animacja': '🎨',
    'Komedia': '😂',
    'Kryminał': '🔫',
    'Dokument': '📺',
    'Dramat': '😢',
    'Familijny': '👨‍👩‍👧',
    'Fantasy': '🧙',
    'Historia': '📜',
    'Horror': '👻',
    'Muzyczny': '🎵',
    'Tajemnica': '🔍',
    'Romans': '💕',
    'Sci-Fi': '🚀',
    'Thriller': '😱',
    'Wojenny': '⚔️',
    'Western': '🤠',
    // English names
    'Action': '💥',
    'Adventure': '🌍',
    'Animation': '🎨',
    'Comedy': '😂',
    'Crime': '🔫',
    'Documentary': '📺',
    'Drama': '😢',
    'Family': '👨‍👩‍👧',
    'History': '📜',
    'Music': '🎵',
    'Mystery': '🔍',
    'Romance': '💕',
    'Science Fiction': '🚀',
    'TV Movie': '📺',
    'War': '⚔️'
};
export function getGenreIcon(genreName) {
    return genreIcons[genreName] || '🎬';
}
export function getCountryFlagUrl(countryCode) {
    if (!countryCode)
        return '';
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}
export function getCountryNamePL(countryCode) {
    if (!countryCode)
        return '';
    try {
        const displayNames = new Intl.DisplayNames(['pl'], { type: 'region' });
        return displayNames.of(countryCode.toUpperCase()) || countryCode;
    }
    catch (e) {
        const countryNames = {
            'US': 'Stany Zjednoczone',
            'GB': 'Wielka Brytania',
            'CA': 'Kanada',
            'AU': 'Australia',
            'DE': 'Niemcy',
            'FR': 'Francja',
            'IT': 'Włochy',
            'ES': 'Hiszpania',
            'PL': 'Polska',
            'JP': 'Japonia',
            'CN': 'Chiny',
            'KR': 'Korea Południowa',
            'IN': 'Indie',
            'BR': 'Brazylia',
            'MX': 'Meksyk',
            'RU': 'Rosja'
        };
        return countryNames[countryCode] || countryCode;
    }
}
export function getActorInitials(name) {
    if (!name)
        return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
export function getCompanyInitials(name) {
    if (!name)
        return '?';
    return name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
}
export function getDirector(movie) {
    if (!movie.crew || movie.crew.length === 0) {
        return null;
    }
    // Try to find director - check multiple possible job values
    const director = movie.crew.find(member => {
        const job = member.job?.toLowerCase() || '';
        return job === 'director' || job === 'directing';
    });
    if (!director) {
        return null;
    }
    return {
        name: director.name,
        profile_path: director.profile_path
    };
}
//# sourceMappingURL=utils.js.map