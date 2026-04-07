export type MediaType = "movie" | "series";

export interface MediaDetails {
  id: number;
  title: string;
  type: MediaType;
  year: number;
  genres: string[];
  country: string;
  director: string;
  leadActor: string;
  runtime: number;
  budget: number;
  popularity: number;
  rating: number;
  posterPath: string;
  overview: string;
  tagline?: string;
}

export type MatchStatus = "exact" | "partial" | "miss";
export type Direction = "up" | "down" | null;

export interface ComparisonField {
  label: string;
  guessValue: string;
  answerValue: string;
  status: MatchStatus;
  direction?: Direction;
}

export interface GuessResult {
  guess: MediaDetails;
  comparison: ComparisonField[];
  isCorrect: boolean;
  attemptNumber: number;
}

export interface Hint {
  id: number;
  type:
    | "director_letter"
    | "director"
    | "genre"
    | "decade"
    | "country"
    | "trivia"
    | "director_initials"
    | "cast"
    | "country"
    | "title_reveal";
  content: string;
  revealedAt: number;
  paid?: boolean;
}

export type GameStatus = "playing" | "won" | "lost";
