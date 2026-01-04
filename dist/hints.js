// Hint system for the game
export const HINTS = [
    {
        id: 'show_letters',
        name: 'Wyświetl litery',
        description: 'Pokazuje nazwę filmu z podkreśleniami',
        enabled: true,
        used: false
    },
    {
        id: 'reveal_random_letter',
        name: 'Podaj losową literę',
        description: 'Odkrywa losową literę w nazwie filmu',
        enabled: false, // Enabled only after show_letters is used
        used: false
    },
    {
        id: 'reveal_genre',
        name: 'Wyświetl gatunek',
        description: 'Odkrywa jeden z gatunków tajemniczego filmu',
        enabled: true,
        used: false
    },
    {
        id: 'reveal_actor',
        name: 'Wyświetl aktora',
        description: 'Odkrywa jednego z aktorów tajemniczego filmu',
        enabled: true,
        used: false
    }
];
//# sourceMappingURL=hints.js.map