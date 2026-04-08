import type { Direction } from "@/game/gameEngine";
import { validateMove } from "@/game/gameEngine";
import type { Level } from "@/game/levels";

interface PyodideInstance {
  globals: {
    set: (name: string, value: unknown) => void;
  };
  runPythonAsync: (code: string) => Promise<unknown>;
}

declare global {
  interface Window {
    loadPyodide: (config?: { indexURL?: string }) => Promise<PyodideInstance>;
  }
}

let pyodide: PyodideInstance | null = null;
let sandboxInitialized = false;

export async function loadPyodideInstance(): Promise<void> {
  if (pyodide) return;
  pyodide = await window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.24.1/full/",
  });
}

export function isPyodideReady(): boolean {
  return pyodide !== null;
}

export async function runPythonCode(code: string, level?: Level): Promise<Direction[]> {
  if (!pyodide) throw new Error("Pyodide belum siap!");

  const moves: Direction[] = [];
  let currentPos: [number, number] = level ? [...level.start] : [0, 0];

  const doMove = (dir: Direction) => {
    moves.push(dir);
    // Update position tracking for sensor functions
    if (level) {
      const result = validateMove(currentPos, dir, level);
      if (result.valid) {
        currentPos = result.position;
      }
    }
  };

  // Movement functions
  pyodide.globals.set("move_up", () => doMove("up"));
  pyodide.globals.set("move_down", () => doMove("down"));
  pyodide.globals.set("move_left", () => doMove("left"));
  pyodide.globals.set("move_right", () => doMove("right"));

  // Sensor functions (only available if level is provided)
  if (level) {
    pyodide.globals.set("can_move_up", () => validateMove(currentPos, "up", level).valid);
    pyodide.globals.set("can_move_down", () => validateMove(currentPos, "down", level).valid);
    pyodide.globals.set("can_move_left", () => validateMove(currentPos, "left", level).valid);
    pyodide.globals.set("can_move_right", () => validateMove(currentPos, "right", level).valid);
    pyodide.globals.set("get_row", () => currentPos[0]);
    pyodide.globals.set("get_col", () => currentPos[1]);
  }

  // Install sandbox guard only once
  if (!sandboxInitialized) {
    const blockedImports = ["os", "sys", "subprocess", "shutil", "socket", "http", "urllib"];
    const guardCode = `
import builtins
_original_import = builtins.__import__
def _safe_import(name, *args, **kwargs):
    blocked = ${JSON.stringify(blockedImports)}
    if name in blocked:
        raise ImportError(f"Import '{name}' tidak diizinkan!")
    return _original_import(name, *args, **kwargs)
builtins.__import__ = _safe_import
`;
    await pyodide.runPythonAsync(guardCode);
    sandboxInitialized = true;
  }

  try {
    await pyodide.runPythonAsync(code);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const lines = msg.split("\n").filter((l: string) => l.trim());
    const lastLine = lines[lines.length - 1] || msg;
    throw new Error(lastLine);
  }

  return moves;
}
