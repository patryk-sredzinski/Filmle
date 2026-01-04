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

export interface MovieResponse {
    movie: Movie;
}

export type ComparisonResult = 'match' | 'higher' | 'lower' | 'unknown';

export interface YearComparison {
    guessed: number | string;
    mystery: number | string;
    result: ComparisonResult;
}

export interface GenresComparison {
    guessed: string[];
    mystery: string[];
    matches: string[];
    hasMatch: boolean;
}

export interface BudgetComparison {
    guessed: number;
    mystery: number;
    result: ComparisonResult;
}

export interface RevenueComparison {
    guessed: number;
    mystery: number;
    result: ComparisonResult;
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

