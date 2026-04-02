import Constants from "expo-constants";
import {
  GameStateResponse,
  SaveStateBody,
  CompleteBody,
  HistoryResponse,
  UserStatsResponse,
  SavedMovie,
  SaveMovieBody,
  CollectionResponse,
  CollectionSort,
  CollectionCategory,
  RankedList,
  RankedListItem,
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

  collection: {
    list: (category: CollectionCategory, sort: CollectionSort = "date", page = 1, perPage = 20) =>
      authFetch<CollectionResponse>(
        `/api/collection?category=${category}&sort=${sort}&page=${page}&perPage=${perPage}`,
      ),

    save: (body: SaveMovieBody) =>
      authFetch<SavedMovie>("/api/collection", {
        method: "POST",
        body: JSON.stringify(body),
      }),

    update: (id: string, data: { category?: CollectionCategory; rating?: number; review?: string }) =>
      authFetch<SavedMovie>(`/api/collection/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      authFetch<void>(`/api/collection/${id}`, { method: "DELETE" }),
  },

  rankings: {
    list: () => authFetch<RankedList[]>("/api/collection/rankings"),

    create: (name: string, description?: string) =>
      authFetch<RankedList>("/api/collection/rankings", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      }),

    get: (id: string) =>
      authFetch<RankedList>(`/api/collection/rankings/${id}`),

    update: (id: string, data: { name?: string; description?: string }) =>
      authFetch<RankedList>(`/api/collection/rankings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),

    remove: (id: string) =>
      authFetch<void>(`/api/collection/rankings/${id}`, { method: "DELETE" }),

    addItems: (id: string, items: Omit<RankedListItem, "id" | "listId" | "position">[]) =>
      authFetch<{ added: number; skipped: number; items: RankedListItem[] }>(
        `/api/collection/rankings/${id}/items`,
        { method: "POST", body: JSON.stringify({ items }) },
      ),

    reorder: (id: string, items: { id: string; position: number }[]) =>
      authFetch<void>(`/api/collection/rankings/${id}/items`, {
        method: "PUT",
        body: JSON.stringify({ items }),
      }),

    removeItem: (id: string, itemId: string) =>
      authFetch<void>(`/api/collection/rankings/${id}/items/${itemId}`, {
        method: "DELETE",
      }),
  },
};
