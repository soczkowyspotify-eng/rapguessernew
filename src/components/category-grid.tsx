import { getCategories, getAllAlbums, type Album } from "@/lib/game-data";
import { cn } from "@/lib/utils";
import { Calendar, Library, Music2 } from "lucide-react";

interface Props {
  selected: string | null;
  onSelect: (id: string) => void;
  /** Pokaż tylko tryby specjalne (Daily / Wszystko) — gdy gracz wchodzi z poziomu albumu. */
  compact?: boolean;
}

export function CategoryGrid({ selected, onSelect, compact }: Props) {
  const cats = getCategories();
  const daily = cats.find(c => c.id === "daily")!;
  const all = cats.find(c => c.id === "all")!;
  const albums = getAllAlbums();

  return (
    <div className="space-y-4">
      {/* Tryby specjalne */}
      <div className="grid grid-cols-1 gap-3">
        <ModeCard
          icon={<Calendar className="h-5 w-5" />}
          title="Daily Mode"
          subtitle="Codzienny utwór, jedna szansa"
          accent
          active={selected === "daily"}
          onClick={() => onSelect("daily")}
        />
        <ModeCard
          icon={<Library className="h-5 w-5" />}
          title={all.name}
          subtitle={`${all.trackCount} utworów w bazie`}
          active={selected === "all"}
          onClick={() => onSelect("all")}
        />
      </div>

      {!compact && albums.length > 0 && (
        <div>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Albumy
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {albums.map(a => (
              <AlbumCard
                key={a.id}
                album={a}
                active={selected === `album:${a.id}`}
                onClick={() => onSelect(`album:${a.id}`)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModeCard({
  icon, title, subtitle, active, onClick, accent,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  active?: boolean;
  accent?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "glass hover-lift group flex items-center gap-4 rounded-2xl p-4 text-left transition-all",
        active && "ring-2 ring-primary",
      )}
    >
      <div
        className={cn(
          "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
          accent ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
        )}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-display text-lg font-semibold tracking-tight text-foreground">
          {title}
        </div>
        <div className="truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  );
}

function AlbumCard({ album, active, onClick }: { album: Album; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group glass hover-lift relative overflow-hidden rounded-2xl p-2 text-left transition-all",
        active && "ring-2 ring-primary",
      )}
    >
      <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
        {album.cover ? (
          <img
            src={album.cover}
            alt={album.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        ) : (
          <div className="grid h-full w-full place-items-center text-muted-foreground">
            <Music2 className="h-8 w-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/80">
            {album.songs.length} utworów
          </div>
        </div>
      </div>
      <div className="mt-2 px-1 pb-1">
        <div className="truncate font-display text-sm font-semibold text-foreground">{album.title}</div>
        <div className="truncate text-xs text-muted-foreground">{album.artist} · {album.year}</div>
      </div>
    </button>
  );
}
