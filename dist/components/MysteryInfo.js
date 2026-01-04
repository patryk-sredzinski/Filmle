import { HintGroup } from './HintGroup.js';
import { formatCurrencyShort, getGenreIcon, getCompanyInitials, getCountryFlagUrl, getCountryNamePL, getActorInitials } from '../utils.js';
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
                { type: 'year', items: [{ type: 'inner', color: 'neutral', value: '?', arrow: '' }] },
                { type: 'genres', items: [] },
                { type: 'budget', items: [{ type: 'inner', color: 'neutral', icon: '💰', value: '?', arrow: '' }] },
                { type: 'revenue', items: [{ type: 'inner', color: 'neutral', icon: '💵', value: '?', arrow: '' }] },
                { type: 'companies', items: [] },
                { type: 'countries', items: [] },
                { type: 'director', items: [] },
                { type: 'cast', items: [] }
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
        let yearColor = 'neutral';
        let yearValue = '?';
        let yearArrow = '';
        let yearTooltip = '';
        if (minYear !== null && maxYear !== null) {
            if (minYear === maxYear) {
                yearValue = minYear.toString();
                yearArrow = '=';
                yearColor = 'green';
                yearTooltip = `Rok wydania: ${minYear} =\ntajemniczy film ma ten sam rok`;
            }
            else {
                yearValue = `${minYear}<br>-<br>${maxYear}`;
                yearArrow = '';
                yearColor = 'yellow';
                yearTooltip = `Rok wydania: ${minYear}-${maxYear}\ntajemniczy film jest między ${minYear} a ${maxYear}`;
            }
        }
        else if (minYear !== null) {
            yearValue = minYear.toString();
            yearArrow = '↑';
            yearColor = 'yellow';
            yearTooltip = `Rok wydania: >${minYear}\ntajemniczy film jest nowszy niż ${minYear}`;
        }
        else if (maxYear !== null) {
            yearValue = maxYear.toString();
            yearArrow = '↓';
            yearColor = 'yellow';
            yearTooltip = `Rok wydania: <${maxYear}\ntajemniczy film jest starszy niż ${maxYear}`;
        }
        groups.push({
            type: 'year',
            items: [{
                    type: 'inner',
                    color: yearColor,
                    value: yearValue,
                    arrow: yearArrow,
                    tooltip: yearTooltip
                }]
        });
        // Collect matched genres
        const matchedGenres = new Set();
        for (const guess of allGuesses) {
            guess.comparison.genres.matches.forEach(id => matchedGenres.add(id));
        }
        const genreItems = Array.from(matchedGenres).map(genreId => {
            let genreName = '';
            for (const guess of allGuesses) {
                const genre = guess.movie.genres.find(g => g.id === genreId);
                if (genre) {
                    genreName = genre.name;
                    break;
                }
            }
            return {
                type: 'genre',
                color: 'green',
                content: getGenreIcon(genreId),
                tooltip: genreName
            };
        });
        groups.push({
            type: 'genres',
            items: genreItems
        });
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
        let budgetColor = 'neutral';
        let budgetValue = '?';
        let budgetArrow = '';
        let budgetTooltip = '';
        if (minBudget !== null && maxBudget !== null) {
            if (Math.abs(minBudget - maxBudget) / Math.max(minBudget, maxBudget) < 0.1) {
                budgetValue = formatCurrencyShort(minBudget);
                budgetArrow = '=';
                budgetColor = 'green';
                budgetTooltip = `Budżet: ${formatCurrencyShort(minBudget)} =\ntajemniczy film ma ten sam budżet`;
            }
            else {
                budgetValue = `${formatCurrencyShort(minBudget)}<br>-<br>${formatCurrencyShort(maxBudget)}`;
                budgetArrow = '';
                budgetColor = 'yellow';
                budgetTooltip = `Budżet: ${formatCurrencyShort(minBudget)} - ${formatCurrencyShort(maxBudget)}\ntajemniczy film ma budżet między ${formatCurrencyShort(minBudget)} a ${formatCurrencyShort(maxBudget)}`;
            }
        }
        else if (minBudget !== null) {
            budgetValue = formatCurrencyShort(minBudget);
            budgetArrow = '↑';
            budgetColor = 'yellow';
            budgetTooltip = `Budżet: >${formatCurrencyShort(minBudget)}\ntajemniczy film ma większy budżet niż ${formatCurrencyShort(minBudget)}`;
        }
        else if (maxBudget !== null) {
            budgetValue = formatCurrencyShort(maxBudget);
            budgetArrow = '↓';
            budgetColor = 'yellow';
            budgetTooltip = `Budżet: <${formatCurrencyShort(maxBudget)}\ntajemniczy film ma mniejszy budżet niż ${formatCurrencyShort(maxBudget)}`;
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
        let revenueColor = 'neutral';
        let revenueValue = '?';
        let revenueArrow = '';
        let revenueTooltip = '';
        if (minRevenue !== null && maxRevenue !== null) {
            if (Math.abs(minRevenue - maxRevenue) / Math.max(minRevenue, maxRevenue) < 0.1) {
                revenueValue = formatCurrencyShort(minRevenue);
                revenueArrow = '=';
                revenueColor = 'green';
                revenueTooltip = `Box Office: ${formatCurrencyShort(minRevenue)} =\ntajemniczy film ma ten sam przychód`;
            }
            else {
                revenueValue = `${formatCurrencyShort(minRevenue)}<br>-<br>${formatCurrencyShort(maxRevenue)}`;
                revenueArrow = '';
                revenueColor = 'yellow';
                revenueTooltip = `Box Office: ${formatCurrencyShort(minRevenue)} - ${formatCurrencyShort(maxRevenue)}\ntajemniczy film ma przychód między ${formatCurrencyShort(minRevenue)} a ${formatCurrencyShort(maxRevenue)}`;
            }
        }
        else if (minRevenue !== null) {
            revenueValue = formatCurrencyShort(minRevenue);
            revenueArrow = '↑';
            revenueColor = 'yellow';
            revenueTooltip = `Box Office: >${formatCurrencyShort(minRevenue)}\ntajemniczy film ma większy przychód niż ${formatCurrencyShort(minRevenue)}`;
        }
        else if (maxRevenue !== null) {
            revenueValue = formatCurrencyShort(maxRevenue);
            revenueArrow = '↓';
            revenueColor = 'yellow';
            revenueTooltip = `Box Office: <${formatCurrencyShort(maxRevenue)}\ntajemniczy film ma mniejszy przychód niż ${formatCurrencyShort(maxRevenue)}`;
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
        // Collect matched companies
        const matchedCompanies = new Set();
        for (const guess of allGuesses) {
            guess.comparison.companies.matches.forEach(name => matchedCompanies.add(name));
        }
        const companyItems = Array.from(matchedCompanies).slice(0, 3).map(companyName => {
            let logo = null;
            for (const guess of allGuesses) {
                const company = guess.movie.production_companies.find(c => c.name === companyName);
                if (company && company.logo_path) {
                    logo = `https://image.tmdb.org/t/p/w500${company.logo_path}`;
                    break;
                }
            }
            return {
                type: 'logo',
                color: 'green',
                content: getCompanyInitials(companyName),
                tooltip: companyName,
                imageUrl: logo ? logo.replace('w500', 'w780') : undefined
            };
        });
        groups.push({
            type: 'companies',
            items: companyItems
        });
        // Collect matched countries
        const matchedCountries = new Set();
        for (const guess of allGuesses) {
            guess.comparison.countries.matches.forEach(name => matchedCountries.add(name));
        }
        const countryItems = Array.from(matchedCountries).slice(0, 3).map(countryName => {
            let countryCode = '';
            for (const guess of allGuesses) {
                const country = guess.movie.production_countries.find(c => c.name === countryName);
                if (country) {
                    countryCode = country.iso_3166_1;
                    break;
                }
            }
            return {
                type: 'flag',
                color: 'green',
                content: getCountryFlagUrl(countryCode),
                tooltip: getCountryNamePL(countryCode) || countryName
            };
        });
        groups.push({
            type: 'countries',
            items: countryItems
        });
        // Collect matched cast
        const matchedCast = new Set();
        for (const guess of allGuesses) {
            guess.comparison.cast.matches.forEach(name => matchedCast.add(name));
        }
        const castItems = Array.from(matchedCast).slice(0, 3).map(actorName => {
            let profileUrl = null;
            for (const guess of allGuesses) {
                const actor = guess.movie.top_cast.find(a => a.name === actorName);
                if (actor && actor.profile_path) {
                    profileUrl = `https://image.tmdb.org/t/p/w185${actor.profile_path}`;
                    break;
                }
            }
            return {
                type: 'photo',
                color: 'green',
                content: getActorInitials(actorName),
                tooltip: `Aktor: ${actorName}`,
                imageUrl: profileUrl ? profileUrl.replace('w185', 'w500') : undefined
            };
        });
        groups.push({
            type: 'cast',
            items: castItems
        });
        // Check for matched director
        let matchedDirectorName = null;
        for (const guess of allGuesses) {
            if (guess.comparison.director.hasMatch && guess.movie.director) {
                matchedDirectorName = guess.movie.director.name;
                break;
            }
        }
        if (matchedDirectorName) {
            let profileUrl = null;
            for (const guess of allGuesses) {
                if (guess.movie.director && guess.movie.director.name === matchedDirectorName && guess.movie.director.profile_path) {
                    profileUrl = `https://image.tmdb.org/t/p/w185${guess.movie.director.profile_path}`;
                    break;
                }
            }
            groups.push({
                type: 'director',
                items: [{
                        type: 'photo',
                        color: 'green',
                        content: getActorInitials(matchedDirectorName),
                        tooltip: `Reżyser: ${matchedDirectorName}`,
                        imageUrl: profileUrl ? profileUrl.replace('w185', 'w500') : undefined
                    }]
            });
        }
        else {
            groups.push({
                type: 'director',
                items: []
            });
        }
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