// Game state
let moviesList = [];
let top300Movies = []; // Cache for top 300 movies by popularity
let mysteryMovie = null;
let attempts = 0;
let gameWon = false;

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
const randomMovieBtn = document.getElementById('randomMovieBtn');
const movieDateInput = document.getElementById('movieDate');
const winMessage = document.getElementById('winMessage');
const winAttempts = document.getElementById('winAttempts');
const movieTitleHint = document.getElementById('movieTitleHint');

const movieCalendar = {
    "2025-12-01": 14, // American Beauty
    "2025-12-02": 346, // Siedmiu samurajów
    "2025-12-03": 274, // Milczenie owiec
    "2025-12-04": 603, // Matrix
    "2025-12-05": 793, // Blue Velvet
    "2025-12-06": 769, // Chłopcy z ferajny
    "2025-12-07": 24428, // Avengers
    "2025-12-08": 422, // 8½
    "2025-12-09": 453, // Piękny umysł
    "2025-12-10": 120467, // The Grand Budapest Hotel
    "2025-12-11": 106, // Predator
    "2025-12-12": 503919, // The Lighthouse
    "2025-12-13": 807, // Siedem
    "2025-12-14": 36557, // Casino Royale
    "2025-12-15": 862, // Toy Story
    "2025-12-16": 1422, // The Departed
    "2025-12-17": 496243, // Parasite
    "2025-12-18": 1091, // The Thing
    "2025-12-19": 1366, // Rocky
    "2025-12-20": 95, // Armageddon
    "2025-12-21": 11324, // Wyspa tajemnic
    "2025-12-22": 857, // Szeregowiec Ryan
    "2025-12-23": 281957, // The Revenant
    "2025-12-24": 9552, // Egzorcysta
    "2025-12-25": 602, // Dzień Niepodległości
    "2025-12-26": 38, // Eternal Sunshine of the Spotless Mind
    "2025-12-27": 318846, // The Big Short
    "2025-12-28": 314365, // Spotlight
    "2025-12-29": 426426, // Roma
    "2025-12-30": 744, // Top Gun
    "2025-12-31": 244786, // Whiplash
    "2026-01-01": 313369, // La La Land
    "2026-01-02": 101, // Leon Zawodowiec
    "2026-01-03": 9799, // Szybcy i wściekli
    "2026-01-04": 279, // Amadeusz
    "2026-01-05": 539, // Psychoza
    "2026-01-06": 106646, // Wilk z Wall Street
    "2026-01-07": 509, // Notting Hill
    "2026-01-08": 593643, // The Menu
    "2026-01-09": 12, // Gdzie jest Nemo
    "2026-01-10": 471707, // Boże Ciało
    "2026-01-11": 1949, // Zodiak
    "2026-01-12": 637, // Życie jest piękne
    "2026-01-13": 425, // Epoka lodowcowa
    "2026-01-14": 12405, // Slumdog. Milioner z ulicy
    "2026-01-15": 522627, // The Gentlemen
    "2026-01-16": 107, // Snatch
    "2026-01-17": 105, // Back to the Future
    "2026-01-18": 8587, // Król Lew
    "2026-01-19": 771, // Kevin sam w domu
    "2026-01-20": 329, // Jurassic Park
    "2026-01-21": 329865, // Arrival
    "2026-01-22": 114, // Pretty Woman
    "2026-01-23": 953, // Madagaskar
    "2026-01-24": 263115, // Logan
    "2026-01-25": 954, // Mission: Impossible
    "2026-01-26": 419430, // Get Out
    "2026-01-27": 37165, // Truman Show
    "2026-01-28": 745, // The Sixth Sense
    "2026-01-29": 2330, // Taxi
    "2026-01-30": 238, // Ojciec chrzestny
    "2026-01-31": 872585, // Oppenheimer
    "2026-02-01": 22, // Piraci z Karaibów: Klątwa Czarnej Perły
    "2026-02-02": 348, // Obcy – ósmy pasażer Nostromo
    "2026-02-03": 920, // Auta
    "2026-02-04": 1368, // Rambo: Pierwsza krew
    "2026-02-05": 209274, // Ida
    "2026-02-06": 278, // Skazani na Shawshank
    "2026-02-07": 424, // Lista Schindlera
    "2026-02-08": 70160, // Igrzyska śmierci
    "2026-02-09": 6977, // No Country for Old Men
    "2026-02-10": 76341, // Mad Max
    "2026-02-11": 405774, // Bird Box
    "2026-02-12": 137, // Dzień świstaka
    "2026-02-13": 10772, // Django
    "2026-02-14": 103, // Taxi Driver
    "2026-02-15": 197, // Braveheart
    "2026-02-16": 346698, // Barbie
    "2026-02-17": 152601, // Her
    "2026-02-18": 670, // Oldboy
    "2026-02-19": 44214, // Black Swan
    "2026-02-20": 49047, // Gravity
    "2026-02-21": 210577, // Gone Girl
    "2026-02-22": 194662, // Birdman
    "2026-02-23": 77338, // Intouchables
    "2026-02-24": 73, // American History X
    "2026-02-25": 218, // Terminator
    "2026-02-26": 1124, // The Prestige
    "2026-02-27": 72478, // Sala samobójców
    "2026-02-28": 1417, // Labirynt fauna
    "2026-03-01": 141, // Donnie Darko
    "2026-03-02": 619, // Bodyguard
    "2026-03-03": 155, // Mroczny Rycerz
    "2026-03-04": 497, // Zielona mila
    "2026-03-05": 27205, // Incepcja
    "2026-03-06": 557, // Spider-Man (2002)
    "2026-03-07": 597, // Titanic
    "2026-03-08": 601, // E.T.
    "2026-03-09": 490132, // Green Book
    "2026-03-10": 19673, // Seksmisja
    "2026-03-11": 578, // Jaws
    "2026-03-12": 1087192, // Jak wytresować smoka
    "2026-03-13": 87827, // Life of Pi
    "2026-03-14": 10774, // Network
    "2026-03-15": 530915, // 1917
    "2026-03-16": 553, // Dogville
    "2026-03-17": 398818, // Call Me by Your Name
    "2026-03-18": 36685, // Rocky Horror Picture Show
    "2026-03-19": 9502, // Kung Fu Panda
    "2026-03-20": 376867, // Moonlight
    "2026-03-21": 13223, // Gran Torino
    "2026-03-22": 28, // Czas Apokalipsy
    "2026-03-23": 398978, // The Irishman
    "2026-03-24": 24, // Kill Bill
    "2026-03-25": 423, // Pianista
    "2026-03-26": 562, // Szklana pułapka
    "2026-03-27": 7345, // There Will Be Blood
    "2026-03-28": 438631, // Diuna (2021)
    "2026-03-29": 949, // Gorączka
    "2026-03-30": 680, // Pulp Fiction
    "2026-03-31": 78, // Blade Runner
    "2026-04-01": 374720, // Dunkierka
    "2026-04-02": 37799, // The Social Network
    "2026-04-03": 783, // Gandhi
    "2026-04-04": 1858, // Transformers
    "2026-04-05": 98, // Gladiator
    "2026-04-06": 219, // Volver
    "2026-04-07": 671, // Harry Potter i Kamień Filozoficzny
    "2026-04-08": 1726, // Iron Man
    "2026-04-09": 88, // Dirty Dancing
    "2026-04-10": 550, // Fight Club
    "2026-04-11": 77338, // Nietykalni
    "2026-04-12": 13, // Forrest Gump
    "2026-04-13": 185, // Mechaniczna pomarańcza
    "2026-04-14": 11, // Gwiezdne Wojny: Nowa nadzieja
    "2026-04-15": 334, // Magnolia
    "2026-04-16": 607, // Faceci w czerni
    "2026-04-17": 11216, // Cinema Paradiso
    "2026-04-18": 475557, // Joker
    "2026-04-19": 8358, // Cast Away
    "2026-04-20": 627, // Trainspotting
    "2026-04-21": 275, // Fargo
    "2026-04-22": 641, // Requiem dla snu
    "2026-04-23": 111, // Człowiek z blizną
    "2026-04-24": 380, // Rain Man
    "2026-04-25": 510, // Lot nad kukułczym gniazdem
    "2026-04-26": 19995, // Avatar
    "2026-04-27": 64690, // Drive
    "2026-04-28": 808, // Shrek
    "2026-04-29": 458723, // Us
    "2026-04-30": 100, // Lock, Stock and Two Smoking Barrels
    "2026-05-01": 120, // Władca Pierścieni: Drużyna Pierścienia
  };

