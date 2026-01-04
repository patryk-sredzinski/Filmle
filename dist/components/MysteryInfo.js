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
                YearHint.createForMystery({ year: '?', minYear: null, maxYear: null }),
                GenreHint.createForMystery({ genres: [], matchedGenreIds: [] }),
                BudgetHint.createForMystery({ budget: 0, minBudget: null, maxBudget: null }),
                RevenueHint.createForMystery({ revenue: 0, minRevenue: null, maxRevenue: null }),
                CompanyHint.createForMystery({ companies: [], matchedCompanyNames: [] }),
                CountryHint.createForMystery({ countries: [], matchedCountryNames: [] }),
                DirectorHint.createForMystery({ director: null, matchedDirectorName: null }),
                ActorHint.createForMystery({ cast: [], matchedActorNames: [] })
            ];
        }
        // Calculate year range
        let minYear = null;
        let maxYear = null;
        for (const guess of allGuesses) {
            const year = guess.movie.release_date ? new Date(guess.movie.release_date).getFullYear() : null;
            if (!year)
                continue;
            const result = guess.comparison.year.result;
            if (result === 'match') {
                minYear = year;
                maxYear = year;
                break;
            }
            else if (result === 'newer' || result === 'much_newer') {
                if (maxYear === null || year < maxYear) {
                    maxYear = year;
                }
            }
            else if (result === 'older' || result === 'much_older') {
                if (minYear === null || year > minYear) {
                    minYear = year;
                }
            }
        }
        // Collect all genres from guesses for genre name lookup
        const allGenres = new Map();
        for (const guess of allGuesses) {
            guess.movie.genres.forEach(genre => {
                if (!allGenres.has(genre.id)) {
                    allGenres.set(genre.id, genre.name);
                }
            });
        }
        // Collect matched genres
        const matchedGenres = new Set();
        for (const guess of allGuesses) {
            guess.comparison.genres.matches.forEach(id => matchedGenres.add(id));
        }
        // Calculate budget range
        let minBudget = null;
        let maxBudget = null;
        for (const guess of allGuesses) {
            const budget = guess.movie.budget || 0;
            if (budget === 0)
                continue;
            const result = guess.comparison.budget.result;
            if (result === 'match') {
                minBudget = budget;
                maxBudget = budget;
                break;
            }
            else if (result === 'higher' || result === 'much_higher') {
                if (maxBudget === null || budget < maxBudget) {
                    maxBudget = budget;
                }
            }
            else if (result === 'lower' || result === 'much_lower') {
                if (minBudget === null || budget > minBudget) {
                    minBudget = budget;
                }
            }
        }
        // Calculate revenue range
        let minRevenue = null;
        let maxRevenue = null;
        for (const guess of allGuesses) {
            const revenue = guess.movie.revenue || 0;
            if (revenue === 0)
                continue;
            const result = guess.comparison.revenue.result;
            if (result === 'match') {
                minRevenue = revenue;
                maxRevenue = revenue;
                break;
            }
            else if (result === 'higher' || result === 'much_higher') {
                if (maxRevenue === null || revenue < maxRevenue) {
                    maxRevenue = revenue;
                }
            }
            else if (result === 'lower' || result === 'much_lower') {
                if (minRevenue === null || revenue > minRevenue) {
                    minRevenue = revenue;
                }
            }
        }
        // Collect matched companies
        const matchedCompanies = new Set();
        for (const guess of allGuesses) {
            guess.comparison.companies.matches.forEach(name => matchedCompanies.add(name));
        }
        // Collect all companies from guesses for logo lookup
        const allCompanies = [];
        for (const guess of allGuesses) {
            guess.movie.production_companies.forEach(company => {
                if (!allCompanies.find(c => c.name === company.name)) {
                    allCompanies.push(company);
                }
            });
        }
        // Collect matched countries
        const matchedCountries = new Set();
        for (const guess of allGuesses) {
            guess.comparison.countries.matches.forEach(name => matchedCountries.add(name));
        }
        // Collect all countries from guesses for flag lookup
        const allCountries = [];
        for (const guess of allGuesses) {
            guess.movie.production_countries.forEach(country => {
                if (!allCountries.find(c => c.name === country.name)) {
                    allCountries.push(country);
                }
            });
        }
        // Collect matched cast
        const matchedCast = new Set();
        for (const guess of allGuesses) {
            guess.comparison.cast.matches.forEach(name => matchedCast.add(name));
        }
        // Check for matched director
        let matchedDirectorName = null;
        let matchedDirectorProfilePath = null;
        for (const guess of allGuesses) {
            if (guess.comparison.director.hasMatch && guess.movie.director) {
                matchedDirectorName = guess.movie.director.name;
                matchedDirectorProfilePath = guess.movie.director.profile_path;
                break;
            }
        }
        // Year
        groups.push(YearHint.createForMystery({
            year: '?',
            minYear,
            maxYear
        }));
        // Genres
        groups.push(GenreHint.createForMystery({
            genres: Array.from(allGenres.entries()).map(([id, name]) => ({ id, name })),
            matchedGenreIds: Array.from(matchedGenres)
        }));
        // Budget
        groups.push(BudgetHint.createForMystery({
            budget: 0,
            minBudget,
            maxBudget
        }));
        // Revenue
        groups.push(RevenueHint.createForMystery({
            revenue: 0,
            minRevenue,
            maxRevenue
        }));
        // Companies
        groups.push(CompanyHint.createForMystery({
            companies: allCompanies,
            matchedCompanyNames: Array.from(matchedCompanies)
        }));
        // Countries
        groups.push(CountryHint.createForMystery({
            countries: allCountries,
            matchedCountryNames: Array.from(matchedCountries)
        }));
        // Director
        groups.push(DirectorHint.createForMystery({
            director: null,
            matchedDirectorName,
            matchedDirectorProfilePath
        }));
        // Cast
        groups.push(ActorHint.createForMystery({
            cast: [],
            matchedActorNames: Array.from(matchedCast),
            allGuesses: allGuesses.map(guess => ({ movie: { top_cast: guess.movie.top_cast } }))
        }));
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