import { useEffect } from "react";
import { AppState } from "react-native";
import { flushQueue } from "@/lib/sync-queue";
import { api } from "@/lib/api";

export function useSyncOnForeground() {
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        flushQueue(api.game.complete).catch(() => {});
      }
    });
    return () => sub.remove();
  }, []);
}
