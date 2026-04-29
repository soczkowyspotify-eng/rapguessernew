import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Save, Trash2, Music, Disc3 } from "lucide-react";
import { toast } from "sonner";
import {
  loadAdminSongs,
  saveAdminSongs,
  loadAdminAlbums,
  saveAdminAlbums,
} from "@/lib/game-data";

interface SongRow {
  id: string;
  title: string;
  artist: string;
  year?: number;
  src: string;
}

interface AlbumRow {
  id: string;
  title: string;
  artist: string;
  year: number;
  cover: string;
  songs: SongRow[];
}

export default function AdminPage() {
  const [tab, setTab] = useState<"songs" | "albums">("songs");
  const [songs, setSongs] = useState<SongRow[]>([]);
  const [albums, setAlbums] = useState<AlbumRow[]>([]);

  useEffect(() => {
    setSongs(loadAdminSongs() as SongRow[]);
    setAlbums(loadAdminAlbums() as AlbumRow[]);
  }, []);

  return (
    <div className="mx-auto min-h-screen w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-3">
        <Link
          to="/"
          className="glass hover-lift inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Wróć
        </Link>
        <h1 className="font-display text-2xl font-bold tracking-tight">Panel admina</h1>
        <div className="w-[88px]" />
      </header>

      <div className="mt-6 inline-flex rounded-full bg-muted p-1">
        <TabBtn active={tab === "songs"} onClick={() => setTab("songs")}>
          <Music className="h-4 w-4" /> Utwory ({songs.length})
        </TabBtn>
        <TabBtn active={tab === "albums"} onClick={() => setTab("albums")}>
          <Disc3 className="h-4 w-4" /> Albumy ({albums.length})
        </TabBtn>
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Zmiany są zapisywane lokalnie w przeglądarce (na tym urządzeniu) i nadpisują bazową bibliotekę dodanymi pozycjami. Bazowe dane (z plików <code>songs.js</code> / <code>albums.js</code>) zostają nietknięte.
      </p>

      <div className="mt-6">
        {tab === "songs" ? (
          <SongsEditor value={songs} onChange={setSongs} />
        ) : (
          <AlbumsEditor value={albums} onChange={setAlbums} />
        )}
      </div>
    </div>
  );
}

