import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, ChevronLeft, ChevronRight, Lock, Moon, Sun } from "lucide-react";
import type { Level } from "@/game/levels";

interface GameHeaderProps {
  level: Level;
  totalLevels: number;
  phase: "demo" | "challenge";
  onResetLevel: () => void;
  onPrevLevel: () => void;
  onNextLevel: () => void;
  onPhaseChange: (phase: "demo" | "challenge") => void;
  moveCount: number;
  isNextLocked: boolean;
  completedLevels: Set<number>;
  isDark: boolean;
  onToggleDark: () => void;
}

export default function GameHeader({
  level,
  totalLevels,
  phase,
  onResetLevel,
  onPrevLevel,
  onNextLevel,
  onPhaseChange,
  moveCount,
  isNextLocked,
  completedLevels,
  isDark,
  onToggleDark,
}: GameHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-card px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl flex items-center gap-2">
          <img src="./assets/icon.png" alt="Logo" className="h-6 w-6 md:h-8 md:w-8" />
          <span>Logic Labyrinth</span>
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onPrevLevel} disabled={level.id <= 1}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Badge variant="secondary" className="px-3 py-1 text-sm font-semibold">
          Level {level.id} / {totalLevels}
        </Badge>
        <Button
          variant={phase === "demo" ? "default" : "outline"}
          size="sm"
          onClick={() => onPhaseChange("demo")}
          className="text-xs"
        >
          📖 Contoh
        </Button>
        <Button
          variant={phase === "challenge" ? "default" : "outline"}
          size="sm"
          onClick={() => onPhaseChange("challenge")}
          className="text-xs"
        >
          🎯 Tantangan
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextLevel}
          disabled={level.id >= totalLevels}
          className="relative"
        >
          {isNextLocked && level.id < totalLevels ? (
            <Lock className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-sm">
          Langkah: {moveCount}
        </Badge>
        <Button variant="outline" size="sm" onClick={onResetLevel} className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Level
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleDark}>
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </header>
  );
}
