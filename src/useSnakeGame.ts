import { useEffect, useRef, useState } from "react";
import { nextDirection, step, type Cell, type Direction } from "./pathing";

export const GRID_SIZE = 8;
const INITIAL_LENGTH = 2;
const DYING_TICKS = 12;
const MIN_INTERVAL_MS = 40;
const REDUCED_MOTION_FACTOR = 0.5;

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
  return {
    snake,
    food: randomEmptyCell(snake),
    direction: "right",
    status: "alive",
    dyingTicks: 0,
  };
}

function tick(state: GameState): GameState {
  if (state.status === "dying") {
    const next = state.dyingTicks + 1;
    return next >= DYING_TICKS
      ? initialState()
      : { ...state, dyingTicks: next };
  }

  const { snake, food, direction } = state;
  const nextDir = nextDirection(snake, food, direction, GRID_SIZE, GRID_SIZE);
  const head = step(snake[0], nextDir);

  const outOfBounds =
    head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE;
  const hitSelf = snake
    .slice(0, -1)
    .some((c) => c.x === head.x && c.y === head.y);

  if (outOfBounds || hitSelf) {
    return { ...state, status: "dying", dyingTicks: 0 };
  }

  const ate = head.x === food.x && head.y === food.y;
  const newSnake = ate ? [head, ...snake] : [head, ...snake.slice(0, -1)];
  const newFood = ate ? randomEmptyCell(newSnake) : food;

  return { ...state, snake: newSnake, food: newFood, direction: nextDir };
}

function computeInterval(speed: number, reducedMotion: boolean): number {
  const effective = reducedMotion ? speed * REDUCED_MOTION_FACTOR : speed;
  return Math.max(MIN_INTERVAL_MS, 1000 / Math.max(1, effective));
}

export function useSnakeGame({ speed, paused }: GameOptions): GameState {
  const [state, setState] = useState<GameState>(initialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (paused) return;

    const mql =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let interval = computeInterval(speed, mql?.matches ?? false);
    const onMotionChange = () => {
      interval = computeInterval(speed, mql?.matches ?? false);
    };
    mql?.addEventListener("change", onMotionChange);

    let rafId = 0;
    let lastTick = 0;

    const loop = (t: number) => {
      if (lastTick === 0) lastTick = t;
      if (t - lastTick >= interval) {
        lastTick = t;
        const next = tick(stateRef.current);
        stateRef.current = next;
        setState(next);
      }
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      mql?.removeEventListener("change", onMotionChange);
    };
  }, [speed, paused]);

  return state;
}
