import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, RotateCcw, SkipForward, Trophy, Sparkles, Settings, Calendar } from "lucide-react";
import { useGame } from "@/hooks/use-game";
import { ThemeToggle } from "@/components/theme-toggle";
import { Vinyl } from "@/components/vinyl";
import { Waveform } from "@/components/waveform";
import { DurationStepper } from "@/components/duration-stepper";
import { GuessSearch } from "@/components/guess-search";
import { CategoryGrid } from "@/components/category-grid";
import { AchievementsModal } from "@/components/achievements-modal";
import { DURATIONS, getCategories } from "@/lib/game-data";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const g = useGame();
  const [achOpen, setAchOpen] = useState(false);
  const cats = getCategories();
  const activeCat = g.categoryId ? cats.find(c => c.id === g.categoryId) : null;

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <header className="flex items-center justify-between gap-3">
        <div>
          <div className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
              RAP GUESSER
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAchOpen(true)}
            className="glass hover-lift inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground"
          >
            <Trophy className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Osiągnięcia</span>
          </button>
          <Link
            to="/admin"
            className="glass hover-lift inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground"
            aria-label="Panel admina"
          >
            <Settings className="h-4 w-4" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { v: g.stats.score, l: "Wynik" },
          { v: g.stats.streak, l: "Seria" },
          { v: g.stats.totalGuessed, l: "Trafione" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-2xl p-3 text-center sm:p-4">
            <div className="font-mono text-2xl font-semibold tabular-nums text-foreground sm:text-3xl">
              {s.v}
            </div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
              {s.l}
            </div>
          </div>
        ))}
      </section>

      <main className="mt-6 grid gap-5 lg:grid-cols-[380px_1fr]">
        <aside>
          <CategoryGrid selected={g.categoryId} onSelect={g.startRound} />
        </aside>

        <section className="glass relative overflow-hidden rounded-3xl p-5 sm:p-7">
          {!g.track && (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <Sparkles className="h-10 w-10 text-primary" />
              <h3 className="font-display text-2xl font-semibold">Wybierz tryb</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Daily, pełna baza albo konkretny album. Zaczynamy od 0,5s — nie zgadniesz, odsłonimy więcej.
              </p>
            </div>
          )}

          {g.track && g.status === "playing" && (
            <div className="space-y-5 animate-fade-up">
              <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {g.categoryId === "daily" && <Calendar className="h-3.5 w-3.5 text-primary" />}
                {activeCat?.name}
              </div>

              <Vinyl playing={g.isPlaying} />
              <Waveform active={g.isPlaying} />

              <div className="h-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-[width] duration-75"
                  style={{ width: `${g.progress * 100}%` }}
                />
              </div>

              <DurationStepper current={g.attemptIdx} unlockedUpTo={g.attemptIdx} />

              <button
                onClick={g.playSegment}
                disabled={g.isPlaying}
                className={cn(
                  "group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-primary px-6 py-4 font-semibold text-primary-foreground transition-all",
                  "hover:shadow-[var(--shadow-glow)] active:scale-[0.99]",
                  "disabled:cursor-not-allowed disabled:opacity-70",
                )}
              >
                <Play className="h-5 w-5 fill-current" />
                <span className="font-display text-lg tracking-wide">
                  {g.isPlaying ? "Gram…" : `Graj ${DURATIONS[g.attemptIdx]}s`}
                </span>
              </button>

              <GuessSearch tracks={g.allTracks} disabled={g.isPlaying} onPick={g.submitGuess} />

              <div className="flex justify-center">
                <button
                  onClick={g.skip}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <SkipForward className="h-4 w-4" />
                  Pomiń
                </button>
              </div>

              {g.guesses.length > 0 && (
                <div className="space-y-1.5">
                  {g.guesses.map((guess, i) => {
                    const t = g.allTracks.find(x => x.id === guess.trackId);
                    return (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm animate-fade-up",
                          guess.correct
                            ? "border-success/40 bg-success/10"
                            : "border-destructive/40 bg-destructive/10",
                        )}
                      >
                        <span className="truncate">
                          <span className="font-semibold text-foreground">{t?.title}</span>
                          <span className="ml-2 text-muted-foreground">{t?.artist}</span>
                        </span>
                        <span className={cn("font-mono text-xs tabular-nums", guess.correct ? "text-success" : "text-destructive")}>
                          {guess.correct ? "Trafione" : "Pudło"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {g.track && g.status !== "playing" && (
            <div className="space-y-5 text-center animate-fade-up">
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]",
                  g.status === "won" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive",
                )}
              >
                {g.status === "won" ? "Trafione" : "Koniec rundy"}
              </div>
              <div>
                <div className="font-display text-3xl font-bold text-foreground">{g.track.title}</div>
                <div className="mt-1 text-base text-muted-foreground">{g.track.artist}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                {g.categoryId === "daily" && g.dailyDone
                  ? "Wracaj jutro po nowy daily!"
                  : g.status === "won"
                    ? `Zdobyte punkty: ${Math.max(1, DURATIONS.length - g.attemptIdx)}`
                    : "Spróbuj jeszcze raz — następny utwór czeka."}
              </div>
              {g.categoryId !== "daily" && (
                <button
                  onClick={g.nextRound}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-4 font-display text-lg font-semibold tracking-wide text-primary-foreground transition-all hover:shadow-[var(--shadow-glow)] active:scale-[0.99]"
                >
                  <RotateCcw className="h-5 w-5" />
                  Następny utwór
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      <AchievementsModal open={achOpen} onOpenChange={setAchOpen} />
    </div>
  );
}
