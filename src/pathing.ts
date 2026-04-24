// Weighted-random pathing. Each tick, among safe directions: 60% of the
// time keep going straight (longer runs read as intentional motion);
// otherwise 70% pick the step closest to the food, 30% pick uniformly
// at random. Simulates a casual player — drifts, occasionally traps
// itself, and resets.

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

const STRAIGHT_PROBABILITY = 0.6;
const FOOD_BIAS_PROBABILITY = 0.7;

function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function inBounds(c: Cell, cols: number, rows: number): boolean {
  return c.x >= 0 && c.x < cols && c.y >= 0 && c.y < rows;
}

function isOccupied(c: Cell, snake: Cell[]): boolean {
  // Tail moves out next tick, so allow it.
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

  const safe: { d: Direction; distance: number }[] = [];
  for (const d of ALL_DIRS) {
    if (d === OPPOSITE[current]) continue;
    const v = DIRS[d];
    const next: Cell = { x: head.x + v.x, y: head.y + v.y };
    if (!inBounds(next, cols, rows)) continue;
    if (isOccupied(next, snake)) continue;
    safe.push({ d, distance: manhattan(next, food) });
  }

  // No safe moves — keep current. The game loop will detect the collision.
  if (safe.length === 0) return current;

  const straight = safe.find((s) => s.d === current);
  if (straight && Math.random() < STRAIGHT_PROBABILITY) return straight.d;

  if (Math.random() < FOOD_BIAS_PROBABILITY) {
    let best = safe[0];
    for (let i = 1; i < safe.length; i++) {
      if (safe[i].distance < best.distance) best = safe[i];
    }
    return best.d;
  }

  return safe[Math.floor(Math.random() * safe.length)].d;
}

export function step(cell: Cell, d: Direction): Cell {
  const v = DIRS[d];
  return { x: cell.x + v.x, y: cell.y + v.y };
}
