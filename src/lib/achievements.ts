export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-perfect", title: "Pierwsze 100%", description: "Zgadnij utwór za pierwszym razem (0.5s)", icon: "✨" },
  { id: "streak-50", title: "Seria 50", description: "Zgadnij 50 utworów pod rząd", icon: "🔥" },
  { id: "soma-100", title: "Soma 0,5 mg — 100%", description: "Ukończ album Soma 0,5 mg z wynikiem 100%", icon: "💊" },
  { id: "albums-10", title: "Kolekcjoner", description: "Ukończ 10 albumów", icon: "💿" },
  { id: "daily-king", title: "Król Daily", description: "7 dni streaka w trybie Daily", icon: "👑" },
  { id: "speedrun", title: "Speedrun", description: "Zgadnij 10 utworów w mniej niż 5 sekund każdy", icon: "⚡" },
  { id: "encyclopedist", title: "Encyklopedysta", description: "Zgadnij 250 unikalnych utworów", icon: "📚" },
  { id: "comeback", title: "Comeback Kid", description: "Wygraj rundę po 5 nieudanych pod rząd", icon: "💪" },
];

const KEY = "rg-achievements";

export function getUnlocked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function unlock(id: string): boolean {
  const set = getUnlocked();
  if (set.has(id)) return false;
  set.add(id);
  localStorage.setItem(KEY, JSON.stringify([...set]));
  return true;
}
