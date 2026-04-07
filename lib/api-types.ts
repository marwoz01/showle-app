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
  extraAttempts?: number;
  paidHintUsed?: boolean;
  paidHintsCount?: number;
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
  coinBalance: number;
  streakFreezes: number;
}

// ── Wallet / Coins ──

export interface WalletResponse {
  balance: number;
  streakFreezes: number;
}

export interface SpendCoinsBody {
  action: "buy_hint" | "buy_attempt" | "buy_freeze";
  dateKey?: string;
}

export interface SpendCoinsResponse {
  balance: number;
  streakFreezes: number;
  success: boolean;
}

export interface StreakCheckResponse {
  status: "ok" | "freeze_used" | "streak_broken";
  previousStreak?: number;
  remainingFreezes?: number;
}

export interface CompleteResponse extends GameStateResponse {
  coinsEarned: number;
  newBalance: number;
  streakMilestone: number | null;
  freezeUsed: boolean;
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

// ── Collection Stats ──

export interface CollectionStatsResponse {
  totalMovies: number;
  totalHours: number;
  totalMinutes: number;
  favoriteGenre: string | null;
}

// ── Recommendations ──

export interface RecommendRequest {
  genres: string[];
  yearFrom: number;
  yearTo: number;
  popularity: string;
  locale: string;
  exclude?: number[];
  freeformText?: string;
  excludeWatched?: boolean;
}

export interface RecommendationResult {
  movie: {
    id: number;
    title: string;
    year: number;
    genres: string[];
    runtime: number;
    rating: number;
    posterPath: string;
    overview: string;
    director: string;
    country: string;
    leadActor: string;
    popularity: number;
    budget: number;
    type: string;
    tagline?: string;
  };
  justification: string;
}
