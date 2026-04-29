// Realna baza piosenek i albumów RAPGUESSER.
// Źródła: src/data/songs.source.mjs i src/data/albums.source.mjs (kopia z plików użytkownika).
// Pliki audio hostowane są na zewnętrznym CDN (Cloudflare R2).

import { SONGS_DB as RAW_SONGS } from "@/data/songs.source.mjs";
import { ALBUMS_DB as RAW_ALBUMS } from "@/data/albums.source.mjs";

export interface Track {
  id: string;
  title: string;
  artist: string;
  year?: number;
  previewUrl: string;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  year: number;
  cover: string;
  songs: Track[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  trackCount: number;
}

interface RawSong {
  id: string;
  title: string;
  artist: string;
  year?: number;
  type?: string;
  src: string;
}

interface RawAlbum {
  id: string;
  title: string;
  artist: string;
  year: number;
  cover: string;
  songs: RawSong[];
}

const ADMIN_SONGS_KEY = "rg-admin-songs";
const ADMIN_ALBUMS_KEY = "rg-admin-albums";

function loadOverlay<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function normalizeSong(s: RawSong): Track {
  return {
    id: s.id,
    title: s.title,
    artist: s.artist,
    year: s.year,
    previewUrl: s.src,
  };
}

function normalizeAlbum(a: RawAlbum): Album {
  return {
    id: a.id,
    title: a.title,
    artist: a.artist,
    year: a.year,
    cover: a.cover,
    songs: a.songs.map(normalizeSong),
  };
}

// Bazowe dane (z plików .mjs)
const BASE_SONGS: Track[] = (RAW_SONGS as RawSong[]).map(normalizeSong);
const BASE_ALBUMS: Album[] = (RAW_ALBUMS as RawAlbum[]).map(normalizeAlbum);

// Dane z panelu admina (localStorage)
function userSongs(): Track[] {
  return loadOverlay<RawSong>(ADMIN_SONGS_KEY).map(normalizeSong);
}
function userAlbums(): Album[] {
  return loadOverlay<RawAlbum>(ADMIN_ALBUMS_KEY).map(normalizeAlbum);
}

export function getAllSongs(): Track[] {
  const all = [...BASE_SONGS, ...userSongs()];
  // dedup po id
  const seen = new Set<string>();
  return all.filter(t => (seen.has(t.id) ? false : (seen.add(t.id), true)));
}

export function getAllAlbums(): Album[] {
  const all = [...BASE_ALBUMS, ...userAlbums()];
  const seen = new Set<string>();
  return all.filter(a => (seen.has(a.id) ? false : (seen.add(a.id), true)));
}

// ── Kategorie wyprowadzone z danych ──
function buildCategories(): Category[] {
  const songs = getAllSongs();
  const albums = getAllAlbums();
  const cats: Category[] = [
    { id: "all", name: "Wszystko", description: "Pełna baza utworów", trackCount: songs.length },
    { id: "daily", name: "Daily", description: "Codzienny utwór", trackCount: 1 },
  ];
  albums.forEach(a =>
    cats.push({
      id: `album:${a.id}`,
      name: a.title,
      description: `${a.artist} · ${a.year}`,
      trackCount: a.songs.length,
    }),
  );
  return cats;
}

export function getCategories(): Category[] {
  return buildCategories();
}

export function getTracksForCategory(catId: string): Track[] {
  if (catId === "all") return getAllSongs();
  if (catId === "daily") {
    const t = getDailyTrack();
    return t ? [t] : [];
  }
  if (catId.startsWith("album:")) {
    const id = catId.slice("album:".length);
    return getAllAlbums().find(a => a.id === id)?.songs ?? [];
  }
  return [];
}

// ── Daily Mode: deterministyczny pick na bazie daty ──
function dailyIndex(seedDate: Date, max: number): number {
  const s = `${seedDate.getUTCFullYear()}-${seedDate.getUTCMonth()}-${seedDate.getUTCDate()}`;
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % Math.max(1, max);
}

export function getDailyTrack(date: Date = new Date()): Track | null {
  const songs = getAllSongs();
  if (!songs.length) return null;
  return songs[dailyIndex(date, songs.length)];
}

export function getDailyKey(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

// ── Admin helpers ──
export function saveAdminSongs(list: RawSong[]) {
  localStorage.setItem(ADMIN_SONGS_KEY, JSON.stringify(list));
}
export function loadAdminSongs(): RawSong[] {
  return loadOverlay<RawSong>(ADMIN_SONGS_KEY);
}
export function saveAdminAlbums(list: RawAlbum[]) {
  localStorage.setItem(ADMIN_ALBUMS_KEY, JSON.stringify(list));
}
export function loadAdminAlbums(): RawAlbum[] {
  return loadOverlay<RawAlbum>(ADMIN_ALBUMS_KEY);
}

// ── Stałe gry ──
export const DURATIONS = [0.5, 1, 2, 5, 8, 12] as const;

// ── Legacy named exports (kompatybilność z poprzednim kodem) ──
export const ALL_TRACKS: Track[] = BASE_SONGS;
export const CATEGORIES: Category[] = buildCategories();
export const TRACKS: Record<string, Track[]> = Object.fromEntries(
  BASE_ALBUMS.map(a => [`album:${a.id}`, a.songs]),
);
