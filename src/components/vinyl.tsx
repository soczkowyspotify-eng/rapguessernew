import { cn } from "@/lib/utils";

export function Vinyl({ playing }: { playing: boolean }) {
  return (
    <div className="relative mx-auto h-44 w-44 sm:h-52 sm:w-52">
      {/* glow */}
      <div
        aria-hidden
        className={cn(
          "absolute -inset-6 rounded-full opacity-0 transition-opacity duration-700",
          playing && "opacity-100"
        )}
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklch, var(--color-primary) 35%, transparent), transparent 70%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className={cn(
          "relative h-full w-full rounded-full shadow-[0_20px_60px_-10px_rgba(0,0,0,0.6)] ring-1 ring-border",
          playing && "spin-vinyl"
        )}
        style={{
          background:
            "conic-gradient(from 0deg, #0a0a0a 0%, #1a1a1a 12%, #2a2a2a 14%, #1a1a1a 18%, #0a0a0a 35%, #2a2a2a 50%, #0a0a0a 52%, #1a1a1a 75%, #2a2a2a 88%, #0a0a0a 100%)",
        }}
      >
        {/* grooves */}
        <div className="absolute inset-3 rounded-full border border-white/5" />
        <div className="absolute inset-6 rounded-full border border-white/5" />
        <div className="absolute inset-10 rounded-full border border-white/5" />
        {/* label */}
        <div
          className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-20 sm:w-20"
          style={{
            background:
              "radial-gradient(circle at 35% 35%, color-mix(in oklch, var(--color-primary) 70%, white), color-mix(in oklch, var(--color-primary) 90%, black))",
          }}
        >
          <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background" />
        </div>
      </div>
    </div>
  );
}
