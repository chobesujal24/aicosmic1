"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export type ResponseStyle = "concise" | "balanced" | "detailed";
export type FontSize = "small" | "medium" | "large";

export type AppSettings = {
  // Chat settings
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  streamingEnabled: boolean;
  systemPrompt: string;

  // Personalization
  customName: string;
  responseStyle: ResponseStyle;
  fontSize: FontSize;

  // General
  sendWithEnter: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  defaultModel: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 4096,
  streamingEnabled: true,
  systemPrompt: "",
  customName: "",
  responseStyle: "balanced",
  fontSize: "medium",
  sendWithEnter: true,
};

type SettingsContextValue = {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  resetSettings: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

const STORAGE_KEY = "qyvera-ai-settings";

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // ignore parse errors
  }
  return DEFAULT_SETTINGS;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings, mounted]);

  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Use createElement to avoid JSX in .ts file
  const { createElement } = require("react");
  return createElement(
    SettingsContext.Provider,
    { value: { settings, updateSetting, resetSettings } },
    children
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within SettingsProvider");
  }
  return context;
}
