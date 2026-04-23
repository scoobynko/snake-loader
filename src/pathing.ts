// Greedy pathing for the snake: prefer a direction that moves closer to
// the food, but never into the snake's own body. If no safe step moves
// toward the food, pick any safe direction. If no safe step exists at
// all, keep going straight (the game will end / reset).

export type Cell = { x: number; y: number };
export type Direction = "up" | "down" | "left" | "right";

const DIRS: Record<Direction, Cell> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

const ALL_DIRS: Direction[] = ["up", "right", "down", "left"];

function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function inBounds(c: Cell, cols: number, rows: number): boolean {
  return c.x >= 0 && c.x < cols && c.y >= 0 && c.y < rows;
}

function isOccupied(c: Cell, snake: Cell[]): boolean {
  // The tail will move out of the way on the next tick, so allow it.
  for (let i = 0; i < snake.length - 1; i++) {
    if (snake[i].x === c.x && snake[i].y === c.y) return true;
  }
  return false;
}

export function nextDirection(
  snake: Cell[],
  food: Cell,
  current: Direction,
  cols: number,
  rows: number,
): Direction {
  const head = snake[0];

  const candidates = ALL_DIRS.filter((d) => d !== OPPOSITE[current]);

  const scored = candidates
    .map((d) => {
      const step = DIRS[d];
      const next: Cell = { x: head.x + step.x, y: head.y + step.y };
      const safe = inBounds(next, cols, rows) && !isOccupied(next, snake);
      const distance = manhattan(next, food);
      return { d, safe, distance };
    })
    .sort((a, b) => {
      // Safe first, then by distance to food ascending.
      if (a.safe !== b.safe) return a.safe ? -1 : 1;
      return a.distance - b.distance;
    });

  if (scored[0]?.safe) return scored[0].d;
  // No safe moves — keep current direction, the game loop will handle reset.
  return current;
}

export function step(cell: Cell, d: Direction): Cell {
  const v = DIRS[d];
  return { x: cell.x + v.x, y: cell.y + v.y };
}
