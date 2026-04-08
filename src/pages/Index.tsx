import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import CodeEditor from "@/components/CodeEditor";
import Maze from "@/components/Maze";
import GameHeader from "@/components/GameHeader";
import FeedbackPanel from "@/components/FeedbackPanel";
import { levels } from "@/game/levels";
import { validateMove, type Direction } from "@/game/gameEngine";
import { loadPyodideInstance, runPythonCode } from "@/python/pyodideRunner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDarkMode } from "@/hooks/use-dark-mode";

export default function Index() {
  const [isDark, toggleDark] = useDarkMode();
  const [levelIndex, setLevelIndex] = useState(0);
  const [phase, setPhase] = useState<"demo" | "challenge">("demo");
  const [playerPos, setPlayerPos] = useState<[number, number]>([...levels[0].start]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodideReady, setPyodideReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [moveCount, setMoveCount] = useState(0);
  const [editorKey, setEditorKey] = useState(0);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(() => {
    const saved = localStorage.getItem("completedLevels");
    return saved ? new Set(JSON.parse(saved)) : new Set<number>();
  });

  const isMobile = useIsMobile();
  const [editorHeight, setEditorHeight] = useState(300);
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  const level = levels[levelIndex];

  // Get the active maze config based on phase
  const activeMaze = useMemo(() => phase === "demo"
    ? { gridSize: level.gridSize, start: level.start, goal: level.goal, walls: level.walls, description: level.description }
    : { gridSize: level.challenge.gridSize, start: level.challenge.start, goal: level.challenge.goal, walls: level.challenge.walls, description: level.challenge.description },
    [phase, level]
  );

  // Build a level-like object for Maze/gameEngine
  const activeLevelConfig = useMemo(() => ({
    ...level,
    gridSize: activeMaze.gridSize,
    start: activeMaze.start,
    goal: activeMaze.goal,
    walls: activeMaze.walls,
  }), [level, activeMaze]);

  useEffect(() => {
    loadPyodideInstance()
      .then(() => {
        setPyodideReady(true);
        toast.success("Python siap digunakan!");
      })
      .catch(() => toast.error("Gagal memuat Python engine"));
  }, []);

  useEffect(() => {
    localStorage.setItem("completedLevels", JSON.stringify([...completedLevels]));
  }, [completedLevels]);

  const resetLevel = useCallback(() => {
    setPlayerPos([...activeMaze.start]);
    setError(null);
    setSuccess(false);
    setMoveCount(0);
  }, [activeMaze.start]);

  const isLevelUnlocked = useCallback(
    (idx: number) => {
      if (idx === 0) return true;
      return completedLevels.has(levels[idx - 1].id);
    },
    [completedLevels]
  );

  const changeLevel = useCallback(
    (idx: number) => {
      if (idx < 0 || idx >= levels.length) return;
      if (!isLevelUnlocked(idx)) {
        toast.error("Selesaikan level sebelumnya terlebih dahulu! 🔒");
        return;
      }
      setLevelIndex(idx);
      setPhase("demo");
      setPlayerPos([...levels[idx].start]);
      setError(null);
      setSuccess(false);
      setMoveCount(0);
      setEditorKey((k) => k + 1);
    },
    [isLevelUnlocked]
  );

  const animateMoves = useCallback(
    async (moves: Direction[]) => {
      let pos: [number, number] = [...activeMaze.start];
      setPlayerPos([...pos]);
      setMoveCount(0);

      for (let i = 0; i < moves.length; i++) {
        await new Promise((r) => setTimeout(r, 350));
        const result = validateMove(pos, moves[i], activeLevelConfig);

        if (!result.valid) {
          setError(result.error || "Gerakan tidak valid!");
          toast.error("Salah jalan!");
          return;
        }

        pos = result.position;
        setPlayerPos([...pos]);
        setMoveCount(i + 1);

        if (result.won) {
          setSuccess(true);

          if (phase === "demo") {
            // Demo done → go to challenge after delay
            toast.success("✅ Bagus! Sekarang coba sendiri!");
            setTimeout(() => {
              setPhase("challenge");
              setPlayerPos([...level.challenge.start]);
              setError(null);
              setSuccess(false);
              setMoveCount(0);
              setEditorKey((k) => k + 1);
            }, 1500);
          } else {
            // Challenge done → mark complete and advance to next level
            setCompletedLevels((prev) => {
              const next = new Set([...prev, level.id]);
              localStorage.setItem("completedLevels", JSON.stringify([...next]));
              return next;
            });
            toast.success("🎉 Level selesai!");
            setTimeout(() => {
              setLevelIndex((prev) => {
                const next = prev + 1;
                if (next >= levels.length) return prev;
                setPhase("demo");
                setPlayerPos([...levels[next].start]);
                setError(null);
                setSuccess(false);
                setMoveCount(0);
                setEditorKey((k) => k + 1);
                return next;
              });
            }, 1500);
          }
          return;
        }
      }

      if (pos[0] !== activeMaze.goal[0] || pos[1] !== activeMaze.goal[1]) {
        setError("Belum sampai tujuan! Tambahkan langkah lagi.");
      }
    },
    [activeMaze, activeLevelConfig, phase, level]
  );

  const handleRun = useCallback(
    async (code: string) => {
      setIsRunning(true);
      setError(null);
      setSuccess(false);
      setPlayerPos([...activeMaze.start]);
      setMoveCount(0);

      try {
        const moves = await runPythonCode(code, activeLevelConfig);
        if (moves.length === 0) {
          setError("Kode tidak menghasilkan gerakan. Gunakan move_right(), move_down(), dll.");
          setIsRunning(false);
          return;
        }
        await animateMoves(moves);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Terjadi kesalahan saat menjalankan kode Python.";
        setError(msg);
        toast.error("Error Python!");
      }
      setIsRunning(false);
    },
    [activeMaze, activeLevelConfig, animateMoves]
  );

  const handleResetCode = useCallback(() => {
    resetLevel();
    setEditorKey((k) => k + 1);
  }, [resetLevel]);

  const handlePhaseChange = useCallback(
    (newPhase: "demo" | "challenge") => {
      setPhase(newPhase);
      const start = newPhase === "demo" ? level.start : level.challenge.start;
      setPlayerPos([...start]);
      setError(null);
      setSuccess(false);
      setMoveCount(0);
      setEditorKey((k) => k + 1);
    },
    [level]
  );

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true;
      dragStartY.current = e.clientY;
      dragStartHeight.current = editorHeight;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [editorHeight]
  );

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientY - dragStartY.current;
    const newHeight = Math.max(150, Math.min(dragStartHeight.current + delta, window.innerHeight - 200));
    setEditorHeight(newHeight);
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Editor code: hint for demo, empty for challenge
  const editorCode = phase === "demo" ? level.hint : "# Tulis kode Python kamu di sini!\n";

  return (
    <div className="flex h-screen flex-col">
      <GameHeader
        level={level}
        totalLevels={levels.length}
        phase={phase}
        onResetLevel={() => {
          resetLevel();
          setEditorKey((k) => k + 1);
        }}
        onPrevLevel={() => changeLevel(levelIndex - 1)}
        onNextLevel={() => changeLevel(levelIndex + 1)}
        onPhaseChange={handlePhaseChange}
        moveCount={moveCount}
        isNextLocked={!isLevelUnlocked(levelIndex + 1)}
        completedLevels={completedLevels}
        isDark={isDark}
        onToggleDark={toggleDark}
      />

      {isMobile ? (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-auto">
            <div className="p-3">
              <h2 className="text-lg font-bold">{level.name}</h2>
            </div>
            <FeedbackPanel error={error} success={success} levelDescription={activeMaze.description} />
            <div className="flex items-center justify-center pb-2">
              <Maze level={activeLevelConfig} playerPos={playerPos} />
            </div>
          </div>

          <div
            className="flex h-5 cursor-row-resize items-center justify-center border-y bg-muted/50 touch-none select-none"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          </div>

          <div className="min-h-0 p-3" style={{ height: editorHeight }}>
            <CodeEditor
              key={editorKey}
              initialCode={editorCode}
              onRun={handleRun}
              onReset={handleResetCode}
              isRunning={isRunning}
              pyodideReady={pyodideReady}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-row overflow-hidden">
          <div className="flex flex-col lg:w-1/2 min-h-0 overflow-auto border-r">
            <div className="p-4">
              <h2 className="text-lg font-bold">{level.name}</h2>
            </div>
            <FeedbackPanel error={error} success={success} levelDescription={activeMaze.description} />
            <div className="flex-1 flex items-center justify-center">
              <Maze level={activeLevelConfig} playerPos={playerPos} />
            </div>
          </div>

          <div className="flex flex-col lg:w-1/2 min-h-0 p-3">
            <div className="flex-1 min-h-0">
              <CodeEditor
                key={editorKey}
                initialCode={editorCode}
                onRun={handleRun}
                onReset={handleResetCode}
                isRunning={isRunning}
                pyodideReady={pyodideReady}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
