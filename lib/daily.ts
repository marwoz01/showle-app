import eligibleMovies from "@/data/eligible-movies.json";
import { getMovieDetails } from "./tmdb";
import { MediaDetails } from "@/types";

const POOL_SIZE = eligibleMovies.length;
const NO_REPEAT_DAYS = 90;

export function getTodayKey(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
}

export function getTimeUntilReset(): number {
  // Get current Warsaw time using Intl (works on Hermes)
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Warsaw",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  const parts = formatter.formatToParts(new Date());
  const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const m = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  const s = Number(parts.find((p) => p.type === "second")?.value ?? 0);

  const secondsUntilMidnight = (24 - h - 1) * 3600 + (60 - m - 1) * 60 + (60 - s);
  return secondsUntilMidnight * 1000;
}

function hashDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getDailyIndex(dateStr: string): number {
  const recentIndices = new Set<number>();
  const date = new Date(dateStr + "T00:00:00");

  for (let d = 1; d <= NO_REPEAT_DAYS; d++) {
    const prev = new Date(date);
    prev.setDate(prev.getDate() - d);
    const prevStr = prev.toISOString().slice(0, 10);
    const prevHash = hashDate(prevStr);
    recentIndices.add(prevHash % POOL_SIZE);
  }

  const baseHash = hashDate(dateStr);
  let index = baseHash % POOL_SIZE;

  let attempt = 0;
  while (recentIndices.has(index) && attempt < POOL_SIZE) {
    attempt++;
    index = (baseHash + attempt) % POOL_SIZE;
  }

  return index;
}

export async function getDailyMovie(dateKey?: string): Promise<MediaDetails | null> {
  const today = dateKey || getTodayKey();
  const index = getDailyIndex(today);
  const movie = eligibleMovies[index];
  return getMovieDetails(movie.id);
}
