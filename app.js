// Game state
let mysteryMovie = null;
let attempts = 0;
let gameWon = false;

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
const attemptsCounter = document.getElementById('attempts');
const winMessage = document.getElementById('winMessage');
const winAttempts = document.getElementById('winAttempts');
const movieTitleHint = document.getElementById('movieTitleHint');

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
                    tooltipState.hideTimeout = setTimeout(() => {
                        hideTooltip();
                    }, 50);
                } else {
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
    movieSearch.addEventListener('input', handleSearchInput);
    movieSearch.addEventListener('keydown', handleSearchKeydown);
    
    document.addEventListener('click', (e) => {
        if (!movieSearch.contains(e.target) && !autocomplete.contains(e.target)) {
            autocomplete.classList.remove('show');
        }
    });
}

// Start a new game
async function startNewGame() {
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
        mysteryMovie = await response.json();
        mysteryMovie = mysteryMovie.movie;
    } catch (error) {
        console.error('Error fetching mystery movie:', error);
        alert('Błąd: Nie udało się załadować tajemniczego filmu. Sprawdź konfigurację CORS na serwerze API lub odśwież stronę.');
        movieSearch.disabled = true;
        return;
    }
    
    attempts = 0;
    gameWon = false;
    attemptsCounter.textContent = attempts;
    guessesContainer.innerHTML = '';
    winMessage.classList.add('hidden');
    movieSearch.value = '';
    movieSearch.disabled = false;
    movieSearch.focus();
    
    updateMovieTitleHint();
}

// Generate underscores hint for movie title
function updateMovieTitleHint() {
    if (!mysteryMovie || !movieTitleHint) return;
    
    const title = mysteryMovie.title || mysteryMovie.original_title || '';
    
    const hint = title
        .split('')
        .map(char => {
            if (char === ' ') {
                return ' ';
            } else {
                return '_';
            }
        })
        .join(' ');
    
    movieTitleHint.textContent = hint;
}

// Handle search input
async function handleSearchInput(e) {
    const query = e.target.value.trim();
    
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
        const matches = await response.json();
        displayAutocomplete(matches.results);
    } catch (error) {
        console.error('Error searching movies:', error);
        autocomplete.classList.remove('show');
    }
}

// Display autocomplete suggestions
function displayAutocomplete(matches) {
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
            const movieId = parseInt(item.dataset.id);
            selectMovie(movieId);
        });
    });
}

// Handle keyboard navigation
function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        const firstItem = autocomplete.querySelector('.autocomplete-item');
        if (firstItem) {
            const movieId = parseInt(firstItem.dataset.id);
            selectMovie(movieId);
        }
    } else if (e.key === 'Escape') {
        autocomplete.classList.remove('show');
    }
}

// Select a movie and process guess
async function selectMovie(movieId) {
    if (gameWon) return;
    
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
        guessedMovieDetails = await response.json();
        guessedMovieDetails = guessedMovieDetails.movie;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        alert('Błąd: Nie udało się załadować szczegółów filmu.');
        return;
    }
    
    attempts++;
    attemptsCounter.textContent = attempts;
    
    const comparison = compareMovies(guessedMovieDetails, mysteryMovie);
    displayGuess(guessedMovieDetails, comparison);
    
    if (guessedMovieDetails.id === mysteryMovie.id) {
        gameWon = true;
        winAttempts.textContent = attempts;
        winMessage.classList.remove('hidden');
        movieSearch.disabled = true;
        winMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    movieSearch.value = '';
}

