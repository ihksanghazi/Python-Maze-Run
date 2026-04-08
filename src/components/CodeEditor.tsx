import { useEffect, useRef } from "react";
import { EditorView, keymap } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { indentWithTab } from "@codemirror/commands";
import { basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { oneDark } from "@codemirror/theme-one-dark";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { Button } from "@/components/ui/button";
import { Play, RotateCcw } from "lucide-react";

interface CodeEditorProps {
  initialCode: string;
  onRun: (code: string) => void;
  onReset: () => void;
  isRunning: boolean;
  pyodideReady: boolean;
}

const gameCompletions = [
  { label: "move_right()", type: "function", info: "Gerakkan karakter ke kanan" },
  { label: "move_left()", type: "function", info: "Gerakkan karakter ke kiri" },
  { label: "move_up()", type: "function", info: "Gerakkan karakter ke atas" },
  { label: "move_down()", type: "function", info: "Gerakkan karakter ke bawah" },
  { label: "can_move_right()", type: "function", info: "Cek apakah bisa bergerak ke kanan" },
  { label: "can_move_left()", type: "function", info: "Cek apakah bisa bergerak ke kiri" },
  { label: "can_move_up()", type: "function", info: "Cek apakah bisa bergerak ke atas" },
  { label: "can_move_down()", type: "function", info: "Cek apakah bisa bergerak ke bawah" },
  { label: "get_row()", type: "function", info: "Dapatkan posisi baris saat ini" },
  { label: "get_col()", type: "function", info: "Dapatkan posisi kolom saat ini" },
  { label: "for", type: "keyword", apply: "for i in range():\n    ", info: "Loop pengulangan" },
  { label: "range()", type: "function", info: "Rentang angka untuk loop" },
  { label: "if", type: "keyword", apply: "if :\n    ", info: "Percabangan kondisi" },
  { label: "elif", type: "keyword", apply: "elif :\n    ", info: "Kondisi tambahan" },
  { label: "else", type: "keyword", apply: "else:\n    ", info: "Kondisi alternatif" },
  { label: "def", type: "keyword", apply: "def ():\n    ", info: "Definisikan fungsi" },
  { label: "while", type: "keyword", apply: "while :\n    ", info: "Loop selama kondisi benar" },
  { label: "print()", type: "function", info: "Cetak output" },
];

function extractUserSymbols(doc: string) {
  const symbols: typeof gameCompletions = [];
  const seen = new Set<string>();

  // Match variable assignments: x = ..., my_var = ...
  for (const m of doc.matchAll(/^(\w+)\s*=/gm)) {
    const name = m[1];
    if (!seen.has(name) && !name.startsWith("_")) {
      seen.add(name);
      symbols.push({ label: name, type: "variable", info: "Variabel buatan kamu" });
    }
  }

  // Match function definitions: def my_func(...):
  for (const m of doc.matchAll(/^def\s+(\w+)\s*\(/gm)) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      symbols.push({ label: `${name}()`, type: "function", apply: `${name}()`, info: "Fungsi buatan kamu" });
    }
  }

  // Match for-loop variables: for x in ...
  for (const m of doc.matchAll(/^for\s+(\w+)\s+in/gm)) {
    const name = m[1];
    if (!seen.has(name)) {
      seen.add(name);
      symbols.push({ label: name, type: "variable", info: "Variabel loop" });
    }
  }

  return symbols;
}

function gameCompletionSource(context: CompletionContext) {
  const word = context.matchBefore(/\w*/);
  if (!word || (word.from === word.to && !context.explicit)) return null;

  const docText = context.state.doc.toString();
  const userSymbols = extractUserSymbols(docText);

  return {
    from: word.from,
    options: [...gameCompletions, ...userSymbols],
    filter: true,
  };
}

export default function CodeEditor({ initialCode, onRun, onReset, isRunning, pyodideReady }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: initialCode,
      extensions: [
        basicSetup,
        python(),
        oneDark,
        autocompletion({
          override: [gameCompletionSource],
          activateOnTyping: true,
        }),
        EditorView.theme({
          "&": { backgroundColor: "hsl(var(--editor-bg))" },
          ".cm-gutters": { backgroundColor: "hsl(var(--editor-bg))", border: "none" },
          ".cm-tooltip-autocomplete": {
            backgroundColor: "hsl(var(--editor-bg))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            overflow: "hidden",
          },
          ".cm-tooltip-autocomplete ul li": {
            padding: "4px 8px",
          },
          ".cm-tooltip-autocomplete ul li[aria-selected]": {
            backgroundColor: "hsl(var(--primary))",
            color: "hsl(var(--primary-foreground))",
          },
        }),
        keymap.of([
          indentWithTab,
          {
            key: "Ctrl-Enter",
            run: () => {
              const code = viewRef.current?.state.doc.toString() || "";
              onRun(code);
              return true;
            },
          },
        ]),
      ],
    });

    const view = new EditorView({ state, parent: editorRef.current });
    viewRef.current = view;

    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  const handleRun = () => {
    const code = viewRef.current?.state.doc.toString() || "";
    onRun(code);
  };

  return (
    <div className="flex h-full flex-col rounded-lg border bg-editor-bg overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/30 bg-editor-bg px-4 py-2">
        <span className="text-sm font-medium text-muted-foreground">Python Editor</span>
        <span className="text-xs text-muted-foreground/60">Ctrl+Enter untuk menjalankan</span>
      </div>

      <div ref={editorRef} className="flex-1 min-h-0 overflow-auto" />

      <div className="flex gap-2 border-t border-border/30 bg-editor-bg p-3">
        <Button
          onClick={handleRun}
          disabled={isRunning || !pyodideReady}
          className="flex-1 gap-2"
          size="lg"
        >
          <Play className="h-4 w-4" />
          {isRunning ? "Menjalankan..." : !pyodideReady ? "Memuat Python..." : "Jalankan Kode"}
        </Button>
        <Button onClick={onReset} variant="outline" size="lg" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
}
