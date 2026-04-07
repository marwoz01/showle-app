import { MediaDetails, Hint } from "@/types";
import { Translations } from "@/i18n/types";

export function generateHints(answer: MediaDetails, t: Translations): Hint[] {
  return [
    {
      id: 1,
      type: "trivia",
      content: answer.tagline
        ? t.hints.tagline(answer.tagline)
        : t.hints.genresAre(answer.genres.join(", ")),
      revealedAt: 2,
    },
    {
      id: 2,
      type: "cast",
      content: t.hints.leadActorIs(answer.leadActor),
      revealedAt: 4,
    },
    {
      id: 3,
      type: "director",
      content: t.hints.directorIs(answer.director),
      revealedAt: 6,
    },
  ];
}

export function getRevealedHints(allHints: Hint[], attemptCount: number): Hint[] {
  return allHints.filter((h) => h.revealedAt <= attemptCount);
}
