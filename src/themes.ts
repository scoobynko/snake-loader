export type Theme = "nokia" | "neon" | "minimal" | "custom";

export interface Colors {
  snake?: string;
  food?: string;
  grid?: string;
  background?: string;
  glow?: string;
}

export interface Effects {
  glow?: boolean;
  pulse?: boolean;
}

interface ResolvedPreset {
  colors: Required<Colors>;
  effects: Required<Effects>;
}

const PRESETS: Record<Exclude<Theme, "custom">, ResolvedPreset> = {
  nokia: {
    colors: {
      snake: "#2b3a1f",
      food: "#2b3a1f",
      grid: "rgba(43, 58, 31, 0.25)",
      background: "#9ead86",
      glow: "transparent",
    },
    effects: {
      glow: false,
      pulse: false,
    },
  },
  neon: {
    colors: {
      snake: "#00ff88",
      food: "#ff3366",
      grid: "rgba(0, 255, 136, 0.15)",
      background: "#050505",
      glow: "#00ff88",
    },
    effects: {
      glow: true,
      pulse: true,
    },
  },
  minimal: {
    colors: {
      snake: "currentColor",
      food: "currentColor",
      grid: "transparent",
      background: "transparent",
      glow: "transparent",
    },
    effects: {
      glow: false,
      pulse: false,
    },
  },
};

const CUSTOM_DEFAULTS: ResolvedPreset = {
  colors: {
    snake: "#e5e5e5",
    food: "#ff3366",
    grid: "rgba(255,255,255,0.15)",
    background: "#0a0a0a",
    glow: "#e5e5e5",
  },
  effects: {
    glow: false,
    pulse: false,
  },
};

export function resolveTheme(
  theme: Theme,
  userColors: Colors | undefined,
  userEffects: Effects | undefined,
): ResolvedPreset {
  const base = theme === "custom" ? CUSTOM_DEFAULTS : PRESETS[theme];
  return {
    colors: { ...base.colors, ...(userColors ?? {}) },
    effects: { ...base.effects, ...(userEffects ?? {}) },
  };
}
