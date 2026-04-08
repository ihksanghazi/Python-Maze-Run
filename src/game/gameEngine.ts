import type { Level } from "./levels";

export type Direction = "up" | "down" | "left" | "right";

export interface MoveResult {
  valid: boolean;
  position: [number, number];
  error?: string;
  won?: boolean;
}

export function validateMove(
  position: [number, number],
  direction: Direction,
  level: Level
): MoveResult {
  const [row, col] = position;
  let newRow = row;
  let newCol = col;

  switch (direction) {
    case "up":    newRow = row - 1; break;
    case "down":  newRow = row + 1; break;
    case "left":  newCol = col - 1; break;
    case "right": newCol = col + 1; break;
  }

  // Out of bounds
  if (newRow < 0 || newRow >= level.gridSize || newCol < 0 || newCol >= level.gridSize) {
    return { valid: false, position, error: `Tidak bisa bergerak ${direction} — keluar dari labirin!` };
  }

  // Wall collision
  const hitWall = level.walls.some(([wr, wc]) => wr === newRow && wc === newCol);
  if (hitWall) {
    return { valid: false, position, error: `Menabrak tembok di posisi (${newRow}, ${newCol})!` };
  }

  const newPos: [number, number] = [newRow, newCol];
  const won = newPos[0] === level.goal[0] && newPos[1] === level.goal[1];

  return { valid: true, position: newPos, won };
}