function TabBtn({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active ? "bg-background text-foreground shadow" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SongsEditor({ value, onChange }: { value: SongRow[]; onChange: (v: SongRow[]) => void }) {
  const [draft, setDraft] = useState<SongRow>({ id: "", title: "", artist: "", year: undefined, src: "" });

  const addSong = () => {
    if (!draft.id || !draft.title || !draft.artist || !draft.src) {
      toast.error("Wypełnij ID, tytuł, artystę i URL");
      return;
    }
    if (value.some(s => s.id === draft.id)) {
      toast.error("ID już istnieje");
      return;
    }
    onChange([...value, draft]);
    setDraft({ id: "", title: "", artist: "", year: undefined, src: "" });
  };

  const remove = (id: string) => onChange(value.filter(s => s.id !== id));

  const persist = () => {
    saveAdminSongs(value);
    toast.success("Zapisano utwory");
  };

  return (
    <div className="space-y-6">
      <section className="glass rounded-2xl p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold">Dodaj utwór</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-5">
          <Input placeholder="ID" value={draft.id} onChange={v => setDraft({ ...draft, id: v })} />
          <Input placeholder="Tytuł" value={draft.title} onChange={v => setDraft({ ...draft, title: v })} />
          <Input placeholder="Artysta" value={draft.artist} onChange={v => setDraft({ ...draft, artist: v })} />
          <Input
            placeholder="Rok"
            value={draft.year?.toString() ?? ""}
            onChange={v => setDraft({ ...draft, year: v ? Number(v) : undefined })}
          />
          <Input placeholder="MP3 URL" value={draft.src} onChange={v => setDraft({ ...draft, src: v })} />
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={addSong} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Dodaj
          </button>
        </div>
      </section>

      <section className="glass rounded-2xl">
        <div className="flex items-center justify-between p-4 sm:px-5">
          <h2 className="font-display text-lg font-semibold">Twoje utwory</h2>
          <button onClick={persist} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90">
            <Save className="h-4 w-4" /> Zapisz
          </button>
        </div>
        {value.length === 0 ? (
          <div className="px-5 pb-5 text-sm text-muted-foreground">Brak własnych utworów.</div>
        ) : (
          <ul className="divide-y divide-border">
            {value.map(s => (
              <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{s.title}</div>
                  <div className="truncate text-xs text-muted-foreground">{s.artist} · {s.id}</div>
                </div>
                <button onClick={() => remove(s.id)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function AlbumsEditor({ value, onChange }: { value: AlbumRow[]; onChange: (v: AlbumRow[]) => void }) {
  const [draft, setDraft] = useState<AlbumRow>({ id: "", title: "", artist: "", year: new Date().getFullYear(), cover: "", songs: [] });
  const [songDraft, setSongDraft] = useState<SongRow>({ id: "", title: "", artist: "", src: "" });
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = useMemo(() => value.find(a => a.id === activeId) ?? null, [value, activeId]);

  const addAlbum = () => {
    if (!draft.id || !draft.title || !draft.artist) { toast.error("Wypełnij ID, tytuł i artystę"); return; }
    if (value.some(a => a.id === draft.id)) { toast.error("ID już istnieje"); return; }
    onChange([...value, draft]);
    setDraft({ id: "", title: "", artist: "", year: new Date().getFullYear(), cover: "", songs: [] });
  };

  const removeAlbum = (id: string) => {
    onChange(value.filter(a => a.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const addSongToAlbum = () => {
    if (!active) return;
    if (!songDraft.id || !songDraft.title || !songDraft.src) { toast.error("Wypełnij dane utworu"); return; }
    onChange(value.map(a => a.id === active.id ? { ...a, songs: [...a.songs, { ...songDraft, artist: songDraft.artist || a.artist }] } : a));
    setSongDraft({ id: "", title: "", artist: "", src: "" });
  };

  const removeSongFromAlbum = (sid: string) => {
    if (!active) return;
    onChange(value.map(a => a.id === active.id ? { ...a, songs: a.songs.filter(s => s.id !== sid) } : a));
  };

  const persist = () => {
    saveAdminAlbums(value);
    toast.success("Zapisano albumy");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="glass rounded-2xl p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold">Dodaj album</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Input placeholder="ID albumu" value={draft.id} onChange={v => setDraft({ ...draft, id: v })} />
          <Input placeholder="Tytuł" value={draft.title} onChange={v => setDraft({ ...draft, title: v })} />
          <Input placeholder="Artysta" value={draft.artist} onChange={v => setDraft({ ...draft, artist: v })} />
          <Input placeholder="Rok" value={draft.year.toString()} onChange={v => setDraft({ ...draft, year: Number(v) || draft.year })} />
          <div className="sm:col-span-2">
            <Input placeholder="URL okładki" value={draft.cover} onChange={v => setDraft({ ...draft, cover: v })} />
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <button onClick={addAlbum} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" /> Dodaj album
          </button>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-semibold">Twoje albumy</h3>
            <button onClick={persist} className="inline-flex items-center gap-2 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background hover:opacity-90">
              <Save className="h-3.5 w-3.5" /> Zapisz
            </button>
          </div>
          <ul className="mt-2 space-y-2">
            {value.map(a => (
              <li key={a.id} className={[
                "flex items-center gap-3 rounded-xl border p-2 transition-colors",
                activeId === a.id ? "border-primary" : "border-border hover:bg-muted/40",
              ].join(" ")}>
                <button onClick={() => setActiveId(a.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                    {a.cover && <img src={a.cover} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{a.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{a.artist} · {a.songs.length} utworów</div>
                  </div>
                </button>
                <button onClick={() => removeAlbum(a.id)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
            {value.length === 0 && <li className="text-sm text-muted-foreground">Brak własnych albumów.</li>}
          </ul>
        </div>
      </section>

      <section className="glass rounded-2xl p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold">
          Utwory albumu {active ? <span className="text-muted-foreground">· {active.title}</span> : ""}
        </h2>
        {!active ? (
          <p className="mt-3 text-sm text-muted-foreground">Wybierz album z listy obok, żeby zarządzać utworami.</p>
        ) : (
          <>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Input placeholder="ID utworu" value={songDraft.id} onChange={v => setSongDraft({ ...songDraft, id: v })} />
              <Input placeholder="Tytuł" value={songDraft.title} onChange={v => setSongDraft({ ...songDraft, title: v })} />
              <Input placeholder={`Artysta (domyślnie ${active.artist})`} value={songDraft.artist} onChange={v => setSongDraft({ ...songDraft, artist: v })} />
              <Input placeholder="MP3 URL" value={songDraft.src} onChange={v => setSongDraft({ ...songDraft, src: v })} />
            </div>
            <div className="mt-3 flex justify-end">
              <button onClick={addSongToAlbum} className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90">
                <Plus className="h-4 w-4" /> Dodaj utwór
              </button>
            </div>

            <ul className="mt-4 divide-y divide-border">
              {active.songs.map(s => (
                <li key={s.id} className="flex items-center gap-3 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{s.title}</div>
                    <div className="truncate text-xs text-muted-foreground">{s.artist}</div>
                  </div>
                  <button onClick={() => removeSongFromAlbum(s.id)} className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
              {active.songs.length === 0 && <li className="py-2 text-sm text-muted-foreground">Brak utworów w albumie.</li>}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

function Input({ placeholder, value, onChange }: { placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
    />
  );
}
