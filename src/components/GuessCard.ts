import { HintGroup, HintGroupConfig } from './HintGroup.js';
import { Movie, MovieComparison } from '../types.js';
import { formatCurrencyShort, getGenreIcon, getCompanyInitials, getCountryFlagUrl, getCountryNamePL, getActorInitials } from '../utils.js';

export interface GuessCardConfig {
    movie: Movie;
    comparison: MovieComparison;
}

export class GuessCard {
    private config: GuessCardConfig;
    private element: HTMLElement | null = null;
    private groups: HintGroup[] = [];

    constructor(config: GuessCardConfig) {
        this.config = config;
    }

    render(): HTMLElement {
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

    private createGroupsConfig(): HintGroupConfig[] {
        const movie = this.config.movie;
        const comparison = this.config.comparison;
        const groups: HintGroupConfig[] = [];

        // Year
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '?';
        let yearColor: 'green' | 'yellow' | 'red' | 'neutral' = 'red';
        let yearArrow = '';
        let yearTooltip = '';
        
        if (comparison.year.result === 'unknown') {
            yearColor = 'neutral';
            yearArrow = '?';
            yearTooltip = `Rok wydania: ${year} ?\nbrak danych`;
        } else if (comparison.year.result === 'match') {
            yearColor = 'green';
            yearArrow = '=';
            yearTooltip = `Rok wydania: ${year} =\ntajemniczy film ma ten sam rok`;
        } else if (comparison.year.result === 'much_newer') {
            yearColor = 'red';
            yearArrow = '↓↓';
            yearTooltip = `Rok wydania: ${year} ↓↓\ntajemniczy film jest dużo starszy`;
        } else if (comparison.year.result === 'newer') {
            yearColor = 'yellow';
            yearArrow = '↓';
            yearTooltip = `Rok wydania: ${year} ↓\ntajemniczy film jest starszy`;
        } else if (comparison.year.result === 'older') {
            yearColor = 'yellow';
            yearArrow = '↑';
            yearTooltip = `Rok wydania: ${year} ↑\ntajemniczy film jest nowszy`;
        } else if (comparison.year.result === 'much_older') {
            yearColor = 'red';
            yearArrow = '↑↑';
            yearTooltip = `Rok wydania: ${year} ↑↑\ntajemniczy film jest dużo nowszy`;
        }

        groups.push({
            type: 'year',
            items: [{
                type: 'inner',
                color: yearColor,
                value: year.toString(),
                arrow: yearArrow,
                tooltip: yearTooltip
            }]
        });

        // Genres
        const genreItems = movie.genres.map(genre => ({
            type: 'genre' as const,
            color: (comparison.genres.matches.includes(genre.id) ? 'green' : 'red') as 'green' | 'red',
            content: getGenreIcon(genre.id),
            tooltip: genre.name
        }));

        groups.push({
            type: 'genres',
            items: genreItems
        });

        // Budget
        const budgetValue = formatCurrencyShort(movie.budget || 0);
        let budgetColor: 'green' | 'yellow' | 'red' | 'neutral' = 'red';
        let budgetArrow = '';
        let budgetTooltip = '';
        
        if (comparison.budget.result === 'unknown') {
            budgetColor = 'neutral';
            budgetArrow = '?';
            budgetTooltip = `Budżet: ${budgetValue} ?\nbrak danych`;
        } else if (comparison.budget.result === 'match') {
            budgetColor = 'green';
            budgetArrow = '=';
            budgetTooltip = `Budżet: ${budgetValue} =\ntajemniczy film ma ten sam budżet`;
        } else if (comparison.budget.result === 'much_higher') {
            budgetColor = 'red';
            budgetArrow = '↓↓';
            budgetTooltip = `Budżet: ${budgetValue} ↓↓\ntajemniczy film ma dużo mniejszy budżet`;
        } else if (comparison.budget.result === 'higher') {
            budgetColor = 'yellow';
            budgetArrow = '↓';
            budgetTooltip = `Budżet: ${budgetValue} ↓\ntajemniczy film ma mniejszy budżet`;
        } else if (comparison.budget.result === 'lower') {
            budgetColor = 'yellow';
            budgetArrow = '↑';
            budgetTooltip = `Budżet: ${budgetValue} ↑\ntajemniczy film ma większy budżet`;
        } else if (comparison.budget.result === 'much_lower') {
            budgetColor = 'red';
            budgetArrow = '↑↑';
            budgetTooltip = `Budżet: ${budgetValue} ↑↑\ntajemniczy film ma dużo większy budżet`;
        }

        groups.push({
            type: 'budget',
            items: [{
                type: 'inner',
                color: budgetColor,
                icon: '💰',
                value: budgetValue,
                arrow: budgetArrow,
                tooltip: budgetTooltip
            }]
        });

        // Revenue
        const revenueValue = formatCurrencyShort(movie.revenue || 0);
        let revenueColor: 'green' | 'yellow' | 'red' | 'neutral' = 'red';
        let revenueArrow = '';
        let revenueTooltip = '';
        
        if (comparison.revenue.result === 'unknown') {
            revenueColor = 'neutral';
            revenueArrow = '?';
            revenueTooltip = `Box Office: ${revenueValue} ?\nbrak danych`;
        } else if (comparison.revenue.result === 'match') {
            revenueColor = 'green';
            revenueArrow = '=';
            revenueTooltip = `Box Office: ${revenueValue} =\ntajemniczy film ma ten sam przychód`;
        } else if (comparison.revenue.result === 'much_higher') {
            revenueColor = 'red';
            revenueArrow = '↓↓';
            revenueTooltip = `Box Office: ${revenueValue} ↓↓\ntajemniczy film ma dużo mniejszy przychód`;
        } else if (comparison.revenue.result === 'higher') {
            revenueColor = 'yellow';
            revenueArrow = '↓';
            revenueTooltip = `Box Office: ${revenueValue} ↓\ntajemniczy film ma mniejszy przychód`;
        } else if (comparison.revenue.result === 'lower') {
            revenueColor = 'yellow';
            revenueArrow = '↑';
            revenueTooltip = `Box Office: ${revenueValue} ↑\ntajemniczy film ma większy przychód`;
        } else if (comparison.revenue.result === 'much_lower') {
            revenueColor = 'red';
            revenueArrow = '↑↑';
            revenueTooltip = `Box Office: ${revenueValue} ↑↑\ntajemniczy film ma dużo większy przychód`;
        }

        groups.push({
            type: 'revenue',
            items: [{
                type: 'inner',
                color: revenueColor,
                icon: '💵',
                value: revenueValue,
                arrow: revenueArrow,
                tooltip: revenueTooltip
            }]
        });

        // Companies
        const companyItems = movie.production_companies.map(company => ({
            type: 'logo' as const,
            color: (comparison.companies.matches.includes(company.name) ? 'green' : 'red') as 'green' | 'red',
            content: getCompanyInitials(company.name),
            tooltip: company.name,
            imageUrl: company.logo_path ? `https://image.tmdb.org/t/p/w500${company.logo_path}` : undefined
        }));

        groups.push({
            type: 'companies',
            items: companyItems
        });

        // Countries
        const countryItems = movie.production_countries.map(country => ({
            type: 'flag' as const,
            color: (comparison.countries.matches.includes(country.name) ? 'green' : 'red') as 'green' | 'red',
            content: getCountryFlagUrl(country.iso_3166_1),
            tooltip: getCountryNamePL(country.iso_3166_1) || country.name
        }));

        groups.push({
            type: 'countries',
            items: countryItems
        });

        // Director
        if (movie.director) {
            groups.push({
                type: 'director',
                items: [{
                    type: 'photo',
                    color: (comparison.director.hasMatch ? 'green' : 'red') as 'green' | 'red',
                    content: getActorInitials(movie.director?.name || null),
                    tooltip: `Reżyser: ${movie.director.name}`,
                    imageUrl: movie.director.profile_path ? `https://image.tmdb.org/t/p/w185${movie.director.profile_path}` : undefined
                }]
            });
        } else {
            groups.push({
                type: 'director',
                items: []
            });
        }

        // Cast - use actors from comparison (already sorted: matches first, then non-matches)
        // Limit to max 3, prioritizing matches
        const castItems = comparison.cast.guessedWithOrder.slice(0, 3).map(actorInfo => {
            // Find the actor in movie.top_cast to get profile_path
            const actor = movie.top_cast.find(a => a.name === actorInfo.name);
            const profileUrl = actor?.profile_path 
                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                : undefined;
            return {
                type: 'photo' as const,
                color: (actorInfo.isMatch ? 'green' : 'red') as 'green' | 'red',
                content: getActorInitials(actorInfo.name),
                tooltip: `Aktor: ${actorInfo.name}`,
                imageUrl: profileUrl
            };
        });

        groups.push({
            type: 'cast',
            items: castItems
        });

        return groups;
    }


    getElement(): HTMLElement | null {
        return this.element;
    }
}

