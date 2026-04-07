export const MAX_ATTEMPTS = 7;

export const COIN_REWARDS: Record<number, number> = {
  1: 50, 2: 40, 3: 30, 4: 25, 5: 20, 6: 15,
};

export const COST_HINT = 60;
export const COST_EXTRA_ATTEMPT = 40;
export const COST_STREAK_FREEZE = 200;
export const MAX_EXTRA_ATTEMPTS = 3;
export const MAX_STREAK_FREEZES = 3;

// Field keys that can be revealed by buying hints
export const REVEALABLE_FIELDS = [
  "year", "genre", "country", "director", "leadActor", "runtime", "popularity", "budget", "rating",
] as const;
export type RevealableField = (typeof REVEALABLE_FIELDS)[number];
