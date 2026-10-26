# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Strikt

## Projektbeskrivning

Kost- och hälsoapp (webbapp/PWA, mobil-först), produktnamn **Strikt**. Kost-spårning: onboarding med auto-beräknat kalori-/makromål, dagsöversikt, kalender, fyra loggningssätt (sökning, streckkod, fotoanalys, textbeskrivning), måltidshistorik, vatten, profilinställningar.

Appen har ingen träningsdel längre (Strava, AI-scheman och pass togs bort 2026-10, migration `0033_drop_training.sql`). Planerade hälsofunktioner: vikt & mått över tid, vatten, och senare en "mag-dagbok" för att spåra hur magen mår.

## Tech-stack

- React + Vite + TypeScript, react-router, @tanstack/react-query
- Tailwind CSS v4 (`@tailwindcss/vite`, tokens i `src/index.css` via `@theme`, ingen config-fil)
- vite-plugin-pwa (manifest, service worker, offline)
- **Supabase** (Postgres + Auth + Edge Functions): magic-link login, RLS per användare
- Open Food Facts API (publik, ingen nyckel) för sökning/streckkod
- Claude API (vision) för fotoanalys, via Edge Function `supabase/functions/analyze-meal-photo` (håller `ANTHROPIC_API_KEY` server-side)
- Kalori-uppskattning från text/foto (`analyze-meal-text`, `analyze-meal-photo`) är "grundad": `supabase/functions/_shared/mealEstimate.ts` låter Claude (Haiku 5.5, `CLAUDE_MEAL_MODEL`) dela upp måltiden och uppskatta gram, men näringsvärden per 100 g hämtas via verktyget `search_foods` ur de kurerade livsmedlen i `food_items`, och totalen summeras i koden. `/admin/ai-eval` (ägarkonto) jämför mot facit i `src/data/mealEvalCases.ts`. Textfunktionen har tillfälligt kvar en `engine: 'legacy'`-väg för jämförelsen
- Claude API (text) för måltidsförslag (`suggest-meals`); `off-fuzzy-search` proxar Open Food Facts-sökning server-side (CORS)
- `barcode-detector` (native + WASM-fallback för Safari/iOS)

## Arkitekturbeslut

Ursprungligt scaffold var lokalt (IndexedDB/Dexie, ingen auth). Nu används Supabase-arkitektur med Edge Functions som proxy för Claude vision-anrop.

## Konventioner

- TypeScript, funktionella komponenter med hooks
- (fylls på efterhand)

## Status

Kost-MVP (M1–M10) klar och deployad. Träningsdelen borttagen. Nästa: hälsofunktioner (vikt & mått, vatten), därefter mag-dagbok.

## Driftsättning

Webbappen deployas av Vercel vid push till `main`. Migrationer och Edge Functions deployas av GitHub Action `.github/workflows/supabase-deploy.yml` vid push som rör `supabase/` (kräver repo-secrets `SUPABASE_ACCESS_TOKEN` och `SUPABASE_DB_PASSWORD`; kan också köras manuellt under Actions). Engångssteg per Supabase-projekt: `ANTHROPIC_API_KEY` (och valfria `CLAUDE_*_MODEL`) satta via `supabase secrets set` — Edge Functions läser exakt det namnet. Supabase gratisplan pausar projektet efter inaktivitet — återställs i dashboarden.

## Commands

- `npm run dev` — dev server
- `npm run build` — type-check + prod build (genererar PWA service worker)
- `npm run preview` — förhandsgranska prod-build
- `npm run lint` — oxlint
- `npm run foods:migration` — validerar `src/data/genericFoods.ts` (enda källan för kurerade livsmedel/restaurangprodukter) och genererar en ny migration som upsertar hela listan till `food_items`. Kör efter varje ändring i datafilen, sedan `npx supabase db push --linked --yes`

## Arkitektur (filstruktur)

- `src/main.tsx` — entry point
- `src/App.tsx` — router + `QueryClientProvider`, routes: `/` (Hem), `/nutrition`, `/nutrition/calendar`, `/nutrition/saved-meals`, `/profile`, `/admin/feedback` (i `AppShell`) samt `/login`, `/onboarding`
- `vite.config.ts` — plugins: react, tailwind, pwa
- `src/index.css` — Tailwind + design tokens (teal accent `#1D9E75`, makro-färger, surface/ink/border/warning)
- `src/components/layout/` — `AppShell`, `BottomNav`
- `src/routes/` — en fil per toppnivå-sida
- `src/lib/queryClient.ts` — delad `QueryClient`
- `supabase/` — migrations + Edge Functions (`_shared/` för kod som delas mellan flera funktioner, t.ex. matkorrigeringar)

## Effektiv token-användning

- **Kompakteringsinstruktion:** vid `/compact`, prioritera kod-ändringar, filnamn och testresultat. Släpp utförliga förklaringar och gammal chatt-historik.
- **Var specifik i uppgifter, inte "förbättra/städa upp".** Vaga uppdrag ("gör kodbasen bättre") tvingar breda sökningar över hela repot. Peka alltid ut fil(er) och önskat beteende när det går.
- **Undvik att läsa hela loggar/testoutput rakt av.** Filtrera till fel/varningar innan du visar dem i kontext (automatiskt för `npm test`/`npm run build`-körningar via hook).
- **Delegera research/utforskning till en subagent** när du behöver läsa många filer bara för att förstå något (t.ex. "hur hänger X och Y ihop") — låt sammanfattningen komma tillbaka, inte alla enskilda filer.
- **Håll denna fil under ~200 rader.** Detaljerade instruktioner för enskilda arbetsflöden (t.ex. hur en specifik migration ska köras) hör hemma i en skill, inte här — annars laddas de i varje session även när de inte är relevanta.
