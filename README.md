# RAP GUESSER — GitHub Pages build

Czysty Vite + React + React Router. Gotowe do wrzucenia na GitHub Pages.

## Szybki start

```bash
pnpm install      # albo: npm install / bun install
pnpm dev          # http://localhost:5173
pnpm build        # produkcyjny build do ./dist
pnpm preview      # podgląd builda
```

## Deploy na GitHub Pages

1. Wrzuć ten katalog do nowego repo na GitHubie:
   ```bash
   git init
   git add .
   git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<USER>/<REPO>.git
   git push -u origin main
   ```

2. W repo na GitHubie: **Settings → Pages → Source: GitHub Actions**.

3. Workflow `.github/workflows/deploy.yml` odpali się automatycznie przy każdym pushu na `main` / `master`.
   - Sam wykrywa nazwę repo i ustawia `VITE_BASE` (np. `/rapguesser/`).
   - Dla repo `<user>.github.io` używa `/`.
   - Generuje `404.html` jako kopię `index.html` (fallback dla refresh na podstronach).
   - Aplikacja używa `HashRouter`, więc adresy wyglądają np. `https://user.github.io/rapguesser/#/admin` — działają nawet bez fallbacka.

4. Po pierwszym udanym buildzie URL pojawi się w **Actions → Deploy to GitHub Pages → deploy**.

## Lokalna konfiguracja base

Jeśli budujesz lokalnie pod konkretne repo:

```bash
VITE_BASE=/moje-repo/ pnpm build
```

Albo edytuj `vite.config.ts` i podmień `__REPO_NAME__`.

## Co jest w środku

- `src/pages/Home.tsx` — gra
- `src/pages/Admin.tsx` — panel zarządzania utworami / albumami (zapisuje do `localStorage`)
- `src/data/songs.source.mjs`, `albums.source.mjs` — Twoja baza
- `src/hooks/use-game.ts` — logika gry, daily mode, system sekund
- `src/lib/game-data.ts` — dostęp do utworów, kategorii, miks z adminem
- `src/lib/achievements.ts` — osiągnięcia
- `src/components/*` — UI (vinyl, waveform, theme toggle, kategorie, search…)

## Uwagi

- Pliki MP3 hostujesz na osobnym serwerze — w bazie podajesz pełne URL-e.
- Cały stan (admin, osiągnięcia, postęp daily) trzymany jest w `localStorage` przeglądarki.
- Brak SSR / backendu — czysta strona statyczna.
