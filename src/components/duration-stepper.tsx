import { DURATIONS } from "@/lib/game-data";
import { cn } from "@/lib/utils";

interface Props {
  current: number;
  unlockedUpTo: number; // inclusive index that has been reached
}

export function DurationStepper({ current, unlockedUpTo }: Props) {
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {DURATIONS.map((d, i) => {
        const active = i === current;
        const used = i < current;
        const reachable = i <= unlockedUpTo;
        return (
          <div key={d} className="flex flex-col items-center gap-1.5">
            <div
              className={cn(
                "relative flex h-12 min-w-12 items-center justify-center rounded-xl px-2 transition-all duration-300 sm:h-14 sm:min-w-14",
                active && "scale-110 bg-primary text-primary-foreground shadow-[var(--shadow-glow)]",
                !active && used && "bg-muted text-muted-foreground line-through opacity-60",
                !active && !used && reachable && "glass text-foreground",
                !active && !used && !reachable && "border border-dashed border-border text-muted-foreground/40"
              )}
            >
              <span className={cn("font-mono text-sm font-semibold tabular-nums sm:text-base", active && "text-base sm:text-lg")}>
                {d}s
              </span>
              {active && (
                <span className="pointer-events-none absolute -inset-1 rounded-2xl border border-primary/40 animate-pop" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
