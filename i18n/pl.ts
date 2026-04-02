import { Translations } from "./types";

const pl: Translations = {
  home: {
    title: "Graj",
    subtitle:
      "Zgaduj film dnia albo odkryj idealny tytuł na wieczór, wszystko w jednym miejscu!",
  },
  modes: {
    dailyMovie: "Film dnia",
    dailyMovieDesc:
      "Odgadnij dzisiejszy film na podstawie porównań parametrów. Resetuje się o północy.",
    playChallenge: "Zagraj",
    popular: "Popularne",
    new: "Nowość",
  },
  recommend: {
    modeTitle: "Co obejrzeć?",
    modeDesc:
      "Nie wiesz, co obejrzeć? Dobierzemy film idealnie pasujący do Twojego nastroju.",
    getRecommendations: "Dobierz film",
  },
  game: {
    back: "Powrót",
    dailyMovie: "Film dnia",
    attempt: "Próba",
    giveUp: "Poddaj się",
    searchPlaceholder: "Wpisz tytuł filmu...",
    emptyState: "Wpisz tytuł filmu, żeby zacząć zgadywanie",
    won: "Brawo!",
    wonMessage: (title: string, attempts: number) =>
      `Odgadłeś "${title}" w ${attempts} ${attempts === 1 ? "próbie" : "próbach"}!`,
    lost: "Koniec gry",
    lostMessage: (title: string, year: number) =>
      `Prawidłowa odpowiedź: ${title} (${year})`,
    correct: "Trafione!",
    nextIn: "Następny za",
    loadError: "Nie udało się załadować filmu. Spróbuj ponownie później.",
  },
  comparison: {
    year: "Rok",
    genre: "Gatunek",
    country: "Kraj",
    director: "Reżyser",
    leadActor: "Aktor",
    runtime: "Czas",
    budget: "Budżet",
    popularity: "Popularność",
    rating: "Ocena",
  },
  popularity: {
    low: "Niska",
    medium: "Średnia",
    high: "Wysoka",
    veryHigh: "Bardzo wysoka",
    mega: "Mega",
  },
  hints: {
    title: "Wskazówki",
    directorIs: (name: string) => `Reżyser: ${name}`,
    genresAre: (genres: string) => `Gatunki: ${genres}`,
    tagline: (tagline: string) => `Tagline: "${tagline}"`,
    overview: (text: string) => `Opis: ${text}...`,
  },
  result: {
    youGuessed: "Udało się!",
    attempts: "Próby",
    hintsUsed: "Wskazówki",
    accuracy: "Trafność",
    share: "Udostępnij wynik",
    copied: "Skopiowano!",
    shareText: (title: string, attempts: number, max: number) =>
      `Showle - Film dnia\n\nOdgadłem "${title}" w ${attempts}/${max} próbach!\n\nhttps://showle.app`,
  },
};

export default pl;
