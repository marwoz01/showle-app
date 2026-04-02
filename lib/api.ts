import Constants from "expo-constants";
import {
  GameStateResponse,
  SaveStateBody,
  CompleteBody,
  HistoryResponse,
  UserStatsResponse,
} from "./api-types";

const BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl || "https://showle.vercel.app";

let _getToken: (() => Promise<string | null>) | null = null;

export function setTokenGetter(fn: () => Promise<string | null>) {
  _getToken = fn;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function authFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = _getToken ? await _getToken() : null;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, await res.text());
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (null as T);
}

export const api = {
  game: {
    getState: (dateKey: string) =>
      authFetch<GameStateResponse | null>(
        `/api/game/state?dateKey=${dateKey}&mode=daily-movie`,
      ),

    saveState: (body: SaveStateBody) =>
      authFetch<GameStateResponse>("/api/game/state", {
        method: "PUT",
        body: JSON.stringify(body),
      }),

    complete: (body: CompleteBody) =>
      authFetch<GameStateResponse>("/api/game/complete", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    history: (page = 1, perPage = 10, status = "all") =>
      authFetch<HistoryResponse>(
        `/api/game/history?page=${page}&perPage=${perPage}&status=${status}`,
      ),
  },

  user: {
    stats: () => authFetch<UserStatsResponse>("/api/user/stats"),
  },
};
