# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Träningsapp

## Projektbeskrivning

Kost- och träningsapp (webbapp/PWA, mobil-först). MVP = kost-spårning: onboarding med auto-beräknat kalori-/makromål, dagsöversikt, kalender, tre loggningssätt (sökning, streckkod, fotoanalys), måltidshistorik, profilinställningar. Fullständig spec: `app-spec-mvp.md`.

Träningsdelen byggs som ett tillägg ovanpå MVP:t: automatisk Strava-synk (webhook, ej manuell loggning i huvudflödet), AI-schemagenerator med adaptiv justering, AI-utvärdering av pass, och en osynlig kalori-koppling till kost-målet. Spec: `app-spec-training.md` + `app-spec-training-addendum.md` (läs båda, addendumet är tillägg/ändringar, inte ersättning).

## Tech-stack

- React + Vite + TypeScript, react-router, @tanstack/react-query
- Tailwind CSS v4 (`@tailwindcss/vite`, tokens i `src/index.css` via `@theme`, ingen config-fil)
- vite-plugin-pwa (manifest, service worker, offline)
- **Supabase** (Postgres + Auth + Edge Functions): magic-link login, RLS per användare
- Open Food Facts API (publik, ingen nyckel) för sökning/streckkod
- Claude API (vision) för fotoanalys, via Edge Function `supabase/functions/analyze-meal-photo` (håller `ANTHROPIC_API_KEY` server-side)
- Claude API (text/tool-use) för AI-schema (`generate-training-plan`), pass-utvärdering (`evaluate-workout`) och adaptiv schemajustering (`adjust-training-plan`) — delad system-prompt med säkerhetsramar i `supabase/functions/_shared/safetyPrompt.ts`
- Strava API (OAuth + push-webhook) för automatisk träningssynk — `strava-oauth-start`/`strava-oauth-callback` (anslutning), `strava-webhook` (push-events, huvudflöde), `strava-manual-sync` (diskret fallback-knapp i Profil). Delad mappnings-/upsert-logik i `supabase/functions/_shared/stravaActivity.ts`
- `barcode-detector` (native + WASM-fallback för Safari/iOS)
- Dexie installerat men **oanvänt** (relik från tidigare lokal-first-idé) — kan tas bort ur `package.json`

## Arkitekturbeslut

Ursprungligt scaffold var lokalt (IndexedDB/Dexie, ingen auth). Nu gäller istället Supabase-arkitekturen i `app-spec-mvp.md`, med Edge Function som proxy för Claude vision-anrop. Fullständigt planeringsdokument: `/Users/hugoback/.claude/plans/groovy-booping-neumann.md`.

## Konventioner

- TypeScript, funktionella komponenter med hooks
- (fylls på efterhand)

## Status

Kost-MVP (M1–M10) klar. Träningsdelen: datamodell, `/training`-UI (Idag/Schema/Historik/passdetalj), Hem-skärm och ny nav (Hem/Kost/Träning/Profil), AI-schemagenerator (flerveckors, historik-baserad), AI-utvärdering, adaptiv schemajustering, och Strava OAuth + webhook-synk är byggda och deployade. Kvar: Garmin-synk, automatisk avvikelse-detektering i den adaptiva justeringen (bara den knapp-triggade vägen är byggd).

## Driftsättning

Engångssteg per Supabase-projekt/Strava-app (inte något som görs i UI:t):

- **Strava-app:** registrerad på strava.com/settings/api. Authorization Callback Domain måste vara `<project-ref>.supabase.co` (Supabase-projektets domän, inte Vercel-domänen — OAuth-callbacken är en Edge Function).
- **Secrets:** `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_WEBHOOK_VERIFY_TOKEN` satta via `supabase secrets set` (utöver `ANTHROPIC_API_KEY` som redan krävdes för fotoanalysen).
- **Webhook-subscription:** ett engångsanrop till Stravas `push_subscriptions`-endpoint pekar mot `strava-webhook`-funktionen. Görs en gång per Strava-app, inte per användare:

  ```bash
  curl -X POST https://www.strava.com/api/v3/push_subscriptions \
    -F client_id=<STRAVA_CLIENT_ID> \
    -F client_secret=<STRAVA_CLIENT_SECRET> \
    -F callback_url=https://<project-ref>.supabase.co/functions/v1/strava-webhook \
    -F verify_token=<STRAVA_WEBHOOK_VERIFY_TOKEN>
  ```

  Strava svarar med ett GET-anrop mot `strava-webhook` (`hub.challenge`) som funktionen ekar tillbaka automatiskt — inget mer att göra. Kontrollera aktiv subscription med samma URL som GET (utan `-F`-flaggorna, som query-params).

## Commands

- `npm run dev` — dev server
- `npm run build` — type-check + prod build (genererar PWA service worker)
- `npm run preview` — förhandsgranska prod-build
- `npm run lint` — oxlint

## Arkitektur (filstruktur)

- `src/main.tsx` — entry point
- `src/App.tsx` — router + `QueryClientProvider`, routes: `/` (Hem), `/nutrition`, `/nutrition/calendar`, `/training` (+ `/training/*`-vyer inuti `TrainingPage`), `/profile` (i `AppShell`) samt `/login`, `/onboarding`
- `vite.config.ts` — plugins: react, tailwind, pwa
- `src/index.css` — Tailwind + design tokens (teal accent `#1D9E75`, makro-färger, aktivitetstyp-färger, surface/ink/border/warning)
- `src/components/layout/` — `AppShell`, `BottomNav`
- `src/components/training/` — träningsdelens UI-byggstenar (vecko-vy, passdetalj-sheet, AI-schemagenerator, adaptiv-justering-knappar)
- `src/routes/` — en fil per toppnivå-sida, `src/routes/training/` för Idag/Schema/Historik
- `src/lib/queryClient.ts` — delad `QueryClient`
- `supabase/` — migrations + Edge Functions (`_shared/` för kod som delas mellan flera funktioner, t.ex. säkerhets-system-prompten och Strava-mappningen)

## Effektiv token-användning

- **Kompakteringsinstruktion:** vid `/compact`, prioritera kod-ändringar, filnamn och testresultat. Släpp utförliga förklaringar och gammal chatt-historik.
- **Var specifik i uppgifter, inte "förbättra/städa upp".** Vaga uppdrag ("gör kodbasen bättre") tvingar breda sökningar över hela repot. Peka alltid ut fil(er) och önskat beteende när det går.
- **Undvik att läsa hela loggar/testoutput rakt av.** Filtrera till fel/varningar innan du visar dem i kontext (automatiskt för `npm test`/`npm run build`-körningar via hook).
- **Delegera research/utforskning till en subagent** när du behöver läsa många filer bara för att förstå något (t.ex. "hur hänger X och Y ihop") — låt sammanfattningen komma tillbaka, inte alla enskilda filer.
- **Håll denna fil under ~200 rader.** Detaljerade instruktioner för enskilda arbetsflöden (t.ex. hur en specifik migration ska köras) hör hemma i en skill, inte här — annars laddas de i varje session även när de inte är relevanta.
