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
        // Quote section (if revealed)
        if (this.config.hintState.showQuote && this.config.mysteryMovie) {
            const quoteSection = document.createElement('div');
            quoteSection.className = 'mystery-quote-section';
            const quoteTitle = document.createElement('div');
            quoteTitle.className = 'mystery-section-title';
            quoteTitle.textContent = 'Cytaty';
            quoteSection.appendChild(quoteTitle);
            const quotesContainer = document.createElement('div');
            quotesContainer.className = 'mystery-quotes';
            if (this.config.mysteryMovie.quote_pl) {
                const quotePl = document.createElement('div');
                quotePl.className = 'mystery-quote';
                quotePl.innerHTML = `<strong>PL:</strong> "${this.config.mysteryMovie.quote_pl}"`;
                quotesContainer.appendChild(quotePl);
            }
            if (this.config.mysteryMovie.quote_en) {
                const quoteEn = document.createElement('div');
                quoteEn.className = 'mystery-quote';
                quoteEn.innerHTML = `<strong>EN:</strong> "${this.config.mysteryMovie.quote_en}"`;
                quotesContainer.appendChild(quoteEn);
            }
            quoteSection.appendChild(quotesContainer);
            container.appendChild(quoteSection);
        }
        // Description section (if revealed)
        if (this.config.hintState.showDescription && this.config.mysteryMovie?.description) {
            const descriptionSection = document.createElement('div');
            descriptionSection.className = 'mystery-description-section';
            const descriptionTitle = document.createElement('div');
            descriptionTitle.className = 'mystery-section-title';
            descriptionTitle.textContent = 'Opis filmu';
            descriptionSection.appendChild(descriptionTitle);
            const descriptionText = document.createElement('div');
            descriptionText.className = 'mystery-description';
            descriptionText.textContent = this.config.mysteryMovie.description;
            descriptionSection.appendChild(descriptionText);
            container.appendChild(descriptionSection);
        }
        this.element = container;
        return container;
    }
    createGroupsConfig() {
        const groups = [];
        const allGuesses = this.config.allGuesses;
        if (allGuesses.length === 0) {
            // Empty state - but check for revealed hints
            const revealedGenres = [];
            if (this.config.mysteryMovie) {
                this.config.mysteryMovie.genres.forEach((genre, index) => {
                    if (this.config.hintState.revealedGenres.has(index)) {
                        revealedGenres.push(genre);
                    }
                });
            }
            const revealedActors = [];
            if (this.config.mysteryMovie) {
                const cast = this.config.mysteryMovie.top_cast || this.config.mysteryMovie.cast || [];
                cast.forEach((actor, index) => {
                    if (this.config.hintState.revealedActors.has(index)) {
                        revealedActors.push(actor);
                    }
                });
            }
            return [
                { type: 'year', items: [YearHint.create({ comparison: { min: null, max: null } })] },
                {
                    type: 'genres',
                    items: revealedGenres.map(genre => GenreHint.create({ genre, isMatch: true })),
                    emptyContent: revealedGenres.length === 0 ? 'Gatunki: ?\nbrak danych' : undefined
                },
                { type: 'budget', items: [BudgetHint.create({ comparison: { min: null, max: null } })] },
                { type: 'revenue', items: [RevenueHint.create({ comparison: { min: null, max: null } })] },
                { type: 'companies', items: [], emptyContent: 'Studia: ?\nbrak danych' },
                { type: 'countries', items: [], emptyContent: 'Kraje: ?\nbrak danych' },
                { type: 'director', items: [], emptyContent: 'Reżyser: ?\nbrak danych' },
                {
                    type: 'cast',
                    items: revealedActors.map(actor => ActorHint.create({ actor, isMatch: true })),
                    emptyContent: revealedActors.length === 0 ? 'Aktorzy: ?\nbrak danych' : undefined
                }
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
        // Add revealed genres from hints
        if (this.config.mysteryMovie) {
            this.config.mysteryMovie.genres.forEach((genre, index) => {
                if (this.config.hintState.revealedGenres.has(index)) {
                    matchedGenresMap.set(genre.name, genre);
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
        // Add revealed actors from hints
        if (this.config.mysteryMovie) {
            const cast = this.config.mysteryMovie.top_cast || this.config.mysteryMovie.cast || [];
            cast.forEach((actor, index) => {
                if (this.config.hintState.revealedActors.has(index)) {
                    matchedCastMap.set(actor.name, actor);
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