// Initialize game
function init() {
    // Load data from embedded inline script
    if (typeof window.MOVIES_DATA !== 'undefined') {
        moviesList = window.MOVIES_DATA;
        console.log(`Załadowano ${moviesList.length} filmów`);
        
        // Prepare top 300 movies by popularity for random selection
        top300Movies = [...moviesList]
            .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 300);
        console.log(`Przygotowano top 300 filmów według popularity`);
    } else {
        console.error('Brak danych filmów! Upewnij się, że uruchomiłeś: node build-html.js');
        alert('Błąd: Brak danych filmów. Uruchom: node build-html.js');
        if (movieSearch) movieSearch.disabled = true;
        if (randomMovieBtn) randomMovieBtn.disabled = true;
        return;
    }
    
    // Track mouse position globally for tooltip detection
    document.addEventListener('mousemove', (e) => {
        if (tooltipState.sourceElement) {
            const tooltip = document.getElementById('customTooltip');
            if (tooltip && tooltip.style.visibility != 'hidden') {
                const x = e.clientX;
                const y = e.clientY;
                
                // Check if mouse is over source element
                const elementRect = tooltipState.sourceElement.getBoundingClientRect();
                const isOverElement = x >= elementRect.left && x <= elementRect.right &&
                                     y >= elementRect.top && y <= elementRect.bottom;
                
                // Check if mouse is over tooltip
                const tooltipRect = tooltip.getBoundingClientRect();
                const isOverTooltip = x >= tooltipRect.left && x <= tooltipRect.right &&
                                     y >= tooltipRect.top && y <= tooltipRect.bottom;
                
                // Hide if mouse is outside both (with small delay to prevent flickering)
                if (!isOverElement && !isOverTooltip) {
                    // Clear any existing timeout
                    if (tooltipState.hideTimeout) {
                        clearTimeout(tooltipState.hideTimeout);
                    }
                    // Add small delay to prevent hiding when quickly moving between elements
                    tooltipState.hideTimeout = setTimeout(() => {
                        hideTooltip();
                    }, 50);
                } else {
                    // Cancel hide if mouse is back over element or tooltip
                    if (tooltipState.hideTimeout) {
                        clearTimeout(tooltipState.hideTimeout);
                        tooltipState.hideTimeout = null;
                    }
                }
            }
        }
    });
    
    setupEventListeners();
    // Start game with today's date from calendar
    startNewGame('calendar', getTodayDateString());
}

