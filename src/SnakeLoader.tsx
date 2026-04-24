import { useMemo, type CSSProperties } from "react";
import { GRID_SIZE, useSnakeGame } from "./useSnakeGame";
import {
  resolveTheme,
  type Colors,
  type Effects,
  type Theme,
} from "./themes";

export interface SnakeLoaderProps {
  theme?: Theme;
  cellSize?: number;
  speed?: number;
  colors?: Colors;
  effects?: Effects;
  paused?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
}

export function SnakeLoader(props: SnakeLoaderProps) {
  const {
    theme = "nokia",
    cellSize = 3,
    speed = 10,
    colors,
    effects,
    paused = false,
    className,
    style,
    "aria-label": ariaLabel = "Loading",
  } = props;

  const resolved = useMemo(
    () => resolveTheme(theme, colors, effects),
    [theme, colors, effects],
  );

  const game = useSnakeGame({ speed, paused });

  const cssVars = {
    "--snake-loader-cell-size": `${cellSize}px`,
    "--snake-loader-snake": resolved.colors.snake,
    "--snake-loader-food": resolved.colors.food,
    "--snake-loader-grid": resolved.colors.grid,
    "--snake-loader-background": resolved.colors.background,
    "--snake-loader-glow": resolved.colors.glow,
  } as CSSProperties;

  const classes = [
    "snake-loader",
    `snake-loader--${theme}`,
    resolved.effects.pulse ? "snake-loader--pulse" : "",
    resolved.effects.glow ? "snake-loader--glow" : "",
    game.status === "dying" ? "snake-loader--dying" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={classes}
      role="progressbar"
      aria-busy="true"
      aria-label={ariaLabel}
      style={{ ...cssVars, ...style }}
    >
      <div
        className="snake-loader__grid"
        style={{
          width: GRID_SIZE * cellSize,
          height: GRID_SIZE * cellSize,
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${cellSize}px)`,
        }}
      >
        <div
          className="snake-loader__food"
          style={{ gridColumn: game.food.x + 1, gridRow: game.food.y + 1 }}
        />
        {game.snake.map((cell, i) => (
          <div
            key={`${cell.x},${cell.y},${i}`}
            className="snake-loader__cell"
            style={{ gridColumn: cell.x + 1, gridRow: cell.y + 1 }}
          />
        ))}
      </div>
    </div>
  );
}
