import { useEffect, useReducer, useRef } from "react";
import { nextDirection, step, type Cell, type Direction } from "./pathing";

export interface GameState {
  snake: Cell[];
  food: Cell;
  direction: Direction;
  score: number;
  targetLength: number;
  cols: number;
  rows: number;
}

export interface GameOptions {
  cols: number;
  rows: number;
  initialLength: number;
  growthPerFood: number;
  progress?: number;
  speed: number;
  paused: boolean;
}

type Action =
  | { type: "tick" }
  | { type: "reset"; cols: number; rows: number; initialLength: number }
  | { type: "setTargetLength"; length: number };

function randomEmptyCell(snake: Cell[], cols: number, rows: number): Cell {
  const occupied = new Set(snake.map((c) => `${c.x},${c.y}`));
  const empty: Cell[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return { x: 0, y: 0 };
  return empty[Math.floor(Math.random() * empty.length)];
}

function initialState(
  cols: number,
  rows: number,
  initialLength: number,
): GameState {
  const startY = Math.floor(rows / 2);
  const startX = Math.max(1, Math.floor(cols / 4));
  const len = Math.min(initialLength, Math.max(1, cols - 2));
  const snake: Cell[] = [];
  for (let i = 0; i < len; i++) {
    snake.unshift({ x: startX + i, y: startY });
  }
  // snake[0] is head (rightmost segment)
  const food = randomEmptyCell(snake, cols, rows);
  return {
    snake,
    food,
    direction: "right",
    score: 0,
    targetLength: len,
    cols,
    rows,
  };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "reset":
      return initialState(action.cols, action.rows, action.initialLength);
    case "setTargetLength":
      return { ...state, targetLength: Math.max(1, action.length) };
    case "tick": {
      const { snake, food, direction, cols, rows, targetLength, score } = state;
      const nextDir = nextDirection(snake, food, direction, cols, rows);
      const newHead = step(snake[0], nextDir);

      const outOfBounds =
        newHead.x < 0 || newHead.x >= cols || newHead.y < 0 || newHead.y >= rows;
      const hitSelf = snake
        .slice(0, -1)
        .some((c) => c.x === newHead.x && c.y === newHead.y);

      if (outOfBounds || hitSelf) {
        // Collision — reset.
        return initialState(cols, rows, targetLength);
      }

      const ate = newHead.x === food.x && newHead.y === food.y;
      let newSnake = [newHead, ...snake];

      // Grow toward targetLength (for progress mode) or stay at current
      // length unless we just ate (indeterminate mode grows by growthPerFood).
      const desiredLength = ate ? snake.length + 1 : snake.length;
      const cappedDesired = Math.min(desiredLength, targetLength, cols * rows);

      if (newSnake.length > cappedDesired) {
        newSnake = newSnake.slice(0, cappedDesired);
      }

      const newFood = ate ? randomEmptyCell(newSnake, cols, rows) : food;
      const newScore = ate ? score + 1 : score;

      return {
        ...state,
        snake: newSnake,
        food: newFood,
        direction: nextDir,
        score: newScore,
      };
    }
    default:
      return state;
  }
}

export function useSnakeGame(opts: GameOptions): GameState {
  const { cols, rows, initialLength, growthPerFood, progress, speed, paused } =
    opts;

  const [state, dispatch] = useReducer(
    reducer,
    null,
    () => initialState(cols, rows, initialLength),
  );

  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  // Reset on grid/initialLength change.
  useEffect(() => {
    dispatch({ type: "reset", cols, rows, initialLength });
  }, [cols, rows, initialLength]);

  // Compute target length.
  useEffect(() => {
    const max = cols * rows;
    let target: number;
    if (typeof progress === "number") {
      const clamped = Math.max(0, Math.min(1, progress));
      target = Math.max(
        initialLength,
        Math.floor(initialLength + clamped * (max - initialLength)),
      );
    } else {
      // Indeterminate: let the snake grow freely by growthPerFood, but
      // cap at a reasonable size so it doesn't fill the grid.
      target = Math.min(
        max,
        initialLength + Math.floor(max / 3) * growthPerFood,
      );
    }
    dispatch({ type: "setTargetLength", length: target });
  }, [progress, cols, rows, initialLength, growthPerFood]);

  // rAF loop, throttled to 1000/speed ms per tick.
  useEffect(() => {
    if (paused) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const effectiveSpeed = reduced ? speed * 0.5 : speed;
    const interval = Math.max(40, 1000 / Math.max(1, effectiveSpeed));

    const loop = (t: number) => {
      if (t - lastTickRef.current >= interval) {
        lastTickRef.current = t;
        dispatch({ type: "tick" });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [speed, paused]);

  return state;
}