// Setup event listeners
function setupEventListeners() {
    randomMovieBtn.addEventListener('click', () => {
        startNewGame('random');
    });
    
    movieDateInput.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            if (movieCalendar[selectedDate]) {
                startNewGame('calendar', selectedDate);
            } else {
                // Date selected but no movie for that date - show message and use random
                alert(`Brak filmu w kalendarzu dla wybranej daty. Wybieram losowy film.`);
                startNewGame('random');
            }
        }
    });
    
    // Set today's date as default and max date
    const todayDate = getTodayDateString();
    movieDateInput.value = todayDate;
    movieDateInput.max = todayDate; // Prevent selecting future dates
    
    movieSearch.addEventListener('input', handleSearchInput);
    movieSearch.addEventListener('keydown', handleSearchKeydown);
    
    // Close autocomplete when clicking outside
    document.addEventListener('click', (e) => {
        if (!movieSearch.contains(e.target) && !autocomplete.contains(e.target)) {
            autocomplete.classList.remove('show');
        }
    });
}

// Start a new game
function startNewGame(mode = 'calendar', selectedDate = null) {
    if (moviesList.length === 0) {
        alert('Brak filmów do załadowania');
        return;
    }

    let movieId = null;
    
    if (mode === 'calendar') {
        // Use calendar - default to today's date
        const dateStr = selectedDate || getTodayDateString();
        movieId = movieCalendar[dateStr];
        
        if (!movieId) {
            // If no movie for today, fall back to random
            console.warn(`Brak filmu w kalendarzu dla daty ${dateStr}, wybieram losowy film`);
            const randomIndex = Math.floor(Math.random() * moviesList.length);
            mysteryMovie = moviesList[randomIndex];
        } else {
            // Find movie by ID
            mysteryMovie = moviesList.find(m => m.id === movieId);
            if (!mysteryMovie) {
                console.warn(`Nie znaleziono filmu o ID ${movieId}, wybieram losowy film`);
                const randomIndex = Math.floor(Math.random() * moviesList.length);
                mysteryMovie = moviesList[randomIndex];
            }
        }
    } else if (mode === 'random') {
        // Pick random movie from top 300 by popularity
        if (top300Movies.length === 0) {
            // Fallback: if top300Movies wasn't prepared, prepare it now
            top300Movies = [...moviesList]
                .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
                .slice(0, 300);
        }
        const randomIndex = Math.floor(Math.random() * top300Movies.length);
        mysteryMovie = top300Movies[randomIndex];
    }
    
    attempts = 0;
    gameWon = false;
    attemptsCounter.textContent = attempts;
    guessesContainer.innerHTML = '';
    winMessage.classList.add('hidden');
    movieSearch.value = '';
    movieSearch.disabled = false;
    movieSearch.focus();
    
    // Update movie title hint with underscores
    updateMovieTitleHint();
    
    console.log('Tajemniczy film:', mysteryMovie.title, mysteryMovie.original_title);
}

