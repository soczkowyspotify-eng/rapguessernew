import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DURATIONS,
  getAllSongs,
  getDailyKey,
  getDailyTrack,
  getTracksForCategory,
  type Track,
} from "@/lib/game-data";
import { unlock } from "@/lib/achievements";
import { toast } from "sonner";

type Status = "playing" | "won" | "lost";

interface Stats {
  score: number;
  streak: number;
  bestStreak: number;
  totalGuessed: number;
}

const STATS_KEY = "rg-stats";
const DAILY_KEY = "rg-daily";

function loadStats(): Stats {
  if (typeof window === "undefined") return { score: 0, streak: 0, bestStreak: 0, totalGuessed: 0 };
  try {
    return JSON.parse(localStorage.getItem(STATS_KEY) || "") as Stats;
  } catch {
    return { score: 0, streak: 0, bestStreak: 0, totalGuessed: 0 };
  }
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

interface DailyState {
  key: string;
  status: Status;
  attempts: number;
}

function loadDaily(): DailyState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DAILY_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as DailyState;
    if (v.key !== getDailyKey()) return null;
    return v;
  } catch {
    return null;
  }
}

export function useGame() {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [attemptIdx, setAttemptIdx] = useState(0);
  const [status, setStatus] = useState<Status>("playing");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [guesses, setGuesses] = useState<{ trackId: string; correct: boolean }[]>([]);
  const [stats, setStats] = useState<Stats>(loadStats);
  const [dailyDone, setDailyDone] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    try { localStorage.setItem(STATS_KEY, JSON.stringify(stats)); } catch { /* ignore */ }
  }, [stats]);

  const startRound = useCallback((catId: string) => {
    if (catId === "daily") {
      const prev = loadDaily();
      if (prev && prev.status !== "playing") {
        const t = getDailyTrack();
        if (t) {
          setCategoryId("daily");
          setTrack(t);
          setStatus(prev.status);
          setAttemptIdx(prev.attempts);
          setGuesses([]);
          setDailyDone(true);
          toast.info("Daily już ukończone — wróć jutro!");
          return;
        }
      }
      const t = getDailyTrack();
      if (!t) { toast.error("Brak utworów"); return; }
      setCategoryId("daily");
      setTrack(t);
      setAttemptIdx(0);
      setStatus("playing");
      setGuesses([]);
      setProgress(0);
      setDailyDone(false);
      return;
    }

    const pool = getTracksForCategory(catId);
    if (pool.length === 0) {
      toast.error("Brak utworów w tej kategorii");
      return;
    }
    setCategoryId(catId);
    setTrack(pickRandom(pool));
    setAttemptIdx(0);
    setStatus("playing");
    setGuesses([]);
    setProgress(0);
    setDailyDone(false);
  }, []);

  const stopAudio = useCallback(() => {
    if (stopTimerRef.current) { window.clearTimeout(stopTimerRef.current); stopTimerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0; }
    setIsPlaying(false);
    setProgress(0);
  }, []);

  const playSegment = useCallback(() => {
    if (!track || status !== "playing") return;
    const dur = DURATIONS[attemptIdx];
    if (!audioRef.current) return;

    stopAudio();
    const a = audioRef.current;
    a.currentTime = 0;

    const playPromise = a.play();
    if (playPromise) {
      playPromise.catch(() => {
        toast.error("Nie udało się odtworzyć fragmentu (CORS / link?)");
      });
    }
    setIsPlaying(true);

    const start = performance.now();
    const tick = () => {
      const elapsed = (performance.now() - start) / 1000;
      setProgress(Math.min(1, elapsed / dur));
      if (elapsed < dur) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    stopTimerRef.current = window.setTimeout(() => {
      stopAudio();
    }, dur * 1000);
  }, [attemptIdx, status, stopAudio, track]);

  const persistDaily = useCallback((s: Status, attempts: number) => {
    if (categoryId !== "daily") return;
    try {
      localStorage.setItem(DAILY_KEY, JSON.stringify({ key: getDailyKey(), status: s, attempts }));
    } catch { /* ignore */ }
  }, [categoryId]);

  const submitGuess = useCallback((guess: Track) => {
    if (!track || status !== "playing") return;
    const correct = guess.id === track.id;
    setGuesses(g => [...g, { trackId: guess.id, correct }]);

    if (correct) {
      const earned = Math.max(1, DURATIONS.length - attemptIdx);
      setStatus("won");
      stopAudio();
      persistDaily("won", attemptIdx);
      setStats(s => {
        const newStreak = s.streak + 1;
        const next = {
          score: s.score + earned,
          streak: newStreak,
          bestStreak: Math.max(s.bestStreak, newStreak),
          totalGuessed: s.totalGuessed + 1,
        };
        if (attemptIdx === 0 && unlock("first-perfect")) {
          toast.success("🏆 Osiągnięcie: Pierwsze 100%");
        }
        if (newStreak >= 50 && unlock("streak-50")) {
          toast.success("🏆 Osiągnięcie: Seria 50");
        }
        return next;
      });
      toast.success(`Trafiony! +${earned} pkt`);
    } else {
      const next = attemptIdx + 1;
      if (next >= DURATIONS.length) {
        setStatus("lost");
        stopAudio();
        persistDaily("lost", DURATIONS.length - 1);
        setStats(s => ({ ...s, streak: 0 }));
        toast.error("Nie tym razem!");
      } else {
        setAttemptIdx(next);
      }
    }
  }, [attemptIdx, status, stopAudio, track, persistDaily]);

  const skip = useCallback(() => {
    if (status !== "playing") return;
    const next = attemptIdx + 1;
    if (next >= DURATIONS.length) {
      setStatus("lost");
      stopAudio();
      persistDaily("lost", DURATIONS.length - 1);
      setStats(s => ({ ...s, streak: 0 }));
    } else {
      setAttemptIdx(next);
    }
  }, [attemptIdx, status, stopAudio, persistDaily]);

  const nextRound = useCallback(() => {
    if (categoryId === "daily") {
      toast.info("Daily masz raz na dobę — spróbuj innej kategorii.");
      return;
    }
    if (categoryId) startRound(categoryId);
  }, [categoryId, startRound]);

  useEffect(() => {
    if (!track) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
      audioRef.current.crossOrigin = "anonymous";
    }
    audioRef.current.src = track.previewUrl;
  }, [track]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  const allTracks = useMemo(() => getAllSongs(), []);

  return {
    categoryId, track, attemptIdx, status,
    isPlaying, progress, guesses, stats, allTracks, dailyDone,
    startRound, playSegment, submitGuess, skip, nextRound,
  };
}
