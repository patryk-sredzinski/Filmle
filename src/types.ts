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
}

// Raw API response wrapper (with optional date field)
export interface RawMovieResponseWrapper {
    date?: string;
    movie: RawMovieResponse;
}

export type ComparisonResult = 'match' | 'close' | 'far' | 'unknown';

export type YearDirection = 'much_newer' | 'newer' | 'match' | 'older' | 'much_older' | 'unknown';

export interface YearComparison {
    guessed: number | string;
    mystery: number | string;
    result: YearDirection;
    yearDiff: number;
}

export type BudgetDirection = 'much_higher' | 'higher' | 'match' | 'lower' | 'much_lower' | 'unknown';

export interface BudgetComparison {
    guessed: number;
    mystery: number;
    result: BudgetDirection;
    ratio: number;
}

export interface RevenueComparison {
    guessed: number;
    mystery: number;
    result: BudgetDirection;
    ratio: number;
}

export interface GenresComparison {
    guessed: string[];
    mystery: string[];
    matches: string[];
    hasMatch: boolean;
}


export interface CompaniesComparison {
    guessed: string[];
    mystery: string[];
    matches: string[];
    hasMatch: boolean;
}

export interface CountriesComparison {
    guessed: string[];
    mystery: string[];
    matches: string[];
    hasMatch: boolean;
}

export interface CastComparison {
    guessed: string[];
    mystery: string[];
    matches: string[];
    hasMatch: boolean;
    guessedWithOrder: Array<{ name: string; isMatch: boolean; originalOrder: number }>;
}

export interface DirectorComparison {
    guessed: string[];
    mystery: string[];
    matches: string[];
    hasMatch: boolean;
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