// Generate underscores hint for movie title
function updateMovieTitleHint() {
    if (!mysteryMovie || !movieTitleHint) return;
    
    // Use Polish title if available, otherwise original title
    const title = mysteryMovie.title || mysteryMovie.original_title || '';
    
    // Create underscores for each letter, preserving spaces
    const hint = title
        .split('')
        .map(char => {
            if (char === ' ') {
                return '     '; // 5 spaces for word separation
            } else if (/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(char)) {
                return '_'; // Underscore for letters
            } else {
                return char; // Keep punctuation and other characters as-is
            }
        })
        .join(' ');
    
    movieTitleHint.textContent = hint;
}

// Get today's date as YYYY-MM-DD string
function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Handle search input
function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
        autocomplete.classList.remove('show');
        return;
    }
    
    const matches = searchMovies(query);
    displayAutocomplete(matches);
}

// Normalize Polish characters for search
function normalizePolish(text) {
    if (!text) return '';
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .replace(/ą/g, 'a')
        .replace(/ć/g, 'c')
        .replace(/ę/g, 'e')
        .replace(/ł/g, 'l')
        .replace(/ń/g, 'n')
        .replace(/ó/g, 'o')
        .replace(/ś/g, 's')
        .replace(/ź/g, 'z')
        .replace(/ż/g, 'z');
}

// Search movies by title and original title
function searchMovies(query) {
    const normalizedQuery = normalizePolish(query);
    return moviesList.filter(movie => {
        const normalizedTitle = normalizePolish(movie.title);
        const normalizedOriginalTitle = normalizePolish(movie.original_title);
        return normalizedTitle.includes(normalizedQuery) || 
               normalizedOriginalTitle.includes(normalizedQuery);
    }).slice(0, 10); // Limit to 10 results
}

// Display autocomplete suggestions
function displayAutocomplete(matches) {
    if (matches.length === 0) {
        autocomplete.classList.remove('show');
        return;
    }
    
    autocomplete.innerHTML = matches.map(movie => {
        const posterUrl = movie.poster_path 
            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
            : '';
        return `
        <div class="autocomplete-item" data-id="${movie.id}">
            ${posterUrl ? `<img src="${posterUrl}" alt="${movie.title}" class="autocomplete-poster" onerror="this.style.display='none'">` : ''}
            <div class="autocomplete-text">
                <strong>${movie.title}</strong>
                ${movie.original_title !== movie.title ? `<br><small>${movie.original_title}</small>` : ''}
            </div>
        </div>
    `;
    }).join('');
    
    autocomplete.classList.add('show');
    
    // Add click listeners
    autocomplete.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const movieId = parseInt(item.dataset.id);
            const selectedMovie = moviesList.find(m => m.id === movieId);
            if (selectedMovie) {
                selectMovie(selectedMovie);
            }
        });
    });
}

