import { useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import type { Track } from "@/lib/game-data";
import { cn } from "@/lib/utils";

interface Props {
  tracks: Track[];
  disabled?: boolean;
  onPick: (t: Track) => void;
}

export function GuessSearch({ tracks, disabled, onPick }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return tracks
      .filter(t => t.title.toLowerCase().includes(s) || t.artist.toLowerCase().includes(s))
      .slice(0, 8);
  }, [q, tracks]);

  return (
    <div className="relative">
      <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 transition-all focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          value={q}
          disabled={disabled}
          onChange={e => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Wyszukaj utwór lub artystę…"
          className="w-full bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-2xl border border-border bg-popover p-1.5 shadow-2xl animate-fade-in">
          {results.map(t => (
            <button
              key={t.id}
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onPick(t); setQ(""); setOpen(false); inputRef.current?.blur(); }}
              className={cn(
                "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-accent/15"
              )}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{t.title}</div>
                <div className="truncate text-xs text-muted-foreground">{t.artist}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
