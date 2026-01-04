// Type definitions for Filmole

export interface Genre {
    name: string;
}

export interface ProductionCompany {
    name: string;
    logo_path: string | null;
}

export interface ProductionCountry {
    name: string;
    iso_3166_1: string;
}

export interface CastMember {
    name: string;
    profile_path: string | null;
}

export interface Director {
    name: string;
    profile_path: string | null;
}

export interface Movie {
    id: number;
    title: string;
    original_title?: string;
    release_date: string | null;
    poster_path: string | null;
    genres: Genre[];
    budget: number;
    revenue: number;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    top_cast: CastMember[];
    director: Director | null;
    description?: string | null;
    quote_pl?: string | null;
    quote_en?: string | null;
}

export interface MovieSearchResult {
    id: number;
    title: string;
    original_title?: string;
    poster_path: string | null;
}

export interface MovieSearchResponse {
    results: MovieSearchResult[];
}

// Raw API response types
export interface RawCastMember {
    name: string;
    profile_path: string | null;
    order: number;
    character?: string;
}

export interface RawCrewMember {
    name: string;
    profile_path: string | null;
    job: string;
    department: string;
}

export interface RawMovieResponse {
    id: number;
    title: string;
    original_title?: string;
    release_date: string | null;
    poster_path: string | null;
    genres: Genre[];
    budget: number;
    revenue: number;
    production_companies: ProductionCompany[];
    production_countries: ProductionCountry[];
    cast: RawCastMember[];
    crew: RawCrewMember[];
    description?: string | null;
    quote_pl?: string | null;
    quote_en?: string | null;
}

// Raw API response wrapper (with optional date field)
export interface RawMovieResponseWrapper {
    date?: string;
    movie: RawMovieResponse;
}

// Simplified comparison models - only data needed for rendering

// For guess mode: value is the guessed value, arrow indicates direction
// For mystery mode: min/max define the range, isClose indicates if it's a close match
export interface YearComparison {
    value?: number; // For guess mode
    arrow?: string; // For guess mode: '=', '↑', '↓', '↑↑', '↓↓', '?'
    min?: number | null; // For mystery mode
    max?: number | null; // For mystery mode
    isClose?: boolean; // For mystery mode
}

export interface BudgetComparison {
    value?: number; // For guess mode
    arrow?: string; // For guess mode: '=', '↑', '↓', '↑↑', '↓↓', '?'
    min?: number | null; // For mystery mode
    max?: number | null; // For mystery mode
    isClose?: boolean; // For mystery mode
}

export interface RevenueComparison {
    value?: number; // For guess mode
    arrow?: string; // For guess mode: '=', '↑', '↓', '↑↑', '↓↓', '?'
    min?: number | null; // For mystery mode
    max?: number | null; // For mystery mode
    isClose?: boolean; // For mystery mode
}

// Simple match comparison - just isMatch for each item
export interface GenresComparison {
    items: Array<{ name: string; isMatch: boolean }>;
}

export interface CompaniesComparison {
    items: Array<{ name: string; logo_path: string | null; isMatch: boolean }>;
}

export interface CountriesComparison {
    items: Array<{ name: string; iso_3166_1: string; isMatch: boolean }>;
}

export interface CastComparison {
    items: Array<{ name: string; profile_path: string | null; isMatch: boolean }>;
}

export interface DirectorComparison {
    isMatch: boolean;
}

export interface MovieComparison {
    year: YearComparison;
    genres: GenresComparison;
    budget: BudgetComparison;
    revenue: RevenueComparison;
    companies: CompaniesComparison;
    countries: CountriesComparison;
    cast: CastComparison;
    director: DirectorComparison;
}

export interface TooltipState {
    sourceElement: HTMLElement | null;
    hideTimeout: number | null;
}

