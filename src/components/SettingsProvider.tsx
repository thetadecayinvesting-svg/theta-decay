"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  browserSettingsStore,
  DEFAULT_SETTINGS,
  type Settings,
  type SettingsStore,
} from "@/lib/settings";

type SettingsContextValue = {
  settings: Settings;
  loaded: boolean; // false until the saved settings have been read
  update: (changes: Partial<Omit<Settings, "version">>) => void;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  loaded: false,
  update: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

export default function SettingsProvider({
  children,
  store = browserSettingsStore,
}: {
  children: ReactNode;
  store?: SettingsStore; // swap for an account-backed store once login exists
}) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    store.load().then((saved) => {
      if (!active) return;
      setSettings(saved);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [store]);

  // Apply the theme to <html>; Deep Violet is the default, so it has no attribute.
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    if (settings.theme === "deep-violet") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", settings.theme);
  }, [settings.theme, loaded]);

  // Light mode is opt-in; dark is the default, so it has no attribute.
  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    if (settings.mode === "light") root.setAttribute("data-mode", "light");
    else root.removeAttribute("data-mode");
  }, [settings.mode, loaded]);

  const update = useCallback<SettingsContextValue["update"]>(
    (changes) => {
      setSettings((prev) => {
        const next = { ...prev, ...changes };
        void store.save(next);
        return next;
      });
    },
    [store],
  );

  return (
    <SettingsContext.Provider value={{ settings, loaded, update }}>
      {children}
    </SettingsContext.Provider>
  );
}
