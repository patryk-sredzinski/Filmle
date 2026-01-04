import { t } from './translations/index.js';
// Game state
let mysteryMovie = null;
let attempts = 0;
let gameWon = false;
// Language state
let currentLanguage = localStorage.getItem('language') || 'pl';
// API base URL
const API_BASE = 'https://filmle-api-git-main-patryk-sredzinskis-projects.vercel.app/api';
// Global variable to track tooltip state
let tooltipState = {
    sourceElement: null,
    hideTimeout: null
};
// Transform raw API response to Movie format
function transformMovieResponse(rawMovie) {
    // Extract all cast members (sorted by order)
    const sortedCast = [...rawMovie.cast]
        .sort((a, b) => a.order - b.order);
    const topCast = sortedCast.map(member => ({
        name: member.name,
        profile_path: member.profile_path
    }));
    // Extract director from crew
    const directorMember = rawMovie.crew.find(member => member.job === 'Director' && member.department === 'Directing');
    const director = directorMember ? {
        name: directorMember.name,
        profile_path: directorMember.profile_path
    } : null;
    return {
        id: rawMovie.id,
        title: rawMovie.title,
        original_title: rawMovie.original_title,
        release_date: rawMovie.release_date,
        poster_path: rawMovie.poster_path,
        genres: rawMovie.genres || [],
        budget: rawMovie.budget || 0,
        revenue: rawMovie.revenue || 0,
        production_companies: rawMovie.production_companies || [],
        production_countries: rawMovie.production_countries || [],
        top_cast: topCast,
        director: director
    };
}
// DOM elements
const movieSearch = document.getElementById('movieSearch');
const autocomplete = document.getElementById('autocomplete');
const guessesContainer = document.getElementById('guesses');
let attemptsCounter = document.getElementById('attempts');
const winMessage = document.getElementById('winMessage');
let winAttempts = document.getElementById('winAttempts');
const movieTitleHint = document.getElementById('movieTitleHint');
const languageLabel = document.getElementById('languageLabel');
const langPL = document.getElementById('langPL');
const langEN = document.getElementById('langEN');
// Initialize game
async function init() {
    // Track mouse position globally for tooltip detection
    document.addEventListener('mousemove', (e) => {
        if (tooltipState.sourceElement) {
            const tooltip = document.getElementById('customTooltip');
            if (tooltip && tooltip.style.visibility != 'hidden') {
                const x = e.clientX;
                const y = e.clientY;
                const elementRect = tooltipState.sourceElement.getBoundingClientRect();
                const isOverElement = x >= elementRect.left && x <= elementRect.right &&
                    y >= elementRect.top && y <= elementRect.bottom;
                const tooltipRect = tooltip.getBoundingClientRect();
                const isOverTooltip = x >= tooltipRect.left && x <= tooltipRect.right &&
                    y >= tooltipRect.top && y <= tooltipRect.bottom;
                if (!isOverElement && !isOverTooltip) {
                    if (tooltipState.hideTimeout) {
                        clearTimeout(tooltipState.hideTimeout);
                    }
                    tooltipState.hideTimeout = window.setTimeout(() => {
                        hideTooltip();
                    }, 50);
                }
                else {
                    if (tooltipState.hideTimeout) {
                        clearTimeout(tooltipState.hideTimeout);
                        tooltipState.hideTimeout = null;
                    }
                }
            }
        }
    });
    setupEventListeners();
    setupLanguageSwitcher();
    updateLanguage();
    await startNewGame();
}
// Setup language switcher
function setupLanguageSwitcher() {
    if (!langPL || !langEN || !languageLabel)
        return;
    langPL.addEventListener('click', () => {
        currentLanguage = 'pl';
        localStorage.setItem('language', 'pl');
        updateLanguage();
    });
    langEN.addEventListener('click', () => {
        currentLanguage = 'en';
        localStorage.setItem('language', 'en');
        updateLanguage();
    });
    // Update active button
    updateLanguageButtons();
}
function updateLanguageButtons() {
    if (!langPL || !langEN)
        return;
    langPL.classList.toggle('active', currentLanguage === 'pl');
    langEN.classList.toggle('active', currentLanguage === 'en');
}
// Update all UI texts based on current language
function updateLanguage() {
    if (!movieSearch || !attemptsCounter || !winMessage || !movieTitleHint || !languageLabel)
        return;
    // Update header
    const header = document.querySelector('header h1');
    const subtitle = document.querySelector('header .subtitle');
    if (header)
        header.textContent = t('title', currentLanguage);
    if (subtitle)
        subtitle.textContent = t('subtitle', currentLanguage);
    // Update search placeholder
    movieSearch.placeholder = t('searchPlaceholder', currentLanguage);
    // Update attempts label
    const attemptsLabel = document.querySelector('.attempts-counter span');
    if (attemptsLabel) {
        attemptsLabel.innerHTML = `${t('attempts', currentLanguage)}: <strong id="attempts">${attempts}</strong>`;
        // Re-get the counter after innerHTML update
        const newCounter = document.getElementById('attempts');
        if (newCounter)
            attemptsCounter = newCounter;
    }
    // Update language switcher
    languageLabel.textContent = t('language', currentLanguage) + ':';
    // Update win message if visible
    if (!winMessage.classList.contains('hidden')) {
        const winTitle = winMessage.querySelector('h2');
        const winText = winMessage.querySelector('p');
        if (winTitle)
            winTitle.textContent = t('congratulations', currentLanguage);
        if (winText) {
            winText.innerHTML = `${t('winMessage', currentLanguage)} <strong id="winAttempts">${attempts}</strong> ${t('attemptsText', currentLanguage)}!`;
            const newWinAttempts = document.getElementById('winAttempts');
            if (newWinAttempts)
                winAttempts = newWinAttempts;
        }
    }
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
    updateLanguageButtons();
}
// Setup event listeners
function setupEventListeners() {
    if (!movieSearch || !autocomplete)
        return;
    movieSearch.addEventListener('input', handleSearchInput);
    movieSearch.addEventListener('keydown', handleSearchKeydown);
    document.addEventListener('click', (e) => {
        const target = e.target;
        if (!movieSearch.contains(target) && !autocomplete.contains(target)) {
            autocomplete.classList.remove('show');
        }
    });
}
// Start a new game
async function startNewGame() {
    if (!movieSearch || !attemptsCounter || !guessesContainer || !winMessage || !movieTitleHint)
        return;
    try {
        const response = await fetch(`${API_BASE}/mystery_movie`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        // Handle format with or without date wrapper
        const rawMovie = 'date' in rawData ? rawData.movie : rawData.movie;
        mysteryMovie = transformMovieResponse(rawMovie);
        console.log(mysteryMovie);
    }
    catch (error) {
        console.error('Error fetching mystery movie:', error);
        alert(t('errorLoadingMystery', currentLanguage));
        movieSearch.disabled = true;
        return;
    }
    attempts = 0;
    gameWon = false;
    attemptsCounter.textContent = attempts.toString();
    guessesContainer.innerHTML = '';
    winMessage.classList.add('hidden');
    movieSearch.value = '';
    movieSearch.disabled = false;
    movieSearch.focus();
    updateMovieTitleHint();
}
// Generate underscores hint for movie title
function updateMovieTitleHint() {
    if (!mysteryMovie || !movieTitleHint)
        return;
    const title = mysteryMovie.title || mysteryMovie.original_title || '';
    const hint = title
        .split('')
        .map(char => {
        if (char === ' ') {
            return ' ';
        }
        else {
            return '_';
        }
    })
        .join(' ');
    movieTitleHint.textContent = hint;
}
// Handle search input
async function handleSearchInput(e) {
    if (!autocomplete)
        return;
    const target = e.target;
    const query = target.value.trim();
    if (query.length < 2) {
        autocomplete.classList.remove('show');
        return;
    }
    try {
        const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        displayAutocomplete(data.results);
    }
    catch (error) {
        console.error('Error searching movies:', error);
        autocomplete.classList.remove('show');
    }
}
// Display autocomplete suggestions
function displayAutocomplete(matches) {
    if (!autocomplete)
        return;
    // 1. Filter out movies without posters first
    const matchesWithPosters = matches.filter(movie => movie.poster_path);
    if (!matchesWithPosters || matchesWithPosters.length === 0) {
        autocomplete.classList.remove('show');
        return;
    }
    // 2. Use the filtered list for the rest of the function
    autocomplete.innerHTML = matchesWithPosters.slice(0, 10).map(movie => {
        const posterUrl = `https://image.tmdb.org/t/p/w92${movie.poster_path}`;
        return `
        <div class="autocomplete-item" data-id="${movie.id}">
            <img src="${posterUrl}" alt="${movie.title}" class="autocomplete-poster" onerror="this.style.display='none'">
            <div class="autocomplete-text">
                <strong>${movie.title}</strong>
                ${movie.original_title !== movie.title ? `<br><small>${movie.original_title}</small>` : ''}
            </div>
        </div>
    `;
    }).join('');
    autocomplete.classList.add('show');
    autocomplete.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const movieId = parseInt(item.dataset.id || '0');
            selectMovie(movieId);
        });
    });
}
// Handle keyboard navigation
function handleSearchKeydown(e) {
    if (!autocomplete)
        return;
    if (e.key === 'Enter') {
        const firstItem = autocomplete.querySelector('.autocomplete-item');
        if (firstItem) {
            const movieId = parseInt(firstItem.dataset.id || '0');
            selectMovie(movieId);
        }
    }
    else if (e.key === 'Escape') {
        autocomplete.classList.remove('show');
    }
}
// Select a movie and process guess
async function selectMovie(movieId) {
    if (!movieSearch || !autocomplete || !attemptsCounter || !winMessage || !winAttempts || !guessesContainer)
        return;
    if (gameWon || !mysteryMovie)
        return;
    autocomplete.classList.remove('show');
    let guessedMovieDetails;
    try {
        const response = await fetch(`${API_BASE}/movie/${movieId}`, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
            }
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const rawData = await response.json();
        // Handle format with or without date wrapper
        const rawMovie = 'date' in rawData ? rawData.movie : rawData.movie;
        guessedMovieDetails = transformMovieResponse(rawMovie);
    }
    catch (error) {
        console.error('Error fetching movie details:', error);
        alert(t('errorLoadingDetails', currentLanguage));
        return;
    }
    attempts++;
    attemptsCounter.textContent = attempts.toString();
    const comparison = compareMovies(guessedMovieDetails, mysteryMovie);
    displayGuess(guessedMovieDetails, comparison);
    if (guessedMovieDetails.id === mysteryMovie.id) {
        gameWon = true;
        winAttempts.textContent = attempts.toString();
        winMessage.classList.remove('hidden');
        const winTitle = winMessage.querySelector('h2');
        const winText = winMessage.querySelector('p');
        if (winTitle)
            winTitle.textContent = t('congratulations', currentLanguage);
        if (winText) {
            winText.innerHTML = `${t('winMessage', currentLanguage)} <strong id="winAttempts">${attempts}</strong> ${t('attemptsText', currentLanguage)}!`;
            const newWinAttempts = document.getElementById('winAttempts');
            if (newWinAttempts)
                winAttempts = newWinAttempts;
        }
        movieSearch.disabled = true;
        winMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    movieSearch.value = '';
}
// Compare two movies
function compareMovies(guessed, mystery) {
    const guessedYear = guessed.release_date ? new Date(guessed.release_date).getFullYear() : 0;
    const mysteryYear = mystery.release_date ? new Date(mystery.release_date).getFullYear() : 0;
    let yearResult = 'unknown';
    let yearDiff = 0;
    if (guessedYear !== 0 && mysteryYear !== 0) {
        yearDiff = guessedYear - mysteryYear; // Positive if guessed is newer
        if (yearDiff === 0) {
            yearResult = 'match';
        }
        else if (yearDiff > 5) {
            yearResult = 'much_newer';
        }
        else if (yearDiff > 0) {
            yearResult = 'newer';
        }
        else if (yearDiff < -5) {
            yearResult = 'much_older';
        }
        else {
            yearResult = 'older';
        }
    }
    const guessedGenres = guessed.genres.map(genre => genre.name) || [];
    const mysteryGenres = mystery.genres.map(genre => genre.name) || [];
    const commonGenres = guessedGenres.filter(g => mysteryGenres.includes(g));
    const guessedBudget = guessed.budget || 0;
    const mysteryBudget = mystery.budget || 0;
    let budgetResult = 'unknown';
    let budgetRatio = 0;
    if (guessedBudget > 0 && mysteryBudget > 0) {
        const budgetDiff = guessedBudget - mysteryBudget; // Positive if guessed is higher
        budgetRatio = Math.abs(budgetDiff) / Math.max(guessedBudget, mysteryBudget);
        if (budgetDiff === 0) {
            budgetResult = 'match';
        }
        else if (budgetRatio <= 0.3) { // Within 30% - close
            budgetResult = budgetDiff > 0 ? 'higher' : 'lower';
        }
        else {
            budgetResult = budgetDiff > 0 ? 'much_higher' : 'much_lower';
        }
    }
    else if (guessedBudget === 0 && mysteryBudget === 0) {
        budgetResult = 'match';
        budgetRatio = 0;
    }
    const guessedRevenue = guessed.revenue || 0;
    const mysteryRevenue = mystery.revenue || 0;
    let revenueResult = 'unknown';
    let revenueRatio = 0;
    if (guessedRevenue > 0 && mysteryRevenue > 0) {
        const revenueDiff = guessedRevenue - mysteryRevenue; // Positive if guessed is higher
        revenueRatio = Math.abs(revenueDiff) / Math.max(guessedRevenue, mysteryRevenue);
        if (revenueDiff === 0) {
            revenueResult = 'match';
        }
        else if (revenueRatio <= 0.3) { // Within 30% - close
            revenueResult = revenueDiff > 0 ? 'higher' : 'lower';
        }
        else {
            revenueResult = revenueDiff > 0 ? 'much_higher' : 'much_lower';
        }
    }
    else if (guessedRevenue === 0 && mysteryRevenue === 0) {
        revenueResult = 'match';
        revenueRatio = 0;
    }
    const guessedCompanies = (guessed.production_companies || []).map(c => c.name);
    const mysteryCompanies = (mystery.production_companies || []).map(c => c.name);
    const commonCompanies = guessedCompanies.filter(c => mysteryCompanies.includes(c));
    const guessedCountries = (guessed.production_countries || []).map(c => c.name);
    const mysteryCountries = (mystery.production_countries || []).map(c => c.name);
    const commonCountries = guessedCountries.filter(c => mysteryCountries.includes(c));
    // For cast, use all actors and preserve order
    const guessedCastFull = (guessed.top_cast || []).map((a, index) => ({
        name: a.name,
        isMatch: false,
        originalOrder: index
    }));
    const mysteryCastNames = (mystery.top_cast || []).map(a => a.name);
    const guessedCastWithMatches = guessedCastFull.map(actor => ({
        ...actor,
        isMatch: mysteryCastNames.includes(actor.name)
    }));
    // Sort: matches first, then non-matches, preserving original order within each group
    const sortedGuessedCast = [...guessedCastWithMatches].sort((a, b) => {
        if (a.isMatch && !b.isMatch)
            return -1;
        if (!a.isMatch && b.isMatch)
            return 1;
        return a.originalOrder - b.originalOrder;
    });
    const guessedCast = sortedGuessedCast.map(a => a.name);
    const commonCast = guessedCastWithMatches.filter(a => a.isMatch).map(a => a.name);
    const guessedDirector = guessed.director?.name || null;
    const mysteryDirector = mystery.director?.name || null;
    const comparison = {
        year: {
            guessed: guessedYear || 'Nieznany',
            mystery: mysteryYear || 'Nieznany',
            result: yearResult,
            yearDiff: yearDiff
        },
        genres: {
            guessed: guessedGenres,
            mystery: mysteryGenres,
            matches: commonGenres,
            hasMatch: commonGenres.length > 0
        },
        budget: {
            guessed: guessedBudget,
            mystery: mysteryBudget,
            result: budgetResult,
            ratio: budgetRatio
        },
        revenue: {
            guessed: guessedRevenue,
            mystery: mysteryRevenue,
            result: revenueResult,
            ratio: revenueRatio
        },
        companies: {
            guessed: guessedCompanies,
            mystery: mysteryCompanies,
            matches: commonCompanies,
            hasMatch: commonCompanies.length > 0
        },
        countries: {
            guessed: guessedCountries,
            mystery: mysteryCountries,
            matches: commonCountries,
            hasMatch: commonCountries.length > 0
        },
        cast: {
            guessed: guessedCast,
            mystery: mysteryCastNames,
            matches: commonCast,
            hasMatch: commonCast.length > 0,
            guessedWithOrder: sortedGuessedCast
        },
        director: {
            guessed: guessedDirector ? [guessedDirector] : [],
            mystery: mysteryDirector ? [mysteryDirector] : [],
            matches: guessedDirector && mysteryDirector && guessedDirector === mysteryDirector ? [guessedDirector] : [],
            hasMatch: guessedDirector !== null && mysteryDirector !== null && guessedDirector === mysteryDirector
        }
    };
    return comparison;
}
// Genre icons mapping
const genreIcons = {
    'Dramat': '🎭',
    'Komedia': '😂',
    'Kryminał': '🔫',
    'Horror': '👻',
    'Thriller': '🔪',
    'Akcja': '💥',
    'Przygodowy': '🗺️',
    'Sci-Fi': '🚀',
    'Fantasy': '🧙',
    'Romans': '💕',
    'Animacja': '🎨',
    'Familijny': '👨‍👩‍👧‍👦',
    'Tajemnica': '🔍',
    'Wojenny': '⚔️',
    'Western': '🤠',
    'Biograficzny': '📖',
    'Muzyczny': '🎵',
    'Sportowy': '⚽',
    'Dokumentalny': '📹'
};
function getGenreIcon(genreName) {
    return genreIcons[genreName] || '🎬';
}
function getCountryFlagUrl(countryCode) {
    if (!countryCode)
        return '';
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}
function getCountryNamePL(countryCode) {
    if (!countryCode)
        return '';
    try {
        const displayNames = new Intl.DisplayNames(['pl'], { type: 'region' });
        return displayNames.of(countryCode.toUpperCase()) || countryCode;
    }
    catch (e) {
        return countryCode;
    }
}
function getActorInitials(name) {
    if (!name)
        return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
function getCompanyInitials(name) {
    if (!name)
        return '?';
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}
function showTooltip(text, element, imageUrl = null) {
    if (tooltipState.hideTimeout) {
        clearTimeout(tooltipState.hideTimeout);
        tooltipState.hideTimeout = null;
    }
    const tooltip = document.getElementById('customTooltip');
    if (!tooltip)
        return;
    tooltip.classList.remove('hidden');
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    tooltip.innerHTML = '';
    if (text) {
        const textEl = document.createElement('div');
        textEl.className = 'tooltip-text';
        textEl.textContent = text;
        tooltip.appendChild(textEl);
    }
    if (imageUrl) {
        const imgEl = document.createElement('img');
        imgEl.src = imageUrl;
        imgEl.className = 'tooltip-image';
        imgEl.alt = text || '';
        tooltip.appendChild(imgEl);
    }
    const tooltipRect = tooltip.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + (rect.width / 2);
    if (top < 10) {
        top = rect.bottom + 10;
    }
    if (left - tooltipRect.width / 2 < 10) {
        left = tooltipRect.width / 2 + 10;
    }
    if (left + tooltipRect.width / 2 > window.innerWidth - 10) {
        left = window.innerWidth - tooltipRect.width / 2 - 10;
    }
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.transform = 'translateX(-50%)';
    tooltip.style.visibility = 'visible';
    tooltipState.sourceElement = element;
}
function hideTooltip() {
    const tooltip = document.getElementById('customTooltip');
    if (!tooltip)
        return;
    tooltip.classList.add('hidden');
    tooltip.style.visibility = 'hidden';
    tooltipState.sourceElement = null;
    if (tooltipState.hideTimeout) {
        clearTimeout(tooltipState.hideTimeout);
        tooltipState.hideTimeout = null;
    }
}
function displayGuess(movie, comparison) {
    if (!guessesContainer)
        return;
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '?';
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w154${movie.poster_path}`
        : '';
    const guessCard = document.createElement('div');
    guessCard.className = 'guess-card';
    let yearClass = 'hint-red';
    let yearArrow = '';
    let yearTooltip = '';
    if (comparison.year.result === 'unknown') {
        yearClass = 'hint-neutral';
        yearArrow = '?';
        yearTooltip = t('yearUnknown', currentLanguage, { year: String(year) });
    }
    else if (comparison.year.result === 'match') {
        yearClass = 'hint-green';
        yearArrow = '=';
        yearTooltip = t('yearMatch', currentLanguage, { year: String(year) });
    }
    else if (comparison.year.result === 'much_newer') {
        yearClass = 'hint-red';
        yearArrow = '↓↓';
        yearTooltip = t('yearMuchOlder', currentLanguage, { year: String(year) });
    }
    else if (comparison.year.result === 'newer') {
        yearClass = 'hint-yellow';
        yearArrow = '↓';
        yearTooltip = t('yearOlder', currentLanguage, { year: String(year) });
    }
    else if (comparison.year.result === 'older') {
        yearClass = 'hint-yellow';
        yearArrow = '↑';
        yearTooltip = t('yearNewer', currentLanguage, { year: String(year) });
    }
    else if (comparison.year.result === 'much_older') {
        yearClass = 'hint-red';
        yearArrow = '↑↑';
        yearTooltip = t('yearMuchNewer', currentLanguage, { year: String(year) });
    }
    let budgetClass = 'hint-red';
    let budgetArrow = '';
    let budgetTooltip = '';
    const budgetValue = formatCurrencyShort(movie.budget || 0);
    if (comparison.budget.result === 'unknown') {
        budgetClass = 'hint-neutral';
        budgetArrow = '?';
        budgetTooltip = t('budgetUnknown', currentLanguage, { value: budgetValue });
    }
    else if (comparison.budget.result === 'match') {
        budgetClass = 'hint-green';
        budgetArrow = '=';
        budgetTooltip = t('budgetMatch', currentLanguage, { value: budgetValue });
    }
    else if (comparison.budget.result === 'much_higher') {
        budgetClass = 'hint-red';
        budgetArrow = '↓↓';
        budgetTooltip = t('budgetMuchLower', currentLanguage, { value: budgetValue });
    }
    else if (comparison.budget.result === 'higher') {
        budgetClass = 'hint-yellow';
        budgetArrow = '↓';
        budgetTooltip = t('budgetLower', currentLanguage, { value: budgetValue });
    }
    else if (comparison.budget.result === 'lower') {
        budgetClass = 'hint-yellow';
        budgetArrow = '↑';
        budgetTooltip = t('budgetHigher', currentLanguage, { value: budgetValue });
    }
    else if (comparison.budget.result === 'much_lower') {
        budgetClass = 'hint-red';
        budgetArrow = '↑↑';
        budgetTooltip = t('budgetMuchHigher', currentLanguage, { value: budgetValue });
    }
    let revenueClass = 'hint-red';
    let revenueArrow = '';
    let revenueTooltip = '';
    const revenueValue = formatCurrencyShort(movie.revenue || 0);
    if (comparison.revenue.result === 'unknown') {
        revenueClass = 'hint-neutral';
        revenueArrow = '?';
        revenueTooltip = t('revenueUnknown', currentLanguage, { value: revenueValue });
    }
    else if (comparison.revenue.result === 'match') {
        revenueClass = 'hint-green';
        revenueArrow = '=';
        revenueTooltip = t('revenueMatch', currentLanguage, { value: revenueValue });
    }
    else if (comparison.revenue.result === 'much_higher') {
        revenueClass = 'hint-red';
        revenueArrow = '↓↓';
        revenueTooltip = t('revenueMuchLower', currentLanguage, { value: revenueValue });
    }
    else if (comparison.revenue.result === 'higher') {
        revenueClass = 'hint-yellow';
        revenueArrow = '↓';
        revenueTooltip = t('revenueLower', currentLanguage, { value: revenueValue });
    }
    else if (comparison.revenue.result === 'lower') {
        revenueClass = 'hint-yellow';
        revenueArrow = '↑';
        revenueTooltip = t('revenueHigher', currentLanguage, { value: revenueValue });
    }
    else if (comparison.revenue.result === 'much_lower') {
        revenueClass = 'hint-red';
        revenueArrow = '↑↑';
        revenueTooltip = t('revenueMuchHigher', currentLanguage, { value: revenueValue });
    }
    const guessedGenres = (movie.genres || []).map(genre => {
        const isMatch = comparison.genres.matches.includes(genre.name);
        return {
            name: genre.name,
            icon: getGenreIcon(genre.name),
            isMatch: isMatch
        };
    });
    const guessedCompanies = (movie.production_companies || []).slice(0, 3).map(c => {
        const isMatch = comparison.companies.matches.includes(c.name);
        return {
            name: c.name,
            logo: c.logo_path ? `https://image.tmdb.org/t/p/w500${c.logo_path}` : null,
            logoLarge: c.logo_path ? `https://image.tmdb.org/t/p/w780${c.logo_path}` : null,
            initials: getCompanyInitials(c.name),
            isMatch: isMatch
        };
    });
    const guessedCountries = (movie.production_countries || []).slice(0, 3).map(c => {
        const isMatch = comparison.countries.matches.includes(c.name);
        return {
            name: c.name,
            namePL: getCountryNamePL(c.iso_3166_1),
            code: c.iso_3166_1,
            isMatch: isMatch
        };
    });
    const guessedDirectors = movie.director ? [{
            name: movie.director.name,
            initials: getActorInitials(movie.director.name),
            profileUrl: movie.director.profile_path
                ? `https://image.tmdb.org/t/p/w185${movie.director.profile_path}`
                : null,
            profileUrlLarge: movie.director.profile_path
                ? `https://image.tmdb.org/t/p/w500${movie.director.profile_path}`
                : null,
            isMatch: comparison.director.hasMatch
        }] : [];
    // Use actors from comparison (already sorted: matches first, then non-matches)
    // Limit to max 3, prioritizing matches
    const guessedCast = comparison.cast.guessedWithOrder.slice(0, 3).map(actorInfo => {
        // Find the actor in movie.top_cast to get profile_path
        const actor = movie.top_cast.find(a => a.name === actorInfo.name);
        const profileUrl = actor?.profile_path
            ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
            : null;
        const profileUrlLarge = actor?.profile_path
            ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
            : null;
        return {
            name: actorInfo.name,
            initials: getActorInitials(actorInfo.name),
            profileUrl: profileUrl,
            profileUrlLarge: profileUrlLarge,
            isMatch: actorInfo.isMatch
        };
    });
    guessCard.innerHTML = `
        <div class="guess-header">
            ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" class="guess-poster" onerror="this.style.display='none'">` : ''}
            <div class="guess-title">${movie.title}</div>
        </div>
        <div class="hints-row">
            <div class="hint-block">
                <div class="hint-inner ${yearClass}" data-tooltip="${yearTooltip}">
                    <div class="hint-value">${year}</div>
                    <div class="hint-arrow">${yearArrow}</div>
                </div>
            </div>
            
            <div class="hint-block genres-block">
                ${guessedGenres.length > 0 ? guessedGenres.map(g => `
                    <span class="genre-icon ${g.isMatch ? 'hint-green' : 'hint-red'}" 
                          data-tooltip="${g.name}">${g.icon}</span>
                `).join('') : '<span class="hint-neutral" style="padding: 5px;">-</span>'}
            </div>
            
            <div class="hint-block budget-block">
                <div class="hint-inner ${budgetClass}" data-tooltip="${budgetTooltip}">
                    <div class="hint-icon">💰</div>
                    <div class="hint-amount">${formatCurrencyShort(movie.budget || 0)}</div>
                    <div class="hint-arrow">${budgetArrow}</div>
                </div>
            </div>
            
            <div class="hint-block revenue-block">
                <div class="hint-inner ${revenueClass}" data-tooltip="${revenueTooltip}">
                    <div class="hint-icon">💵</div>
                    <div class="hint-amount">${formatCurrencyShort(movie.revenue || 0)}</div>
                    <div class="hint-arrow">${revenueArrow}</div>
                </div>
            </div>
            
            <div class="hint-block companies-block">
                ${guessedCompanies.length > 0 ? guessedCompanies.map(c => `
                    <span class="company-logo ${c.isMatch ? 'hint-green' : 'hint-red'}" 
                          data-tooltip="${c.name}"
                          data-image="${c.logoLarge || ''}">
                        ${c.logo ? `<img src="${c.logo}" alt="${c.name}" onerror="this.parentElement.innerHTML='<span class=\\'company-initials-fallback\\'>${c.initials}</span>'">` : `<span class="company-initials-fallback">${c.initials}</span>`}
                    </span>
                `).join('') : '<span class="hint-neutral" style="padding: 5px;">-</span>'}
            </div>
            
            <div class="hint-block countries-block">
                ${guessedCountries.length > 0 ? guessedCountries.map(c => `
                    <span class="country-flag ${c.isMatch ? 'hint-green' : 'hint-red'}" 
                          data-tooltip="${c.namePL || c.name}">
                        <img src="${getCountryFlagUrl(c.code)}" alt="${c.namePL || c.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\\'font-size: 0.7em;\\'>?</span>'">
                    </span>
                `).join('') : '<span class="hint-neutral" style="padding: 5px;">-</span>'}
            </div>
            
            <div class="hint-block director-block">
                ${guessedDirectors.length > 0 ? guessedDirectors.map(d => {
        const hasImage = d.profileUrl ? 'has-image' : '';
        return `
                    <span class="director-photo ${d.isMatch ? 'hint-green' : 'hint-red'} ${hasImage}" 
                          data-tooltip="${t('director', currentLanguage, { name: d.name })}"
                          data-image="${d.profileUrlLarge || ''}"
                          data-initials="${d.initials}"
                          style="${d.profileUrl ? `background-image: url('${d.profileUrl}');` : ''}">
                        <span class="actor-initials-fallback">${d.initials}</span>
                    </span>
                `;
    }).join('') : '<span class="hint-neutral" style="padding: 5px;">-</span>'}
            </div>
            
            <div class="hint-block cast-block">
                ${guessedCast.length > 0 ? guessedCast.map(a => {
        const hasImage = a.profileUrl ? 'has-image' : '';
        return `
                    <span class="actor-photo ${a.isMatch ? 'hint-green' : 'hint-red'} ${hasImage}" 
                          data-tooltip="${t('actor', currentLanguage, { name: a.name })}"
                          data-image="${a.profileUrlLarge || ''}"
                          data-initials="${a.initials}"
                          style="${a.profileUrl ? `background-image: url('${a.profileUrl}');` : ''}">
                        <span class="actor-initials-fallback">${a.initials}</span>
                    </span>
                `;
    }).join('') : '<span class="hint-neutral" style="padding: 5px;">-</span>'}
            </div>
        </div>
    `;
    guessCard.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const target = e.target;
            const tooltipText = target.getAttribute('data-tooltip');
            const imageUrl = target.getAttribute('data-image');
            showTooltip(tooltipText, target, imageUrl);
        });
    });
    guessCard.querySelectorAll('.actor-photo.has-image, .director-photo.has-image').forEach(element => {
        const el = element;
        const bgImage = el.style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            const img = new Image();
            img.src = bgImage.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1');
            img.onerror = () => {
                el.classList.remove('has-image');
                el.style.backgroundImage = 'none';
            };
            img.onload = () => {
                const initialsEl = el.querySelector('.actor-initials-fallback');
                if (initialsEl) {
                    initialsEl.style.display = 'none';
                }
            };
        }
    });
    guessesContainer.insertBefore(guessCard, guessesContainer.firstChild);
}
function formatCurrencyShort(amount) {
    if (amount === 0 || !amount)
        return '?';
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)} MLD $`;
    }
    else if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)} MLN $`;
    }
    else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)} TYS $`;
    }
    return `${amount} $`;
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
//# sourceMappingURL=app.js.map