import { Translations } from "./types";

const en: Translations = {
  home: {
    title: "Play",
    subtitle:
      "Guess the daily movie or discover your perfect pick for tonight — all in one place.",
  },
  modes: {
    dailyMovie: "Daily Movie",
    dailyMovieDesc:
      "Guess today's featured film from parameter comparisons. Resets at midnight.",
    playChallenge: "Play Challenge",
    popular: "Popular",
    new: "New",
  },
  recommend: {
    modeTitle: "What to Watch?",
    modeDesc:
      "Got the snacks but no movie? Tell us what you like and we'll pick something perfect for tonight.",
    getRecommendations: "Find my movies",
  },
  game: {
    back: "Back",
    dailyMovie: "Daily Movie",
    attempt: "Attempt",
    giveUp: "Give Up",
    searchPlaceholder: "Type a movie title...",
    emptyState: "Type a movie title to start guessing",
    won: "Well done!",
    wonMessage: (title: string, attempts: number) =>
      `You guessed "${title}" in ${attempts} ${attempts === 1 ? "attempt" : "attempts"}!`,
    lost: "Game Over",
    lostMessage: (title: string, year: number) =>
      `The answer was: ${title} (${year})`,
    correct: "Correct!",
    nextIn: "Next in",
    loadError: "Failed to load the movie. Please try again later.",
  },
  comparison: {
    year: "Year",
    genre: "Genre",
    country: "Country",
    director: "Director",
    leadActor: "Lead Actor",
    runtime: "Runtime",
    budget: "Budget",
    popularity: "Popularity",
    rating: "Rating",
  },
  popularity: {
    low: "Low",
    medium: "Medium",
    high: "High",
    veryHigh: "Very high",
    mega: "Mega",
  },
  hints: {
    title: "Hints",
    directorIs: (name: string) => `Director: ${name}`,
    genresAre: (genres: string) => `Genres: ${genres}`,
    tagline: (tagline: string) => `Tagline: "${tagline}"`,
    overview: (text: string) => `Synopsis: ${text}...`,
  },
  result: {
    youGuessed: "You guessed it!",
    attempts: "Attempts",
    hintsUsed: "Hints used",
    accuracy: "Accuracy",
    share: "Share Result",
    copied: "Copied!",
    shareText: (title: string, attempts: number, max: number) =>
      `Showle - Daily Movie\n\nI guessed "${title}" in ${attempts}/${max} attempts!\n\nhttps://showle.app`,
  },
};

export default en;