// Handle keyboard navigation
function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        const firstItem = autocomplete.querySelector('.autocomplete-item');
        if (firstItem) {
            const movieId = parseInt(firstItem.dataset.id);
            const selectedMovie = moviesList.find(m => m.id === movieId);
            if (selectedMovie) {
                selectMovie(selectedMovie);
            }
        }
    } else if (e.key === 'Escape') {
        autocomplete.classList.remove('show');
    }
}

// Select a movie and process guess
function selectMovie(movie) {
    if (gameWon) return;
    
    autocomplete.classList.remove('show');
    movieSearch.value = movie.title;
    
    // All data is already in movies.json, no need to load separately
    const guessedMovieDetails = movie;
    
    attempts++;
    attemptsCounter.textContent = attempts;
    
    // Compare movies
    const comparison = compareMovies(guessedMovieDetails, mysteryMovie);
    
    // Display guess
    displayGuess(guessedMovieDetails, comparison);
    
    // Check if won
    if (movie.id === mysteryMovie.id) {
        gameWon = true;
        winAttempts.textContent = attempts;
        winMessage.classList.remove('hidden');
        movieSearch.disabled = true;
        // Scroll to top to show win message
        winMessage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    movieSearch.value = '';
}

// Compare two movies
function compareMovies(guessed, mystery) {
    const comparison = {};
    
    // Release year
    const guessedYear = guessed.release_date ? new Date(guessed.release_date).getFullYear() : 0;
    const mysteryYear = mystery.release_date ? new Date(mystery.release_date).getFullYear() : 0;
    comparison.year = {
        guessed: guessedYear || 'Nieznany',
        mystery: mysteryYear || 'Nieznany',
        result: guessedYear === 0 || mysteryYear === 0 ? 'unknown' : 
                (guessedYear === mysteryYear ? 'match' : (guessedYear > mysteryYear ? 'higher' : 'lower'))
    };
    
    // Genres - already strings in movies.json
    const guessedGenres = guessed.genres || [];
    const mysteryGenres = mystery.genres || [];
    const commonGenres = guessedGenres.filter(g => mysteryGenres.includes(g));
    comparison.genres = {
        guessed: guessedGenres,
        mystery: mysteryGenres,
        matches: commonGenres,
        hasMatch: commonGenres.length > 0
    };
    
    // Budget
    const guessedBudget = guessed.budget || 0;
    const mysteryBudget = mystery.budget || 0;
    comparison.budget = {
        guessed: guessedBudget,
        mystery: mysteryBudget,
        result: guessedBudget === mysteryBudget ? 'match' : (guessedBudget > mysteryBudget ? 'higher' : 'lower')
    };
    
    // Revenue
    const guessedRevenue = guessed.revenue || 0;
    const mysteryRevenue = mystery.revenue || 0;
    comparison.revenue = {
        guessed: guessedRevenue,
        mystery: mysteryRevenue,
        result: guessedRevenue === mysteryRevenue ? 'match' : (guessedRevenue > mysteryRevenue ? 'higher' : 'lower')
    };
    
    // Production companies
    const guessedCompanies = (guessed.production_companies || []).map(c => c.name);
    const mysteryCompanies = (mystery.production_companies || []).map(c => c.name);
    const commonCompanies = guessedCompanies.filter(c => mysteryCompanies.includes(c));
    comparison.companies = {
        guessed: guessedCompanies,
        mystery: mysteryCompanies,
        matches: commonCompanies,
        hasMatch: commonCompanies.length > 0
    };
    
    // Production countries
    const guessedCountries = (guessed.production_countries || []).map(c => c.name);
    const mysteryCountries = (mystery.production_countries || []).map(c => c.name);
    const commonCountries = guessedCountries.filter(c => mysteryCountries.includes(c));
    comparison.countries = {
        guessed: guessedCountries,
        mystery: mysteryCountries,
        matches: commonCountries,
        hasMatch: commonCountries.length > 0
    };
    
    // Cast - from top_cast array
    const guessedCast = (guessed.top_cast || []).map(a => a.name);
    const mysteryCast = (mystery.top_cast || []).map(a => a.name);
    const commonCast = guessedCast.filter(a => mysteryCast.includes(a));
    comparison.cast = {
        guessed: guessedCast,
        mystery: mysteryCast,
        matches: commonCast,
        hasMatch: commonCast.length > 0
    };
    
    // Director - from director object
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

// Get genre icon
function getGenreIcon(genreName) {
    return genreIcons[genreName] || '🎬';
}

// Get country flag URL
function getCountryFlagUrl(countryCode) {
    if (!countryCode) return '';
    return `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
}

// Get country name in Polish using Intl API
function getCountryNamePL(countryCode) {
    if (!countryCode) return '';
    try {
        const displayNames = new Intl.DisplayNames(['pl'], { type: 'region' });
        return displayNames.of(countryCode.toUpperCase());
    } catch (e) {
        // Fallback to code if translation fails
        return countryCode;
    }
}

// Get actor initials
function getActorInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Get company initials
function getCompanyInitials(name) {
    if (!name) return '?';
    // Take first 2-3 letters or first letters of words
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
}

// Show custom tooltip
function showTooltip(text, element, imageUrl = null) {
    // Cancel any pending hide operation
    if (tooltipState.hideTimeout) {
        clearTimeout(tooltipState.hideTimeout);
        tooltipState.hideTimeout = null;
    }
    
    const tooltip = document.getElementById('customTooltip');
    
    // Immediately show and clear previous state
    tooltip.classList.remove('hidden');
    tooltip.style.visibility = 'hidden';
    tooltip.style.display = 'block';
    
    // Clear previous content
    tooltip.innerHTML = '';
    
    // Add text
    if (text) {
        const textEl = document.createElement('div');
        textEl.className = 'tooltip-text';
        textEl.textContent = text;
        tooltip.appendChild(textEl);
    }
    
    // Add image if provided
    if (imageUrl) {
        const imgEl = document.createElement('img');
        imgEl.src = imageUrl;
        imgEl.className = 'tooltip-image';
        imgEl.alt = text || '';
        tooltip.appendChild(imgEl);
    }
    
    // Force reflow to get actual dimensions
    const tooltipRect = tooltip.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    
    // Position tooltip above element, centered
    let top = rect.top - tooltipRect.height - 10;
    let left = rect.left + (rect.width / 2);
    
    // Adjust if tooltip goes off screen
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
    
    // Now make it visible
    tooltip.style.visibility = 'visible';
    
    // Update state
    tooltipState.isVisible = true;
    tooltipState.sourceElement = element;
}

// Hide custom tooltip
function hideTooltip() {
    const tooltip = document.getElementById('customTooltip');
    tooltip.classList.add('hidden');
    tooltip.style.visibility = 'hidden';
    
    // Clear state
    tooltipState.sourceElement = null;
    if (tooltipState.hideTimeout) {
        clearTimeout(tooltipState.hideTimeout);
        tooltipState.hideTimeout = null;
    }
}

// Display a guess with comparison
function displayGuess(movie, comparison) {
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : '?';
    const posterUrl = movie.poster_path 
        ? `https://image.tmdb.org/t/p/w154${movie.poster_path}`
        : '';
    
    const guessCard = document.createElement('div');
    guessCard.className = 'guess-card';
    
    // Year comparison - arrow points down if mystery is older (lower year)
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
        // Guessed year is higher (newer) than mystery, so mystery is older - arrow down
        yearClass = 'hint-yellow';
        yearArrow = '↓';
        yearTooltip = `Rok wydania: ${year} ↓\ntajemniczy film jest starszy`;
    } else {
        // Guessed year is lower (older) than mystery, so mystery is newer - arrow up
        yearClass = 'hint-red';
        yearArrow = '↑';
        yearTooltip = `Rok wydania: ${year} ↑\ntajemniczy film jest nowszy`;
    }
    
    // Budget comparison - arrow points down if mystery has smaller budget
    let budgetClass = 'hint-red';
    let budgetArrow = '';
    let budgetTooltip = '';
    const budgetValue = formatCurrencyShort(movie.budget || 0);
    if (comparison.budget.result === 'match') {
        budgetClass = 'hint-green';
        budgetArrow = '=';
        budgetTooltip = `Budżet: ${budgetValue} =\ntajemniczy film ma ten sam budżet`;
    } else if (comparison.budget.result === 'higher') {
        // Guessed budget is higher, so mystery has smaller budget - arrow down
        budgetClass = 'hint-yellow';
        budgetArrow = '↓';
        budgetTooltip = `Budżet: ${budgetValue} ↓\ntajemniczy film ma mniejszy budżet`;
    } else {
        // Guessed budget is lower, so mystery has bigger budget - arrow up
        budgetClass = 'hint-red';
        budgetArrow = '↑';
        budgetTooltip = `Budżet: ${budgetValue} ↑\ntajemniczy film ma większy budżet`;
    }
    
    // Revenue comparison - arrow points down if mystery has smaller revenue
    let revenueClass = 'hint-red';
    let revenueArrow = '';
    let revenueTooltip = '';
    const revenueValue = formatCurrencyShort(movie.revenue || 0);
    if (comparison.revenue.result === 'match') {
        revenueClass = 'hint-green';
        revenueArrow = '=';
        revenueTooltip = `Przychód: ${revenueValue} =\ntajemniczy film ma ten sam przychód`;
    } else if (comparison.revenue.result === 'higher') {
        // Guessed revenue is higher, so mystery has smaller revenue - arrow down
        revenueClass = 'hint-yellow';
        revenueArrow = '↓';
        revenueTooltip = `Przychód: ${revenueValue} ↓\ntajemniczy film ma mniejszy przychód`;
    } else {
        // Guessed revenue is lower, so mystery has bigger revenue - arrow up
        revenueClass = 'hint-red';
        revenueArrow = '↑';
        revenueTooltip = `Przychód: ${revenueValue} ↑\ntajemniczy film ma większy przychód`;
    }
    
    // Genres - all (already strings in movies.json)
    const guessedGenres = (movie.genres || []).map(genreName => {
        const isMatch = comparison.genres.matches.includes(genreName);
        return {
            name: genreName,
            icon: getGenreIcon(genreName),
            isMatch: isMatch
        };
    });
    
    // Companies - top 3
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
    
    // Countries - top 3
    const guessedCountries = (movie.production_countries || []).slice(0, 3).map(c => {
        const isMatch = comparison.countries.matches.includes(c.name);
        return {
            name: c.name,
            namePL: getCountryNamePL(c.iso_3166_1),
            code: c.iso_3166_1,
            isMatch: isMatch
        };
    });
    
    // Director - from director object
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
    
    // Cast - top 3 from top_cast array
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
    
    // Add tooltip event listeners
    guessCard.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', (e) => {
            const tooltipText = e.target.getAttribute('data-tooltip');
            const imageUrl = e.target.getAttribute('data-image');
            showTooltip(tooltipText, e.target, imageUrl || null);
        });
    });
    
    // Check if background images loaded for actors/directors, show initials if not
    guessCard.querySelectorAll('.actor-photo.has-image, .director-photo.has-image').forEach(element => {
        const bgImage = element.style.backgroundImage;
        if (bgImage && bgImage !== 'none') {
            const img = new Image();
            img.src = bgImage.replace(/url\(['"]?([^'"]+)['"]?\)/, '$1');
            img.onerror = () => {
                // Image failed to load, show initials
                element.classList.remove('has-image');
                element.style.backgroundImage = 'none';
            };
            img.onload = () => {
                // Image loaded successfully, hide initials
                const initialsEl = element.querySelector('.actor-initials-fallback');
                if (initialsEl) {
                    initialsEl.style.display = 'none';
                }
            };
        }
    });
    
    guessesContainer.insertBefore(guessCard, guessesContainer.firstChild);
}

// Format currency for display
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
