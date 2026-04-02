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
