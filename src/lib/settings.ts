// Visitor settings: what they are, their defaults, and where they're stored.
// Shared by server and browser code — keep it free of server imports.

export type ThemeId = "deep-violet" | "midnight-gold" | "terminal-teal";
export type RangeId = "1Y" | "5Y" | "10Y" | "Max";
export type ModeId = "dark" | "light";

export type Settings = {
  version: 1;
  mode: ModeId;
  theme: ThemeId;
  defaultRange: RangeId;
  timeZone: string; // IANA name, e.g. "America/New_York"
};

export const DEFAULT_SETTINGS: Settings = {
  version: 1,
  mode: "dark",
  theme: "deep-violet",
  defaultRange: "10Y",
  timeZone: "America/New_York",
};

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: "deep-violet", label: "Deep Violet", swatch: "#8b7cf6" },
  { id: "midnight-gold", label: "Midnight Gold", swatch: "#e3b34c" },
  { id: "terminal-teal", label: "Terminal Teal", swatch: "#2dd4bf" },
];

export const MODES: { id: ModeId; label: string }[] = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
];

export const RANGE_IDS: RangeId[] = ["1Y", "5Y", "10Y", "Max"];

export const TIME_ZONES: { id: string; label: string }[] = [
  { id: "America/New_York", label: "Eastern Time (New York)" },
  { id: "America/Chicago", label: "Central Time (Chicago)" },
  { id: "America/Denver", label: "Mountain Time (Denver)" },
  { id: "America/Los_Angeles", label: "Pacific Time (Los Angeles)" },
  { id: "UTC", label: "UTC" },
  { id: "Europe/London", label: "London" },
  { id: "Europe/Berlin", label: "Central Europe (Frankfurt, Paris)" },
  { id: "Asia/Dubai", label: "Dubai" },
  { id: "Asia/Kolkata", label: "India" },
  { id: "Asia/Singapore", label: "Singapore / Hong Kong" },
  { id: "Asia/Tokyo", label: "Tokyo" },
  { id: "Australia/Sydney", label: "Sydney" },
];

// Keep only valid values, so a stale or hand-edited save can't break the site.
export function sanitizeSettings(raw: unknown): Settings {
  const s = (raw && typeof raw === "object" ? raw : {}) as Partial<Settings>;
  return {
    version: 1,
    mode: s.mode === "light" ? "light" : "dark",
    theme: THEMES.some((t) => t.id === s.theme) ? s.theme! : DEFAULT_SETTINGS.theme,
    defaultRange: RANGE_IDS.includes(s.defaultRange as RangeId)
      ? s.defaultRange!
      : DEFAULT_SETTINGS.defaultRange,
    timeZone: TIME_ZONES.some((z) => z.id === s.timeZone) ? s.timeZone! : DEFAULT_SETTINGS.timeZone,
  };
}

// Where settings live. Today: this browser (localStorage). When accounts are
// added, write an AccountSettingsStore with the same two methods (e.g. calling
// an /api/settings route) and pick it in SettingsProvider when signed in —
// nothing else in the site needs to change.
export interface SettingsStore {
  load(): Promise<Settings>;
  save(settings: Settings): Promise<void>;
}

export const STORAGE_KEY = "theta-decay:settings";

export const browserSettingsStore: SettingsStore = {
  async load() {
    try {
      return sanitizeSettings(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"));
    } catch {
      return DEFAULT_SETTINGS;
    }
  },
  async save(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Private mode or storage blocked: settings just won't persist.
    }
  },
};

// Runs in <head> before the page paints, so a saved theme or light mode never
// flashes. Dark mode and Deep Violet are the defaults (no attributes needed).
export const THEME_BOOT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)})||"null");if(!s)return;var r=document.documentElement;var t=s.theme;if(t&&t!=="deep-violet"&&${JSON.stringify(
  THEMES.map((t) => t.id),
)}.indexOf(t)>-1)r.setAttribute("data-theme",t);if(s.mode==="light")r.setAttribute("data-mode","light")}catch(e){}})()`;