// Compare two movies
function compareMovies(guessed, mystery) {
    const comparison = {};
    
    const guessedYear = guessed.release_date ? new Date(guessed.release_date).getFullYear() : 0;
    const mysteryYear = mystery.release_date ? new Date(mystery.release_date).getFullYear() : 0;
    comparison.year = {
        guessed: guessedYear || 'Nieznany',
        mystery: mysteryYear || 'Nieznany',
        result: guessedYear === 0 || mysteryYear === 0 ? 'unknown' : 
                (guessedYear === mysteryYear ? 'match' : (guessedYear > mysteryYear ? 'higher' : 'lower'))
    };
    
    const guessedGenres = guessed.genres || [];
    const mysteryGenres = mystery.genres || [];
    const commonGenres = guessedGenres.filter(g => mysteryGenres.includes(g));
    comparison.genres = {
        guessed: guessedGenres,
        mystery: mysteryGenres,
        matches: commonGenres,
        hasMatch: commonGenres.length > 0
    };
    
    const guessedBudget = guessed.budget || 0;
    const mysteryBudget = mystery.budget || 0;
    comparison.budget = {
        guessed: guessedBudget,
        mystery: mysteryBudget,
        result: guessedBudget === mysteryBudget ? 'match' : (guessedBudget > mysteryBudget ? 'higher' : 'lower')
    };
    
    const guessedRevenue = guessed.revenue || 0;
    const mysteryRevenue = mystery.revenue || 0;
    comparison.revenue = {
        guessed: guessedRevenue,
        mystery: mysteryRevenue,
        result: guessedRevenue === mysteryRevenue ? 'match' : (guessedRevenue > mysteryRevenue ? 'higher' : 'lower')
    };
    
    const guessedCompanies = (guessed.production_companies || []).map(c => c.name);
    const mysteryCompanies = (mystery.production_companies || []).map(c => c.name);
    const commonCompanies = guessedCompanies.filter(c => mysteryCompanies.includes(c));
    comparison.companies = {
        guessed: guessedCompanies,
        mystery: mysteryCompanies,
        matches: commonCompanies,
        hasMatch: commonCompanies.length > 0
    };
    
    const guessedCountries = (guessed.production_countries || []).map(c => c.name);
    const mysteryCountries = (mystery.production_countries || []).map(c => c.name);
    const commonCountries = guessedCountries.filter(c => mysteryCountries.includes(c));
    comparison.countries = {
        guessed: guessedCountries,
        mystery: mysteryCountries,
        matches: commonCountries,
        hasMatch: commonCountries.length > 0
    };
    
    const guessedCast = (guessed.top_cast || []).map(a => a.name);
    const mysteryCast = (mystery.top_cast || []).map(a => a.name);
    const commonCast = guessedCast.filter(a => mysteryCast.includes(a));
    comparison.cast = {
        guessed: guessedCast,
        mystery: mysteryCast,
        matches: commonCast,
        hasMatch: commonCast.length > 0
    };
    
    const guessedDirector = guessed.director?.name || null;
    const mysteryDirector = mystery.director?.name || null;
    comparison.director = {
        guessed: guessedDirector ? [guessedDirector] : [],
        mystery: mysteryDirector ? [mysteryDirector] : [],
        matches: guessedDirector && mysteryDirector && guessedDirector === mysteryDirector ? [guessedDirector] : [],
        hasMatch: guessedDirector && mysteryDirector && guessedDirector === mysteryDirector
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
    if (!countryCode) return '';
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

function getCountryNamePL(countryCode) {
    if (!countryCode) return '';
    try {
        const displayNames = new Intl.DisplayNames(['pl'], { type: 'region' });
        return displayNames.of(countryCode.toUpperCase());
    } catch (e) {
        return countryCode;
    }
}

function getActorInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

function getCompanyInitials(name) {
    if (!name) return '?';
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
    
    tooltipState.isVisible = true;
    tooltipState.sourceElement = element;
}

function hideTooltip() {
    const tooltip = document.getElementById('customTooltip');
    tooltip.classList.add('hidden');
    tooltip.style.visibility = 'hidden';
    
    tooltipState.sourceElement = null;
    if (tooltipState.hideTimeout) {
        clearTimeout(tooltipState.hideTimeout);
        tooltipState.hideTimeout = null;
    }
}

function displayGuess(movie, comparison) {
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
        yearTooltip = `Rok wydania: ${year} ?\nbrak danych`;
    } else if (comparison.year.result === 'match') {
        yearClass = 'hint-green';
        yearArrow = '=';
        yearTooltip = `Rok wydania: ${year} =\ntajemniczy film ma ten sam rok`;
    } else if (comparison.year.result === 'higher') {
        yearClass = 'hint-yellow';
        yearArrow = '↓';
        yearTooltip = `Rok wydania: ${year} ↓\ntajemniczy film jest starszy`;
    } else {
        yearClass = 'hint-red';
        yearArrow = '↑';
        yearTooltip = `Rok wydania: ${year} ↑\ntajemniczy film jest nowszy`;
    }
    
    let budgetClass = 'hint-red';
    let budgetArrow = '';
    let budgetTooltip = '';
    const budgetValue = formatCurrencyShort(movie.budget || 0);
    if (comparison.budget.result === 'match') {
        budgetClass = 'hint-green';
        budgetArrow = '=';
        budgetTooltip = `Budżet: ${budgetValue} =\ntajemniczy film ma ten sam budżet`;
    } else if (comparison.budget.result === 'higher') {
        budgetClass = 'hint-yellow';
        budgetArrow = '↓';
        budgetTooltip = `Budżet: ${budgetValue} ↓\ntajemniczy film ma mniejszy budżet`;
    } else {
        budgetClass = 'hint-red';
        budgetArrow = '↑';
        budgetTooltip = `Budżet: ${budgetValue} ↑\ntajemniczy film ma większy budżet`;
    }
    
    let revenueClass = 'hint-red';
    let revenueArrow = '';
    let revenueTooltip = '';
    const revenueValue = formatCurrencyShort(movie.revenue || 0);
    if (comparison.revenue.result === 'match') {
        revenueClass = 'hint-green';
        revenueArrow = '=';
        revenueTooltip = `Przychód: ${revenueValue} =\ntajemniczy film ma ten sam przychód`;
    } else if (comparison.revenue.result === 'higher') {
        revenueClass = 'hint-yellow';
        revenueArrow = '↓';
        revenueTooltip = `Przychód: ${revenueValue} ↓\ntajemniczy film ma mniejszy przychód`;
    } else {
        revenueClass = 'hint-red';
        revenueArrow = '↑';
        revenueTooltip = `Przychód: ${revenueValue} ↑\ntajemniczy film ma większy przychód`;
    }
    
    const guessedGenres = (movie.genres || []).map(genreName => {
        const isMatch = comparison.genres.matches.includes(genreName);
        return {
            name: genreName,
            icon: getGenreIcon(genreName),
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
    
    const guessedCast = (movie.top_cast || []).slice(0, 3).map(a => {
        const isMatch = comparison.cast.matches.includes(a.name);
        const profileUrl = a.profile_path 
            ? `https://image.tmdb.org/t/p/w185${a.profile_path}`
            : null;
        const profileUrlLarge = a.profile_path 
            ? `https://image.tmdb.org/t/p/w500${a.profile_path}`
            : null;
        return {
            name: a.name,
            initials: getActorInitials(a.name),
            profileUrl: profileUrl,
            profileUrlLarge: profileUrlLarge,
            isMatch: isMatch
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
                          data-tooltip="Reżyser: ${d.name}"
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
                          data-tooltip="Aktor: ${a.name}"
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
            const tooltipText = e.target.getAttribute('data-tooltip');
            const imageUrl = e.target.getAttribute('data-image');
            showTooltip(tooltipText, e.target, imageUrl || null);
        });
    });
    
    guessCard.querySelectorAll('.actor-photo.has-image, .director-photo.has-image').forEach(element => {
        const bgImage = element.style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            const img = new Image();
            img.src = bgImage.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1');
            img.onerror = () => {
                element.classList.remove('has-image');
                element.style.backgroundImage = 'none';
            };
            img.onload = () => {
                const initialsEl = element.querySelector('.actor-initials-fallback');
                if (initialsEl) {
                    initialsEl.style.display = 'none';
                }
            };
        }
    });
    
    guessesContainer.insertBefore(guessCard, guessesContainer.firstChild);
}

function formatCurrencyShort(amount) {
    if (amount === 0 || !amount) return '?';
    
    if (amount >= 1000000000) {
        return `${(amount / 1000000000).toFixed(1)} MLD $`;
    } else if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1)} MLN $`;
    } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(1)} TYS $`;
    }
    return `${amount} $`;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
