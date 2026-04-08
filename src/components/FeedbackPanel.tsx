import { cn } from "@/lib/utils";

interface FeedbackPanelProps {
  error: string | null;
  success: boolean;
  levelDescription: string;
}

export default function FeedbackPanel({ error, success, levelDescription }: FeedbackPanelProps) {
  return (
    <div className="space-y-2 px-4 pb-3">
      <p className="text-sm text-muted-foreground">{levelDescription}</p>

      {error && (
        <div className={cn(
          "rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        )}>
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
          🎉 Berhasil! Level selesai!
        </div>
      )}
    </div>
  );
}
