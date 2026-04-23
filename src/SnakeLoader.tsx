import { useMemo, type CSSProperties } from "react";
import { useSnakeGame } from "./useSnakeGame";
import {
  resolveTheme,
  type Colors,
  type Effects,
  type FrameProps,
  type Theme,
} from "./themes";

export interface SnakeLoaderProps {
  progress?: number;
  theme?: Theme;
  cols?: number;
  rows?: number;
  cellSize?: number;
  speed?: number;
  initialLength?: number;
  growthPerFood?: number;
  colors?: Colors;
  effects?: Effects;
  showScore?: boolean;
  label?: string;
  frame?: FrameProps;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function SnakeLoader(props: SnakeLoaderProps) {
  const {
    progress,
    theme = "nokia",
    cols = 20,
    rows = 10,
    cellSize = 12,
    speed = 8,
    initialLength = 3,
    growthPerFood = 1,
    colors,
    effects,
    showScore = false,
    label,
    frame,
    paused = false,
    className,
    style,
  } = props;

  const resolved = useMemo(
    () => resolveTheme(theme, colors, effects),
    [theme, colors, effects],
  );

  const game = useSnakeGame({
    cols,
    rows,
    initialLength,
    growthPerFood,
    progress,
    speed,
    paused,
  });

  const cssVars: CSSProperties = {
    // Exposed as CSS variables for external theming.
    ["--snake-loader-cell-size" as string]: `${cellSize}px`,
    ["--snake-loader-cols" as string]: String(cols),
    ["--snake-loader-rows" as string]: String(rows),
    ["--snake-loader-snake" as string]: resolved.colors.snake,
    ["--snake-loader-snake-head" as string]: resolved.colors.snakeHead,
    ["--snake-loader-food" as string]: resolved.colors.food,
    ["--snake-loader-grid" as string]: resolved.colors.grid,
    ["--snake-loader-background" as string]: resolved.colors.background,
    ["--snake-loader-glow" as string]: resolved.colors.glow,
    ["--snake-loader-glow-size" as string]: `${resolved.effects.glow}px`,
    ["--snake-loader-trail-ms" as string]: `${resolved.effects.trail}ms`,
    ["--snake-loader-trail-color" as string]: resolved.colors.trailColor,
    ["--snake-loader-corner" as string]: `${resolved.effects.cornerRadius}px`,
  };

  const indeterminate = typeof progress !== "number";
  const valueNow =
    indeterminate
      ? undefined
      : Math.round(Math.max(0, Math.min(1, progress!)) * 100);

  const classes = [
    "snake-loader",
    `snake-loader--${theme}`,
    resolved.effects.pixelated ? "snake-loader--pixelated" : "",
    resolved.effects.scanlines ? "snake-loader--scanlines" : "",
    resolved.effects.pulse ? "snake-loader--pulse" : "",
    resolved.effects.glow > 0 ? "snake-loader--glow" : "",
    resolved.effects.trail > 0 ? "snake-loader--trail" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const frameStyle: CSSProperties | undefined = frame?.show
    ? {
        background: frame.color ?? "#2a2a2a",
        borderRadius: `${frame.borderRadius ?? 24}px`,
        padding: `${frame.padding ?? 24}px`,
        display: "inline-block",
      }
    : undefined;

  const headKey = game.snake[0] ? `${game.snake[0].x},${game.snake[0].y}` : "";

  const grid = (
    <div
      className={classes}
      role="progressbar"
      aria-busy={indeterminate ? true : undefined}
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={valueNow}
      aria-label={label ?? "Loading"}
      style={{ ...cssVars, ...style }}
    >
      <div
        className="snake-loader__grid"
        style={{
          width: cols * cellSize,
          height: rows * cellSize,
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        }}
      >
        {/* Food */}
        <div
          className="snake-loader__food"
          style={{
            gridColumn: game.food.x + 1,
            gridRow: game.food.y + 1,
          }}
        />
        {/* Snake */}
        {game.snake.map((cell, i) => {
          const isHead = i === 0;
          return (
            <div
              key={`${cell.x},${cell.y},${i}`}
              className={`snake-loader__cell${isHead ? " snake-loader__cell--head" : ""}`}
              style={{
                gridColumn: cell.x + 1,
                gridRow: cell.y + 1,
              }}
              data-head={isHead && headKey ? headKey : undefined}
            />
          );
        })}
      </div>
      {(label || showScore) && (
        <div className="snake-loader__meta">
          {showScore && <span className="snake-loader__score">{game.score}</span>}
          {label && <span className="snake-loader__label">{label}</span>}
        </div>
      )}
    </div>
  );

  return frameStyle ? <div style={frameStyle}>{grid}</div> : grid;
}
