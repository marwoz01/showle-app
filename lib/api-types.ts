export interface GameStateResponse {
  id: string;
  userId: string;
  dateKey: string;
  mode: string;
  status: "playing" | "won" | "lost";
  guessIds: number[];
  attemptCount: number;
  hintsUsed: number;
  completedAt: string | null;
  targetMovieId: number;
  targetTitle: string;
  targetYear: number;
  targetPoster: string;
}

export interface SaveStateBody {
  dateKey: string;
  mode: string;
  status: "playing" | "won" | "lost";
  guessIds: number[];
  attemptCount: number;
  hintsUsed: number;
  targetMovieId: number;
  targetTitle: string;
  targetYear: number;
  targetPoster: string;
}

export type CompleteBody = SaveStateBody;

export interface HistoryResponse {
  items: GameStateResponse[];
  total: number;
  page: number;
  perPage: number;
}

export interface UserStatsResponse {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  averageGuesses: number;
}

// ── Collection ──

export interface SavedMovie {
  id: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string;
  genres: string[];
  director: string;
  overview: string;
  runtime: number;
  tmdbRating: number;
  category: "watched" | "watchlist";
  rating: number | null;
  review: string | null;
  watchedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveMovieBody {
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string;
  genres: string[];
  director: string;
  overview: string;
  runtime: number;
  tmdbRating: number;
  category: "watched" | "watchlist";
  rating?: number;
  review?: string;
}

export interface CollectionResponse {
  items: SavedMovie[];
  total: number;
}

export type CollectionSort = "date" | "rating" | "title" | "year";
export type CollectionCategory = "watched" | "watchlist";

// ── Rankings ──

export interface RankedListItem {
  id: string;
  listId: string;
  tmdbId: number;
  title: string;
  year: number;
  posterPath: string;
  genres: string[];
  director: string;
  overview: string;
  position: number;
}

export interface RankedList {
  id: string;
  name: string;
  description: string | null;
  items: RankedListItem[];
  _count?: { items: number };
  createdAt: string;
  updatedAt: string;
}
