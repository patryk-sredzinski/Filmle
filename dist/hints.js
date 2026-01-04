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
        description: 'Odkrywa jednego z aktorów tajemniczego filmu (max 3)',
        enabled: true,
        used: false
    },
    {
        id: 'reveal_director',
        name: 'Wyświetl reżysera',
        description: 'Odkrywa reżysera tajemniczego filmu',
        enabled: true,
        used: false
    },
    {
        id: 'reveal_quote',
        name: 'Wyświetl cytat',
        description: 'Pokazuje cytaty z filmu w wersji polskiej i angielskiej',
        enabled: true,
        used: false
    },
    {
        id: 'reveal_description',
        name: 'Wyświetl opis filmu',
        description: 'Pokazuje opis tajemniczego filmu',
        enabled: true,
        used: false
    }
];
//# sourceMappingURL=hints.js.map