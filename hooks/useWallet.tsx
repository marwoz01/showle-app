import { createContext, useContext, useState, useEffect, useCallback } from "react";
import React from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/lib/api";
import { useTranslation } from "@/i18n";
import { SpendCoinsBody, SpendCoinsResponse } from "@/lib/api-types";

interface WalletContextValue {
  balance: number;
  streakFreezes: number;
  refreshWallet: () => Promise<void>;
  addBalance: (amount: number) => void;
  spendCoins: (action: SpendCoinsBody["action"], dateKey?: string) => Promise<SpendCoinsResponse | null>;
}

const WalletContext = createContext<WalletContextValue>({
  balance: 0,
  streakFreezes: 0,
  refreshWallet: async () => {},
  addBalance: () => {},
  spendCoins: async () => null,
});

const STORAGE_KEY = "showle-wallet";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [balance, setBalance] = useState(0);
  const [streakFreezes, setStreakFreezes] = useState(0);

  const refreshWallet = useCallback(async () => {
    try {
      const data = await api.user.wallet();
      setBalance(data.balance);
      setStreakFreezes(data.streakFreezes);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
    } catch {
      // Try cached
      try {
        const cached = await AsyncStorage.getItem(STORAGE_KEY);
        if (cached) {
          const data = JSON.parse(cached);
          setBalance(data.balance ?? 0);
          setStreakFreezes(data.streakFreezes ?? 0);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    refreshWallet();
  }, [refreshWallet]);

  const spendCoins = useCallback(
    async (action: SpendCoinsBody["action"], dateKey?: string): Promise<SpendCoinsResponse | null> => {
      try {
        const result = await api.user.spendCoins({ action, dateKey });
        setBalance(result.balance);
        setStreakFreezes(result.streakFreezes);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ balance: result.balance, streakFreezes: result.streakFreezes })).catch(() => {});
        return result;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (msg.includes("insufficient_balance")) {
          Alert.alert("", t.coins.notEnough);
        } else {
          Alert.alert("", t.coins.connectionError);
        }
        return null;
      }
    },
    [t],
  );

  const addBalance = useCallback((amount: number) => {
    setBalance((prev) => {
      const next = prev + amount;
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ balance: next, streakFreezes })).catch(() => {});
      return next;
    });
  }, [streakFreezes]);

  const value: WalletContextValue = { balance, streakFreezes, refreshWallet, addBalance, spendCoins };

  return React.createElement(WalletContext.Provider, { value }, children);
}

export function useWallet() {
  return useContext(WalletContext);
}
