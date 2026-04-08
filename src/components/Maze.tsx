import type { Level } from "@/game/levels";
import { cn } from "@/lib/utils";

interface MazeProps {
  level: Level;
  playerPos: [number, number];
}

export default function Maze({ level, playerPos }: MazeProps) {
  const { gridSize, walls, goal } = level;

  const isWall = (r: number, c: number) => walls.some(([wr, wc]) => wr === r && wc === c);
  const isGoal = (r: number, c: number) => goal[0] === r && goal[1] === c;
  const isPlayer = (r: number, c: number) => playerPos[0] === r && playerPos[1] === c;

  const cellSize = gridSize <= 5 ? "w-14 h-14 md:w-16 md:h-16" : "w-10 h-10 md:w-12 md:h-12";

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className="grid gap-1 rounded-xl border-2 border-border bg-card p-3 shadow-lg"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: gridSize * gridSize }, (_, idx) => {
          const row = Math.floor(idx / gridSize);
          const col = idx % gridSize;
          const wall = isWall(row, col);
          const goalCell = isGoal(row, col);
          const player = isPlayer(row, col);

          return (
            <div
              key={idx}
              className={cn(
                cellSize,
                "relative flex items-center justify-center rounded-md text-xl font-bold transition-all duration-300",
                wall && "bg-maze-wall shadow-inner",
                !wall && !goalCell && "bg-maze-path",
                goalCell && !player && "bg-maze-goal/20 animate-pulse-glow rounded-lg",
              )}
            >
              {player && (
                <span className="absolute inset-0 flex items-center justify-center text-2xl drop-shadow-lg transition-all duration-300">
                  🤖
                </span>
              )}
              {goalCell && !player && (
                <span className="text-2xl">🏁</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
