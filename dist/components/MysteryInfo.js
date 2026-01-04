import { HintGroup } from './HintGroup.js';
import { YearHint } from './hints/YearHint.js';
import { BudgetHint } from './hints/BudgetHint.js';
import { RevenueHint } from './hints/RevenueHint.js';
import { GenreHint } from './hints/GenreHint.js';
import { CountryHint } from './hints/CountryHint.js';
import { CompanyHint } from './hints/CompanyHint.js';
import { DirectorHint } from './hints/DirectorHint.js';
import { ActorHint } from './hints/ActorHint.js';
export class MysteryInfo {
    constructor(config) {
        this.element = null;
        this.groups = [];
        this.config = config;
    }
    render() {
        const container = document.createElement('div');
        container.className = 'mystery-info guess-card';
        // Header
        const header = document.createElement('div');
        header.className = 'mystery-header';
        const title = document.createElement('div');
        title.className = 'mystery-title';
        title.textContent = 'Tajemniczy film';
        header.appendChild(title);
        container.appendChild(header);
        // Hints row
        const hintsRow = document.createElement('div');
        hintsRow.className = 'hints-row';
        // Create hint groups
        const groupsConfig = this.createGroupsConfig();
        this.groups = groupsConfig.map(groupConfig => {
            const group = new HintGroup(groupConfig);
            const groupElement = group.render();
            hintsRow.appendChild(groupElement);
            return group;
        });
        container.appendChild(hintsRow);
        this.element = container;
        return container;
    }
    createGroupsConfig() {
        const groups = [];
        const allGuesses = this.config.allGuesses;
        if (allGuesses.length === 0) {
            // Empty state
            return [
                { type: 'year', items: [YearHint.create({ comparison: { min: null, max: null } })] },
                { type: 'genres', items: [], emptyContent: 'Gatunki: ?\nbrak danych' },
                { type: 'budget', items: [BudgetHint.create({ comparison: { min: null, max: null } })] },
                { type: 'revenue', items: [RevenueHint.create({ comparison: { min: null, max: null } })] },
                { type: 'companies', items: [], emptyContent: 'Studia: ?\nbrak danych' },
                { type: 'countries', items: [], emptyContent: 'Kraje: ?\nbrak danych' },
                { type: 'director', items: [], emptyContent: 'Reżyser: ?\nbrak danych' },
                { type: 'cast', items: [], emptyContent: 'Aktorzy: ?\nbrak danych' }
            ];
        }
        // Calculate year range based on arrows
        let minYear = null;
        let maxYear = null;
        for (const guess of allGuesses) {
            const year = guess.comparison.year.value;
            if (!year)
                continue;
            const arrow = guess.comparison.year.arrow;
            if (arrow === '=') {
                minYear = year;
                maxYear = year;
                break;
            }
            else if (arrow === '↓' || arrow === '↓↓') {
                // Guessed is newer, so mystery is older (maxYear)
                if (maxYear === null || year < maxYear) {
                    maxYear = year;
                }
            }
            else if (arrow === '↑' || arrow === '↑↑') {
                // Guessed is older, so mystery is newer (minYear)
                if (minYear === null || year > minYear) {
                    minYear = year;
                }
            }
        }
        // Collect matched genres
        const matchedGenresMap = new Map();
        for (const guess of allGuesses) {
            guess.comparison.genres.items.forEach(item => {
                if (item.isMatch && !matchedGenresMap.has(item.name)) {
                    matchedGenresMap.set(item.name, { name: item.name });
                }
            });
        }
        const matchedGenres = Array.from(matchedGenresMap.values());
        // Calculate budget range based on arrows
        let minBudget = null;
        let maxBudget = null;
        for (const guess of allGuesses) {
            const budget = guess.comparison.budget.value;
            if (!budget || budget === 0)
                continue;
            const arrow = guess.comparison.budget.arrow;
            if (arrow === '=') {
                minBudget = budget;
                maxBudget = budget;
                break;
            }
            else if (arrow === '↓' || arrow === '↓↓') {
                // Guessed is higher, so mystery is lower (maxBudget)
                if (maxBudget === null || budget < maxBudget) {
                    maxBudget = budget;
                }
            }
            else if (arrow === '↑' || arrow === '↑↑') {
                // Guessed is lower, so mystery is higher (minBudget)
                if (minBudget === null || budget > minBudget) {
                    minBudget = budget;
                }
            }
        }
        // Calculate revenue range based on arrows
        let minRevenue = null;
        let maxRevenue = null;
        for (const guess of allGuesses) {
            const revenue = guess.comparison.revenue.value;
            if (!revenue || revenue === 0)
                continue;
            const arrow = guess.comparison.revenue.arrow;
            if (arrow === '=') {
                minRevenue = revenue;
                maxRevenue = revenue;
                break;
            }
            else if (arrow === '↓' || arrow === '↓↓') {
                // Guessed is higher, so mystery is lower (maxRevenue)
                if (maxRevenue === null || revenue < maxRevenue) {
                    maxRevenue = revenue;
                }
            }
            else if (arrow === '↑' || arrow === '↑↑') {
                // Guessed is lower, so mystery is higher (minRevenue)
                if (minRevenue === null || revenue > minRevenue) {
                    minRevenue = revenue;
                }
            }
        }
        // Collect matched companies
        const matchedCompaniesMap = new Map();
        for (const guess of allGuesses) {
            guess.comparison.companies.items.forEach(item => {
                if (item.isMatch && !matchedCompaniesMap.has(item.name)) {
                    matchedCompaniesMap.set(item.name, { name: item.name, logo_path: item.logo_path });
                }
            });
        }
        const matchedCompanies = Array.from(matchedCompaniesMap.values());
        // Collect matched countries
        const matchedCountriesMap = new Map();
        for (const guess of allGuesses) {
            guess.comparison.countries.items.forEach(item => {
                if (item.isMatch && !matchedCountriesMap.has(item.name)) {
                    matchedCountriesMap.set(item.name, { name: item.name, iso_3166_1: item.iso_3166_1 });
                }
            });
        }
        const matchedCountries = Array.from(matchedCountriesMap.values());
        // Collect matched cast
        const matchedCastMap = new Map();
        for (const guess of allGuesses) {
            guess.comparison.cast.items.forEach(item => {
                if (item.isMatch && !matchedCastMap.has(item.name)) {
                    matchedCastMap.set(item.name, { name: item.name, profile_path: item.profile_path });
                }
            });
        }
        const matchedCast = Array.from(matchedCastMap.values());
        // Check for matched director
        let matchedDirector = null;
        for (const guess of allGuesses) {
            if (guess.comparison.director.isMatch && guess.movie.director) {
                matchedDirector = guess.movie.director;
                break;
            }
        }
        // Year - single item
        groups.push({
            type: 'year',
            items: [YearHint.create({ comparison: { min: minYear, max: maxYear } })]
        });
        // Genres - multiple items
        const genreItems = matchedGenres.map(genre => GenreHint.create({ genre, isMatch: true }));
        groups.push({
            type: 'genres',
            items: genreItems,
            emptyContent: matchedGenres.length === 0 ? 'Gatunki: ?\nbrak danych' : undefined
        });
        // Budget - single item
        groups.push({
            type: 'budget',
            items: [BudgetHint.create({ comparison: { min: minBudget, max: maxBudget } })]
        });
        // Revenue - single item
        groups.push({
            type: 'revenue',
            items: [RevenueHint.create({ comparison: { min: minRevenue, max: maxRevenue } })]
        });
        // Companies - multiple items
        const companyItems = matchedCompanies.map(company => CompanyHint.create({ company, isMatch: true }));
        groups.push({
            type: 'companies',
            items: companyItems,
            emptyContent: matchedCompanies.length === 0 ? 'Studia: ?\nbrak danych' : undefined
        });
        // Countries - multiple items
        const countryItems = matchedCountries.map(country => CountryHint.create({ country, isMatch: true }));
        groups.push({
            type: 'countries',
            items: countryItems,
            emptyContent: matchedCountries.length === 0 ? 'Kraje: ?\nbrak danych' : undefined
        });
        // Director - single item (if exists)
        if (matchedDirector) {
            groups.push({
                type: 'director',
                items: [DirectorHint.create({ director: matchedDirector, isMatch: true })]
            });
        }
        else {
            groups.push({
                type: 'director',
                items: [],
                emptyContent: 'Reżyser: ?\nbrak danych'
            });
        }
        // Cast - multiple items
        const castItems = matchedCast.map(actor => ActorHint.create({ actor, isMatch: true }));
        groups.push({
            type: 'cast',
            items: castItems,
            emptyContent: matchedCast.length === 0 ? 'Aktorzy: ?\nbrak danych' : undefined
        });
        return groups;
    }
    getElement() {
        return this.element;
    }
    update(config) {
        this.config = { ...this.config, ...config };
        if (this.element) {
            // Re-render
            const newElement = this.render();
            if (this.element.parentNode) {
                this.element.parentNode.replaceChild(newElement, this.element);
            }
            this.element = newElement;
        }
    }
}
//# sourceMappingURL=MysteryInfo.js.map