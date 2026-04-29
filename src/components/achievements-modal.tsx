import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACHIEVEMENTS, getUnlocked } from "@/lib/achievements";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";

export function AchievementsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) setUnlocked(getUnlocked());
  }, [open]);

  const total = ACHIEVEMENTS.length;
  const have = ACHIEVEMENTS.filter(a => unlocked.has(a.id)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-border bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-baseline justify-between font-display text-2xl">
            <span>Osiągnięcia</span>
            <span className="font-mono text-base text-muted-foreground tabular-nums">{have}/{total}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {ACHIEVEMENTS.map(a => {
            const got = unlocked.has(a.id);
            return (
              <div
                key={a.id}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border p-4 transition-all",
                  got
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-muted/20"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-all",
                      got ? "bg-primary/15" : "bg-muted"
                    )}
                  >
                    {got ? a.icon : <Lock className="h-5 w-5 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0">
                    <div className={cn("font-semibold", got ? "text-foreground" : "text-muted-foreground")}>{a.title}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{a.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
