export interface Translations {
  home: {
    title: string;
    subtitle: string;
  };
  modes: {
    dailyMovie: string;
    dailyMovieDesc: string;
    playChallenge: string;
    popular: string;
    new: string;
  };
  recommend: {
    modeTitle: string;
    modeDesc: string;
    getRecommendations: string;
  };
  game: {
    back: string;
    dailyMovie: string;
    attempt: string;
    giveUp: string;
    searchPlaceholder: string;
    emptyState: string;
    won: string;
    wonMessage: (title: string, attempts: number) => string;
    lost: string;
    lostMessage: (title: string, year: number) => string;
    correct: string;
    nextIn: string;
    loadError: string;
  };
  comparison: {
    year: string;
    genre: string;
    country: string;
    director: string;
    leadActor: string;
    runtime: string;
    budget: string;
    popularity: string;
    rating: string;
  };
  popularity: {
    low: string;
    medium: string;
    high: string;
    veryHigh: string;
    mega: string;
  };
  hints: {
    title: string;
    directorIs: (name: string) => string;
    genresAre: (genres: string) => string;
    tagline: (tagline: string) => string;
    overview: (text: string) => string;
  };
  auth: {
    signIn: string;
    signUp: string;
    signInSubtitle: string;
    signUpSubtitle: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    passwordPlaceholder: string;
    noAccount: string;
    haveAccount: string;
    signInError: string;
    signUpError: string;
    verificationTitle: string;
    verificationSubtitle: string;
    verificationCode: string;
    verify: string;
    continueWithGoogle: string;
    orWithEmail: string;
  };
  profile: {
    title: string;
    signOut: string;
    gamesPlayed: string;
    gamesWon: string;
    winRate: string;
    currentStreak: string;
    maxStreak: string;
    averageGuesses: string;
    gameHistory: string;
    noGamesYet: string;
    won: string;
    lost: string;
    attempts: string;
    loadError: string;
  };
  result: {
    youGuessed: string;
    attempts: string;
    hintsUsed: string;
    accuracy: string;
    share: string;
    copied: string;
    shareText: (title: string, attempts: number, max: number) => string;
  };
}
