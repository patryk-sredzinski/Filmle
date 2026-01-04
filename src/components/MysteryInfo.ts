import { HintGroup, HintGroupConfig } from './HintGroup.js';
import { HintItemConfig } from './HintItem.js';
import { Movie, MovieComparison, Genre, ProductionCompany, ProductionCountry, CastMember, Director } from '../types.js';
import { YearHint } from './hints/YearHint.js';
import { BudgetHint } from './hints/BudgetHint.js';
import { RevenueHint } from './hints/RevenueHint.js';
import { GenreHint } from './hints/GenreHint.js';
import { CountryHint } from './hints/CountryHint.js';
import { CompanyHint } from './hints/CompanyHint.js';
import { DirectorHint } from './hints/DirectorHint.js';
import { ActorHint } from './hints/ActorHint.js';

export interface MysteryInfoConfig {
    allGuesses: Array<{ movie: Movie; comparison: MovieComparison }>;
}

export class MysteryInfo {
    private config: MysteryInfoConfig;
    private element: HTMLElement | null = null;
    private groups: HintGroup[] = [];

    constructor(config: MysteryInfoConfig) {
        this.config = config;
    }

    render(): HTMLElement {
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

    private createGroupsConfig(): HintGroupConfig[] {
        const groups: HintGroupConfig[] = [];
        const allGuesses = this.config.allGuesses;

        if (allGuesses.length === 0) {
            // Empty state
            return [
                { type: 'year', items: [YearHint.create({ comparison: { min: null, max: null } })] },
                { type: 'genres', items: [] },
                { type: 'budget', items: [BudgetHint.create({ comparison: { min: null, max: null } })] },
                { type: 'revenue', items: [RevenueHint.create({ comparison: { min: null, max: null } })] },
                { type: 'companies', items: [] },
                { type: 'countries', items: [] },
                { type: 'director', items: [] },
                { type: 'cast', items: [] }
            ];
        }

        // Calculate year range based on arrows
        let minYear: number | null = null;
        let maxYear: number | null = null;
        for (const guess of allGuesses) {
            const year = guess.comparison.year.value;
            if (!year) continue;
            
            const arrow = guess.comparison.year.arrow;
            if (arrow === '=') {
                minYear = year;
                maxYear = year;
                break;
            } else if (arrow === '↓' || arrow === '↓↓') {
                // Guessed is newer, so mystery is older (maxYear)
                if (maxYear === null || year < maxYear) {
                    maxYear = year;
                }
            } else if (arrow === '↑' || arrow === '↑↑') {
                // Guessed is older, so mystery is newer (minYear)
                if (minYear === null || year > minYear) {
                    minYear = year;
                }
            }
        }

        // Collect matched genres
        const matchedGenresMap = new Map<string, Genre>();
        for (const guess of allGuesses) {
            guess.comparison.genres.items.forEach(item => {
                if (item.isMatch && !matchedGenresMap.has(item.name)) {
                    matchedGenresMap.set(item.name, { name: item.name });
                }
            });
        }
        const matchedGenres = Array.from(matchedGenresMap.values());

        // Calculate budget range based on arrows
        let minBudget: number | null = null;
        let maxBudget: number | null = null;
        for (const guess of allGuesses) {
            const budget = guess.comparison.budget.value;
            if (!budget || budget === 0) continue;
            
            const arrow = guess.comparison.budget.arrow;
            if (arrow === '=') {
                minBudget = budget;
                maxBudget = budget;
                break;
            } else if (arrow === '↓' || arrow === '↓↓') {
                // Guessed is higher, so mystery is lower (maxBudget)
                if (maxBudget === null || budget < maxBudget) {
                    maxBudget = budget;
                }
            } else if (arrow === '↑' || arrow === '↑↑') {
                // Guessed is lower, so mystery is higher (minBudget)
                if (minBudget === null || budget > minBudget) {
                    minBudget = budget;
                }
            }
        }

        // Calculate revenue range based on arrows
        let minRevenue: number | null = null;
        let maxRevenue: number | null = null;
        for (const guess of allGuesses) {
            const revenue = guess.comparison.revenue.value;
            if (!revenue || revenue === 0) continue;
            
            const arrow = guess.comparison.revenue.arrow;
            if (arrow === '=') {
                minRevenue = revenue;
                maxRevenue = revenue;
                break;
            } else if (arrow === '↓' || arrow === '↓↓') {
                // Guessed is higher, so mystery is lower (maxRevenue)
                if (maxRevenue === null || revenue < maxRevenue) {
                    maxRevenue = revenue;
                }
            } else if (arrow === '↑' || arrow === '↑↑') {
                // Guessed is lower, so mystery is higher (minRevenue)
                if (minRevenue === null || revenue > minRevenue) {
                    minRevenue = revenue;
                }
            }
        }

        // Collect matched companies
        const matchedCompaniesMap = new Map<string, ProductionCompany>();
        for (const guess of allGuesses) {
            guess.comparison.companies.items.forEach(item => {
                if (item.isMatch && !matchedCompaniesMap.has(item.name)) {
                    matchedCompaniesMap.set(item.name, { name: item.name, logo_path: item.logo_path });
                }
            });
        }
        const matchedCompanies = Array.from(matchedCompaniesMap.values());

        // Collect matched countries
        const matchedCountriesMap = new Map<string, ProductionCountry>();
        for (const guess of allGuesses) {
            guess.comparison.countries.items.forEach(item => {
                if (item.isMatch && !matchedCountriesMap.has(item.name)) {
                    matchedCountriesMap.set(item.name, { name: item.name, iso_3166_1: item.iso_3166_1 });
                }
            });
        }
        const matchedCountries = Array.from(matchedCountriesMap.values());

        // Collect matched cast
        const matchedCastMap = new Map<string, CastMember>();
        for (const guess of allGuesses) {
            guess.comparison.cast.items.forEach(item => {
                if (item.isMatch && !matchedCastMap.has(item.name)) {
                    matchedCastMap.set(item.name, { name: item.name, profile_path: item.profile_path });
                }
            });
        }
        const matchedCast = Array.from(matchedCastMap.values());

        // Check for matched director
        let matchedDirector: Director | null = null;
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
        const genreItems = matchedGenres.map(genre => 
            GenreHint.create({ genre, isMatch: true })
        );
        groups.push({
            type: 'genres',
            items: genreItems
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
        const companyItems = matchedCompanies.map(company => 
            CompanyHint.create({ company, isMatch: true })
        );
        groups.push({
            type: 'companies',
            items: companyItems
        });

        // Countries - multiple items
        const countryItems = matchedCountries.map(country => 
            CountryHint.create({ country, isMatch: true })
        );
        groups.push({
            type: 'countries',
            items: countryItems
        });

        // Director - single item (if exists)
        if (matchedDirector) {
            groups.push({
                type: 'director',
                items: [DirectorHint.create({ director: matchedDirector, isMatch: true })]
            });
        } else {
            groups.push({
                type: 'director',
                items: []
            });
        }

        // Cast - multiple items
        const castItems = matchedCast.map(actor => 
            ActorHint.create({ actor, isMatch: true })
        );
        groups.push({
            type: 'cast',
            items: castItems
        });

        return groups;
    }


    getElement(): HTMLElement | null {
        return this.element;
    }

    update(config: Partial<MysteryInfoConfig>): void {
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

