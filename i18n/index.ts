import { createContext, useContext, useState, useEffect, useCallback } from "react";
import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import pl from "./pl";
import en from "./en";
import { Translations } from "./types";

export type { Translations };

export type Locale = "pl" | "en";

const translations: Record<Locale, Translations> = { pl, en };

interface I18nContextValue {
  locale: Locale;
  t: Translations;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "pl",
  t: pl,
  setLocale: () => {},
});

const STORAGE_KEY = "showle-locale";

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pl");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && translations[saved as Locale]) {
        setLocaleState(saved as Locale);
      }
    });
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    AsyncStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const value: I18nContextValue = {
    locale,
    t: translations[locale],
    setLocale,
  };

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useTranslation() {
  return useContext(I18nContext);
}
