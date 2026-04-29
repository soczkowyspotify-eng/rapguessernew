import { useTheme } from "./theme-provider";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const opts: { v: "light" | "dark" | "system"; icon: typeof Sun; label: string }[] = [
    { v: "light", icon: Sun, label: "Light" },
    { v: "system", icon: Monitor, label: "System" },
    { v: "dark", icon: Moon, label: "Dark" },
  ];
  return (
    <div className="glass inline-flex items-center gap-0.5 rounded-full p-1">
      {opts.map(({ v, icon: Icon, label }) => (
        <button
          key={v}
          onClick={() => setTheme(v)}
          aria-label={label}
          aria-pressed={theme === v}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-all",
            theme === v
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
