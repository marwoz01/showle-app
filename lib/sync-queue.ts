import AsyncStorage from "@react-native-async-storage/async-storage";
import { CompleteBody } from "./api-types";

const QUEUE_KEY = "showle-sync-queue";

export async function enqueueCompletion(body: CompleteBody): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: CompleteBody[] = raw ? JSON.parse(raw) : [];
    queue.push(body);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Silently fail
  }
}

export async function flushQueue(
  apiFn: (body: CompleteBody) => Promise<unknown>,
): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (!raw) return;

    const queue: CompleteBody[] = JSON.parse(raw);
    if (queue.length === 0) return;

    const remaining: CompleteBody[] = [];

    for (const body of queue) {
      try {
        await apiFn(body);
      } catch {
        remaining.push(body);
      }
    }

    if (remaining.length > 0) {
      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
    } else {
      await AsyncStorage.removeItem(QUEUE_KEY);
    }
  } catch {
    // Silently fail
  }
}
