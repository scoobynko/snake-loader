import { useEffect, useReducer, useRef } from "react";
import { nextDirection, step, type Cell, type Direction } from "./pathing";

export const GRID_SIZE = 8;
const INITIAL_LENGTH = 2;
const DYING_TICKS = 12;

export type Status = "alive" | "dying";

export interface GameState {
  snake: Cell[];
  food: Cell;
  direction: Direction;
  status: Status;
  dyingTicks: number;
}

export interface GameOptions {
  speed: number;
  paused: boolean;
}

type Action = { type: "tick" };

function randomEmptyCell(snake: Cell[]): Cell {
  const occupied = new Set(snake.map((c) => `${c.x},${c.y}`));
  const empty: Cell[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (!occupied.has(`${x},${y}`)) empty.push({ x, y });
    }
  }
  if (empty.length === 0) return { x: 0, y: 0 };
  return empty[Math.floor(Math.random() * empty.length)];
}

function initialState(): GameState {
  const startY = Math.floor(GRID_SIZE / 2);
  const startX = Math.max(1, Math.floor(GRID_SIZE / 4));
  const snake: Cell[] = [];
  for (let i = 0; i < INITIAL_LENGTH; i++) {
    snake.unshift({ x: startX + i, y: startY });
  }
  const food = randomEmptyCell(snake);
  return { snake, food, direction: "right", status: "alive", dyingTicks: 0 };
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "tick": {
      if (state.status === "dying") {
        const next = state.dyingTicks + 1;
        return next >= DYING_TICKS
          ? initialState()
          : { ...state, dyingTicks: next };
      }

      const { snake, food, direction } = state;
      const nextDir = nextDirection(snake, food, direction, GRID_SIZE, GRID_SIZE);
      const newHead = step(snake[0], nextDir);

      const outOfBounds =
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE;
      const hitSelf = snake
        .slice(0, -1)
        .some((c) => c.x === newHead.x && c.y === newHead.y);

      if (outOfBounds || hitSelf) {
        return { ...state, status: "dying", dyingTicks: 0 };
      }

      const ate = newHead.x === food.x && newHead.y === food.y;
      const newSnake = ate
        ? [newHead, ...snake]
        : [newHead, ...snake.slice(0, -1)];
      const newFood = ate ? randomEmptyCell(newSnake) : food;

      return { ...state, snake: newSnake, food: newFood, direction: nextDir };
    }
    default:
      return state;
  }
}

export function useSnakeGame(opts: GameOptions): GameState {
  const { speed, paused } = opts;
  const [state, dispatch] = useReducer(reducer, null, initialState);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

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
