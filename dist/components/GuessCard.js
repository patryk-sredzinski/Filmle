import { HintGroup } from './HintGroup.js';
import { YearHint } from './hints/YearHint.js';
import { BudgetHint } from './hints/BudgetHint.js';
import { RevenueHint } from './hints/RevenueHint.js';
import { GenreHint } from './hints/GenreHint.js';
import { CountryHint } from './hints/CountryHint.js';
import { CompanyHint } from './hints/CompanyHint.js';
import { DirectorHint } from './hints/DirectorHint.js';
import { ActorHint } from './hints/ActorHint.js';
import { getDirector } from '../utils.js';
export class GuessCard {
    constructor(config) {
        this.element = null;
        this.groups = [];
        this.config = config;
    }
    render() {
        const card = document.createElement('div');
        card.className = 'guess-card';
        // Header with poster and title
        const header = document.createElement('div');
        header.className = 'guess-header';
        const posterUrl = this.config.movie.poster_path
            ? `https://image.tmdb.org/t/p/w154${this.config.movie.poster_path}`
            : '';
        if (posterUrl) {
            const poster = document.createElement('img');
            poster.src = posterUrl;
            poster.alt = this.config.movie.title;
            poster.className = 'guess-poster';
            poster.onerror = () => {
                poster.style.display = 'none';
            };
            header.appendChild(poster);
        }
        const title = document.createElement('div');
        title.className = 'guess-title';
        title.textContent = this.config.movie.title;
        header.appendChild(title);
        card.appendChild(header);
        // Hints row
        const hintsRow = document.createElement('div');
        hintsRow.className = 'hints-row';
        // Create hint groups from comparison
        const groupsConfig = this.createGroupsConfig();
        this.groups = groupsConfig.map(groupConfig => {
            const group = new HintGroup(groupConfig);
            const groupElement = group.render();
            hintsRow.appendChild(groupElement);
            return group;
        });
        card.appendChild(hintsRow);
        this.element = card;
        return card;
    }
    createGroupsConfig() {
        const movie = this.config.movie;
        const comparison = this.config.comparison;
        const groups = [];
        // Year - single item
        groups.push({
            type: 'year',
            items: [YearHint.create({ comparison: comparison.year })]
        });
        // Genres - multiple items
        const genreItems = comparison.genres.items.map(item => {
            const genre = movie.genres.find(g => g.name === item.name);
            if (!genre)
                return null;
            return GenreHint.create({ genre, isMatch: item.isMatch });
        }).filter((item) => item !== null);
        groups.push({
            type: 'genres',
            items: genreItems
        });
        // Budget - single item
        groups.push({
            type: 'budget',
            items: [BudgetHint.create({ comparison: comparison.budget })]
        });
        // Revenue - single item
        groups.push({
            type: 'revenue',
            items: [RevenueHint.create({ comparison: comparison.revenue })]
        });
        // Companies - multiple items
        const companyItems = comparison.companies.items.map(item => {
            const company = movie.production_companies.find(c => c.name === item.name);
            if (!company)
                return null;
            return CompanyHint.create({ company, isMatch: item.isMatch });
        }).filter((item) => item !== null);
        groups.push({
            type: 'companies',
            items: companyItems
        });
        // Countries - multiple items
        const countryItems = comparison.countries.items.map(item => {
            const country = movie.production_countries.find(c => c.name === item.name);
            if (!country)
                return null;
            return CountryHint.create({ country, isMatch: item.isMatch });
        }).filter((item) => item !== null);
        groups.push({
            type: 'countries',
            items: countryItems
        });
        // Director - single item (if exists)
        const director = getDirector(movie);
        if (director) {
            groups.push({
                type: 'director',
                items: [DirectorHint.create({ director, isMatch: comparison.director.isMatch })]
            });
        }
        else {
            groups.push({
                type: 'director',
                items: []
            });
        }
        // Cast - multiple items
        const castItems = comparison.cast.items.map(item => {
            return ActorHint.create({
                actor: { name: item.name, profile_path: item.profile_path },
                isMatch: item.isMatch
            });
        });
        groups.push({
            type: 'cast',
            items: castItems
        });
        return groups;
    }
    getElement() {
        return this.element;
    }
}
//# sourceMappingURL=GuessCard.js.map