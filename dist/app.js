import { GuessCard } from './components/GuessCard.js';
import { MysteryInfo } from './components/MysteryInfo.js';
import { HintsMenu } from './components/HintsMenu.js';
import { HINTS } from './hints.js';
// Game state
let mysteryMovie = null;
let attempts = 0;
let gameWon = false;
let allGuesses = [];
// Hints state
let hintsState = {
    showLetters: false,
    revealedLetters: new Set(),
    revealedGenres: new Set(),
    revealedActors: new Set(),
    showQuote: false,
    showDescription: false
};
let hints = [...HINTS];
let hintsMenuComponent = null;
// API base URL
const API_BASE = 'https://filmle-api-git-main-patryk-sredzinskis-projects.vercel.app/api';
// Global variable to track tooltip state
let tooltipState = {
    sourceElement: null,
    hideTimeout: null
};
// DOM elements
const movieSearch = document.getElementById('movieSearch');
const autocomplete = document.getElementById('autocomplete');
const guessesContainer = document.getElementById('guesses');
let attemptsCounter = document.getElementById('attempts');
const winMessage = document.getElementById('winMessage');
let winAttempts = document.getElementById('winAttempts');
const movieTitleHint = document.getElementById('movieTitleHint');
const mysteryInfoContainer = document.getElementById('mysteryInfo');
let mysteryInfoComponent = null;
const gameInfoContainer = document.querySelector('.game-info');
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
    await startNewGame();
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
        const data = await response.json();
        // Handle format with or without date wrapper
        const movie = 'date' in data ? data.movie : data.movie;
        // Add quote and description from response (they might be at the top level)
        mysteryMovie = {
            ...movie,
            quote_pl: data.quote_pl ?? movie.quote_pl ?? null,
            quote_en: data.quote_en ?? movie.quote_en ?? null,
            description: data.description ?? movie.description ?? null
        };
    }
    catch (error) {
        console.error('Error fetching mystery movie:', error);
        alert('Błąd: Nie udało się załadować tajemniczego filmu. Sprawdź konfigurację CORS na serwerze API lub odśwież stronę.');
        movieSearch.disabled = true;
        return;
    }
    attempts = 0;
    gameWon = false;
    allGuesses = [];
    attemptsCounter.textContent = attempts.toString();
    guessesContainer.innerHTML = '';
    winMessage.classList.add('hidden');
    movieSearch.value = '';
    movieSearch.disabled = false;
    movieSearch.focus();
    // Reset hints
    hintsState = {
        showLetters: false,
        revealedLetters: new Set(),
        revealedGenres: new Set(),
        revealedActors: new Set(),
        showQuote: false,
        showDescription: false
    };
    hints = [...HINTS];
    hints[1].enabled = false; // reveal_random_letter disabled initially
    // Initialize hints menu
    if (gameInfoContainer && !hintsMenuComponent) {
        hintsMenuComponent = new HintsMenu({
            hints: hints,
            hintState: hintsState,
            onHintClick: handleHintClick
        });
        const hintsMenuElement = hintsMenuComponent.render();
        gameInfoContainer.appendChild(hintsMenuElement);
    }
    else if (hintsMenuComponent) {
        hintsMenuComponent.update({
            hints: hints,
            hintState: hintsState
        });
    }
    updateMovieTitleHint();
    updateMysteryInfo();
    // Update hints availability after game starts
    updateHintsAvailability();
    if (hintsMenuComponent) {
        hintsMenuComponent.update({
            hints: hints,
            hintState: hintsState
        });
    }
}
// Generate underscores hint for movie title
function updateMovieTitleHint() {
    if (!mysteryMovie || !movieTitleHint)
        return;
    const title = mysteryMovie.title || mysteryMovie.original_title || '';
    // If showLetters hint not used, show nothing
    if (!hintsState.showLetters) {
        movieTitleHint.textContent = '';
        return;
    }
    const hint = title
        .split('')
        .map((char, index) => {
        if (char === ' ') {
            return ' ';
        }
        else if (hintsState.revealedLetters.has(index)) {
            return char;
        }
        else {
            return '_';
        }
    })
        .join(' ');
    movieTitleHint.textContent = hint;
}
// Check if hint is still available (has more items to reveal)
function isHintAvailable(hintType) {
    if (!mysteryMovie)
        return false;
    switch (hintType) {
        case 'show_letters':
            return !hintsState.showLetters;
        case 'reveal_random_letter':
            if (!hintsState.showLetters)
                return false;
            const title = mysteryMovie.title || mysteryMovie.original_title || '';
            return title.split('').some((char, index) => char !== ' ' && !hintsState.revealedLetters.has(index));
        case 'reveal_genre':
            // Get matched genres from guesses
            const matchedGenreNames = new Set();
            allGuesses.forEach(guess => {
                guess.comparison.genres.items.forEach(item => {
                    if (item.isMatch) {
                        matchedGenreNames.add(item.name);
                    }
                });
            });
            // Check if there's any genre that hasn't been revealed and hasn't been matched
            return mysteryMovie.genres.some((genre, index) => !hintsState.revealedGenres.has(index) && !matchedGenreNames.has(genre.name));
        case 'reveal_actor':
            // Get matched actors from guesses
            const matchedActorNames = new Set();
            allGuesses.forEach(guess => {
                guess.comparison.cast.items.forEach(item => {
                    if (item.isMatch) {
                        matchedActorNames.add(item.name);
                    }
                });
            });
            // Check if there's any actor that hasn't been revealed and hasn't been matched
            const cast = mysteryMovie.top_cast || mysteryMovie.cast || [];
            return cast.some((actor, index) => !hintsState.revealedActors.has(index) && !matchedActorNames.has(actor.name));
        case 'reveal_quote':
            return !hintsState.showQuote && !!(mysteryMovie.quote_pl || mysteryMovie.quote_en);
        case 'reveal_description':
            return !hintsState.showDescription && !!mysteryMovie.description;
        default:
            return false;
    }
}
// Update hints availability
function updateHintsAvailability() {
    hints.forEach(hint => {
        if (hint.id === 'show_letters') {
            hint.enabled = isHintAvailable('show_letters');
            hint.used = !isHintAvailable('show_letters');
        }
        else if (hint.id === 'reveal_random_letter') {
            hint.enabled = isHintAvailable('reveal_random_letter');
        }
        else if (hint.id === 'reveal_genre') {
            hint.enabled = isHintAvailable('reveal_genre');
        }
        else if (hint.id === 'reveal_actor') {
            hint.enabled = isHintAvailable('reveal_actor');
        }
        else if (hint.id === 'reveal_quote') {
            hint.enabled = isHintAvailable('reveal_quote');
            hint.used = !isHintAvailable('reveal_quote');
        }
        else if (hint.id === 'reveal_description') {
            hint.enabled = isHintAvailable('reveal_description');
            hint.used = !isHintAvailable('reveal_description');
        }
    });
}
// Handle hint click
function handleHintClick(hintType) {
    if (!mysteryMovie)
        return;
    const hint = hints.find(h => h.id === hintType);
    if (!hint || !hint.enabled)
        return;
    // For show_letters, check if already used
    if (hintType === 'show_letters' && hint.used)
        return;
    switch (hintType) {
        case 'show_letters':
            hintsState.showLetters = true;
            hint.used = true;
            // Enable reveal_random_letter
            const revealLetterHint = hints.find(h => h.id === 'reveal_random_letter');
            if (revealLetterHint) {
                revealLetterHint.enabled = true;
            }
            updateMovieTitleHint();
            break;
        case 'reveal_random_letter':
            if (!hintsState.showLetters)
                return;
            const title = mysteryMovie.title || mysteryMovie.original_title || '';
            const hiddenIndices = [];
            title.split('').forEach((char, index) => {
                if (char !== ' ' && !hintsState.revealedLetters.has(index)) {
                    hiddenIndices.push(index);
                }
            });
            if (hiddenIndices.length > 0) {
                const randomIndex = hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)];
                hintsState.revealedLetters.add(randomIndex);
                updateMovieTitleHint();
            }
            break;
        case 'reveal_genre':
            // Get matched genres from guesses
            const matchedGenreNames = new Set();
            allGuesses.forEach(guess => {
                guess.comparison.genres.items.forEach(item => {
                    if (item.isMatch) {
                        matchedGenreNames.add(item.name);
                    }
                });
            });
            // Reveal first unrevealed genre that hasn't been matched yet
            for (let index = 0; index < mysteryMovie.genres.length; index++) {
                const genre = mysteryMovie.genres[index];
                if (!hintsState.revealedGenres.has(index) && !matchedGenreNames.has(genre.name)) {
                    hintsState.revealedGenres.add(index);
                    updateMysteryInfo();
                    break;
                }
            }
            break;
        case 'reveal_actor':
            // Get matched actors from guesses
            const matchedActorNames = new Set();
            allGuesses.forEach(guess => {
                guess.comparison.cast.items.forEach(item => {
                    if (item.isMatch) {
                        matchedActorNames.add(item.name);
                    }
                });
            });
            // Reveal first unrevealed actor that hasn't been matched yet
            const cast = mysteryMovie.top_cast || mysteryMovie.cast || [];
            for (let index = 0; index < cast.length; index++) {
                const actor = cast[index];
                if (!hintsState.revealedActors.has(index) && !matchedActorNames.has(actor.name)) {
                    hintsState.revealedActors.add(index);
                    updateMysteryInfo();
                    break;
                }
            }
            break;
        case 'reveal_quote':
            hintsState.showQuote = true;
            hint.used = true;
            updateMysteryInfo();
            break;
        case 'reveal_description':
            hintsState.showDescription = true;
            hint.used = true;
            updateMysteryInfo();
            break;
    }
    // Update hints availability
    updateHintsAvailability();
    // Update hints menu
    if (hintsMenuComponent) {
        hintsMenuComponent.update({
            hints: hints,
            hintState: hintsState
        });
    }
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
        const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
        const yearText = year ? ` (${year})` : '';
        return `
        <div class="autocomplete-item" data-id="${movie.id}">
            <img src="${posterUrl}" alt="${movie.title}" class="autocomplete-poster" onerror="this.style.display='none'">
            <div class="autocomplete-text">
                <strong>${movie.title}</strong>${year ? `<span class="autocomplete-year">${year}</span>` : ''}
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
        const data = await response.json();
        // Handle format with or without date wrapper
        const movie = 'date' in data ? data.movie : data.movie;
        // Add quote and description from response (they might be at the top level)
        guessedMovieDetails = {
            ...movie,
            quote_pl: data.quote_pl ?? movie.quote_pl ?? null,
            quote_en: data.quote_en ?? movie.quote_en ?? null,
            description: data.description ?? movie.description ?? null
        };
    }
    catch (error) {
        console.error('Error fetching movie details:', error);
        alert('Błąd: Nie udało się załadować szczegółów filmu.');
        return;
    }
    attempts++;
    attemptsCounter.textContent = attempts.toString();
    const comparison = compareMovies(guessedMovieDetails, mysteryMovie);
    allGuesses.push({ movie: guessedMovieDetails, comparison });
    displayGuess(guessedMovieDetails, comparison);
    updateMysteryInfo();
    if (guessedMovieDetails.id === mysteryMovie.id) {
        gameWon = true;
        winAttempts.textContent = attempts.toString();
        winMessage.classList.remove('hidden');
        const winTitle = winMessage.querySelector('h2');
        const winText = winMessage.querySelector('p');
        if (winTitle)
            winTitle.textContent = '🎉 Gratulacje!';
        if (winText) {
            winText.innerHTML = `Odgadłeś film w <strong id="winAttempts">${attempts}</strong> próbach!`;
            const newWinAttempts = document.getElementById('winAttempts');
            if (newWinAttempts)
                winAttempts = newWinAttempts;
        }
        movieSearch.disabled = true;
        winMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    movieSearch.value = '';
}
// Compare two movies - returns simplified comparison data
function compareMovies(guessed, mystery) {
    const guessedYear = guessed.release_date ? new Date(guessed.release_date).getFullYear() : 0;
    const mysteryYear = mystery.release_date ? new Date(mystery.release_date).getFullYear() : 0;
    // Year comparison - calculate arrow based on difference
    let yearArrow = '?';
    if (guessedYear !== 0 && mysteryYear !== 0) {
        const yearDiff = guessedYear - mysteryYear;
        if (yearDiff === 0) {
            yearArrow = '=';
        }
        else if (yearDiff > 5) {
            yearArrow = '↓↓';
        }
        else if (yearDiff > 0) {
            yearArrow = '↓';
        }
        else if (yearDiff < -5) {
            yearArrow = '↑↑';
        }
        else {
            yearArrow = '↑';
        }
    }
    const yearComparison = {
        value: guessedYear || undefined,
        arrow: yearArrow
    };
    // Genres comparison - items with isMatch
    const mysteryGenreNames = new Set(mystery.genres.map(g => g.name));
    const genresComparison = {
        items: guessed.genres.map(genre => ({
            name: genre.name,
            isMatch: mysteryGenreNames.has(genre.name)
        }))
    };
    // Budget comparison - calculate arrow based on difference
    const guessedBudget = guessed.budget || 0;
    const mysteryBudget = mystery.budget || 0;
    let budgetArrow = '?';
    if (guessedBudget > 0 && mysteryBudget > 0) {
        const budgetDiff = guessedBudget - mysteryBudget;
        const budgetRatio = Math.abs(budgetDiff) / Math.max(guessedBudget, mysteryBudget);
        if (budgetDiff === 0) {
            budgetArrow = '=';
        }
        else if (budgetRatio > 0.3) {
            budgetArrow = budgetDiff > 0 ? '↓↓' : '↑↑';
        }
        else {
            budgetArrow = budgetDiff > 0 ? '↓' : '↑';
        }
    }
    else if (guessedBudget === 0 && mysteryBudget === 0) {
        budgetArrow = '=';
    }
    const budgetComparison = {
        value: guessedBudget || undefined,
        arrow: budgetArrow
    };
    // Revenue comparison - calculate arrow based on difference
    const guessedRevenue = guessed.revenue || 0;
    const mysteryRevenue = mystery.revenue || 0;
    let revenueArrow = '?';
    if (guessedRevenue > 0 && mysteryRevenue > 0) {
        const revenueDiff = guessedRevenue - mysteryRevenue;
        const revenueRatio = Math.abs(revenueDiff) / Math.max(guessedRevenue, mysteryRevenue);
        if (revenueDiff === 0) {
            revenueArrow = '=';
        }
        else if (revenueRatio > 0.3) {
            revenueArrow = revenueDiff > 0 ? '↓↓' : '↑↑';
        }
        else {
            revenueArrow = revenueDiff > 0 ? '↓' : '↑';
        }
    }
    else if (guessedRevenue === 0 && mysteryRevenue === 0) {
        revenueArrow = '=';
    }
    const revenueComparison = {
        value: guessedRevenue || undefined,
        arrow: revenueArrow
    };
    // Companies comparison - items with isMatch
    const mysteryCompanyNames = new Set(mystery.production_companies.map(c => c.name));
    const companiesComparison = {
        items: guessed.production_companies.map(company => ({
            name: company.name,
            logo_path: company.logo_path,
            isMatch: mysteryCompanyNames.has(company.name)
        }))
    };
    // Countries comparison - items with isMatch
    const mysteryCountryNames = new Set(mystery.production_countries.map(c => c.name));
    const countriesComparison = {
        items: guessed.production_countries.map(country => ({
            name: country.name,
            iso_3166_1: country.iso_3166_1,
            isMatch: mysteryCountryNames.has(country.name)
        }))
    };
    // Cast comparison - items with isMatch, already sorted by matches first (from cast order)
    const mysteryCast = mystery.top_cast || mystery.cast || [];
    const guessedCast = guessed.top_cast || guessed.cast || [];
    const mysteryCastNames = new Set(mysteryCast.map(a => a.name));
    const castItems = guessedCast.map(actor => ({
        name: actor.name,
        profile_path: actor.profile_path,
        isMatch: mysteryCastNames.has(actor.name)
    }));
    // Sort: matches first, then non-matches, limit to 3
    const sortedCast = [...castItems].sort((a, b) => {
        if (a.isMatch && !b.isMatch)
            return -1;
        if (!a.isMatch && b.isMatch)
            return 1;
        return 0;
    }).slice(0, 3);
    const castComparison = {
        items: sortedCast
    };
    // Director comparison - just isMatch
    const directorComparison = {
        isMatch: guessed.director !== null &&
            mystery.director !== null &&
            guessed.director?.name === mystery.director?.name
    };
    return {
        year: yearComparison,
        genres: genresComparison,
        budget: budgetComparison,
        revenue: revenueComparison,
        companies: companiesComparison,
        countries: countriesComparison,
        cast: castComparison,
        director: directorComparison
    };
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
    const guessCardComponent = new GuessCard({ movie, comparison });
    const guessCardElement = guessCardComponent.render();
    // Add tooltip listeners
    guessCardElement.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const target = e.target;
            const tooltipText = target.getAttribute('data-tooltip');
            const imageUrl = target.getAttribute('data-image');
            showTooltip(tooltipText, target, imageUrl);
        });
    });
    guessesContainer.insertBefore(guessCardElement, guessesContainer.firstChild);
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
// Update mystery movie info based on guesses
function updateMysteryInfo() {
    if (!mysteryInfoContainer)
        return;
    mysteryInfoComponent = new MysteryInfo({
        allGuesses,
        mysteryMovie,
        hintState: hintsState
    });
    const mysteryInfoElement = mysteryInfoComponent.render();
    // Replace the container content
    mysteryInfoContainer.innerHTML = '';
    mysteryInfoContainer.appendChild(mysteryInfoElement);
    // Add tooltip listeners
    mysteryInfoElement.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const target = e.target;
            const tooltipText = target.getAttribute('data-tooltip');
            const imageUrl = target.getAttribute('data-image');
            showTooltip(tooltipText, target, imageUrl);
        });
    });
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
//# sourceMappingURL=app.js.map