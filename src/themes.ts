export type Theme = "nokia" | "neon" | "minimal" | "custom";

export interface Colors {
  snake?: string;
  snakeHead?: string;
  food?: string;
  grid?: string;
  background?: string;
  glow?: string;
  trailColor?: string;
}

export interface Effects {
  glow?: number;
  trail?: number;
  scanlines?: boolean;
  pixelated?: boolean;
  pulse?: boolean;
  cornerRadius?: number;
}

export interface FrameProps {
  show?: boolean;
  color?: string;
  borderRadius?: number;
  padding?: number;
}

interface ResolvedPreset {
  colors: Required<Colors>;
  effects: Required<Effects>;
}

const PRESETS: Record<Exclude<Theme, "custom">, ResolvedPreset> = {
  nokia: {
    colors: {
      snake: "#2b3a1f",
      snakeHead: "#1a2411",
      food: "#2b3a1f",
      grid: "rgba(43, 58, 31, 0.08)",
      background: "#9ead86",
      glow: "transparent",
      trailColor: "transparent",
    },
    effects: {
      glow: 0,
      trail: 0,
      scanlines: false,
      pixelated: true,
      pulse: false,
      cornerRadius: 0,
    },
  },
  neon: {
    colors: {
      snake: "#00ff88",
      snakeHead: "#aaffcc",
      food: "#ff3366",
      grid: "rgba(0, 255, 136, 0.06)",
      background: "#050505",
      glow: "#00ff88",
      trailColor: "#00ff88",
    },
    effects: {
      glow: 14,
      trail: 220,
      scanlines: true,
      pixelated: false,
      pulse: true,
      cornerRadius: 2,
    },
  },
  minimal: {
    colors: {
      snake: "currentColor",
      snakeHead: "currentColor",
      food: "currentColor",
      grid: "transparent",
      background: "transparent",
      glow: "transparent",
      trailColor: "currentColor",
    },
    effects: {
      glow: 0,
      trail: 0,
      scanlines: false,
      pixelated: false,
      pulse: false,
      cornerRadius: 2,
    },
  },
};

const CUSTOM_DEFAULTS: ResolvedPreset = {
  colors: {
    snake: "#e5e5e5",
    snakeHead: "#ffffff",
    food: "#ff3366",
    grid: "rgba(255,255,255,0.06)",
    background: "#0a0a0a",
    glow: "transparent",
    trailColor: "transparent",
  },
  effects: {
    glow: 0,
    trail: 0,
    scanlines: false,
    pixelated: false,
    pulse: false,
    cornerRadius: 2,
  },
};

export function resolveTheme(
  theme: Theme,
  userColors: Colors | undefined,
  userEffects: Effects | undefined,
): ResolvedPreset {
  const base =
    theme === "custom" ? CUSTOM_DEFAULTS : PRESETS[theme] ?? PRESETS.nokia;
  return {
    colors: { ...base.colors, ...(userColors ?? {}) },
    effects: { ...base.effects, ...(userEffects ?? {}) },
  };
}
