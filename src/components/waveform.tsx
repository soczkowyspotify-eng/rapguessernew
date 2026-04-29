import { cn } from "@/lib/utils";

export function Waveform({ active }: { active: boolean }) {
  const bars = 28;
  return (
    <div className={cn("flex h-10 items-end justify-center gap-1 transition-opacity duration-300", active ? "opacity-100" : "opacity-30")}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "block w-[3px] origin-bottom rounded-full bg-primary transition-transform",
            active ? "" : "h-1 scale-y-50"
          )}
          style={
            active
              ? {
                  height: "100%",
                  animation: `wave-pulse 0.7s ease-in-out ${i * 0.04}s infinite`,
                }
              : { height: "8px" }
          }
        />
      ))}
    </div>
  );
}
