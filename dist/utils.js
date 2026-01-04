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
    28: '💥', // Akcja
    12: '🌍', // Przygoda
    16: '🎨', // Animacja
    35: '😂', // Komedia
    80: '🔫', // Kryminał
    99: '📺', // Dokument
    18: '😢', // Dramat
    10751: '👨‍👩‍👧', // Familijny
    14: '🧙', // Fantasy
    36: '📜', // Historia
    27: '👻', // Horror
    10402: '🎵', // Muzyczny
    9648: '🔍', // Tajemnica
    10749: '💕', // Romans
    878: '🚀', // Sci-Fi
    10770: '📺', // TV Movie
    53: '😱', // Thriller
    10752: '⚔️', // Wojenny
    37: '🤠' // Western
};
export function getGenreIcon(genreId) {
    return genreIcons[genreId] || '🎬';
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
//# sourceMappingURL=utils.js.map