import { HintGroup } from './HintGroup.js';
import { YearHint } from './hints/YearHint.js';
import { BudgetHint } from './hints/BudgetHint.js';
import { RevenueHint } from './hints/RevenueHint.js';
import { GenreHint } from './hints/GenreHint.js';
import { CountryHint } from './hints/CountryHint.js';
import { CompanyHint } from './hints/CompanyHint.js';
import { DirectorHint } from './hints/DirectorHint.js';
import { ActorHint } from './hints/ActorHint.js';
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
        // Year
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 0;
        groups.push(YearHint.createForGuess({
            year,
            comparison: comparison.year
        }));
        // Genres
        groups.push(GenreHint.createForGuess({
            genres: movie.genres,
            comparison: comparison.genres
        }));
        // Budget
        groups.push(BudgetHint.createForGuess({
            budget: movie.budget || 0,
            comparison: comparison.budget
        }));
        // Revenue
        groups.push(RevenueHint.createForGuess({
            revenue: movie.revenue || 0,
            comparison: comparison.revenue
        }));
        // Companies
        groups.push(CompanyHint.createForGuess({
            companies: movie.production_companies,
            comparison: comparison.companies
        }));
        // Countries
        groups.push(CountryHint.createForGuess({
            countries: movie.production_countries,
            comparison: comparison.countries
        }));
        // Director
        groups.push(DirectorHint.createForGuess({
            director: movie.director,
            comparison: comparison.director
        }));
        // Cast
        groups.push(ActorHint.createForGuess({
            cast: movie.top_cast,
            comparison: comparison.cast
        }));
        return groups;
    }
    getElement() {
        return this.element;
    }
}
//# sourceMappingURL=GuessCard.js.map