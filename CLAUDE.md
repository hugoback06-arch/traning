# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Träningsapp

## Projektbeskrivning
Kost- och träningsapp (webbapp/PWA, mobil-först). MVP = kost-spårning: onboarding med auto-beräknat kalori-/makromål, dagsöversikt, kalender, tre loggningssätt (sökning, streckkod, fotoanalys), måltidshistorik, profilinställningar. Fullständig spec: `app-spec-mvp.md`.

Träningsspårning (Strava, AI-tränarschema) är **inte** med i MVP.

## Tech-stack
- React + Vite + TypeScript, react-router, @tanstack/react-query
- Tailwind CSS v4 (`@tailwindcss/vite`, tokens i `src/index.css` via `@theme`, ingen config-fil)
- vite-plugin-pwa (manifest, service worker, offline)
- **Supabase** (Postgres + Auth + Edge Functions): magic-link login, RLS per användare
- Open Food Facts API (publik, ingen nyckel) för sökning/streckkod
- Claude API (vision) för fotoanalys, via Edge Function `supabase/functions/analyze-meal-photo` (håller `ANTHROPIC_API_KEY` server-side)
- `barcode-detector` (native + WASM-fallback för Safari/iOS)
- Dexie installerat men **oanvänt** (relik från tidigare lokal-first-idé) — kan tas bort ur `package.json`

## Arkitekturbeslut
Ursprungligt scaffold var lokalt (IndexedDB/Dexie, ingen auth). Nu gäller istället Supabase-arkitekturen i `app-spec-mvp.md`, med Edge Function som proxy för Claude vision-anrop. Fullständigt planeringsdokument: `/Users/hugoback/.claude/plans/groovy-booping-neumann.md`.

## Konventioner
- TypeScript, funktionella komponenter med hooks
- (fylls på efterhand)

## Status
Router, Tailwind och app-skal (`AppShell`/`BottomNav`) med platshållarsidor finns på plats. Nästa steg: Supabase-projekt, schema, auth.

## Commands
- `npm run dev` — dev server
- `npm run build` — type-check + prod build (genererar PWA service worker)
- `npm run preview` — förhandsgranska prod-build
- `npm run lint` — oxlint

## Arkitektur (filstruktur)
- `src/main.tsx` — entry point
- `src/App.tsx` — router + `QueryClientProvider`, routes: `/`, `/calendar`, `/add-meal`, `/profile` (i `AppShell`) samt `/login`, `/onboarding`
- `vite.config.ts` — plugins: react, tailwind, pwa
- `src/index.css` — Tailwind + design tokens (teal accent `#1D9E75`, makro-färger, surface/ink/border/warning)
- `src/components/layout/` — `AppShell`, `BottomNav`
- `src/routes/` — en fil per toppnivå-sida
- `src/lib/queryClient.ts` — delad `QueryClient`
- `supabase/` — migrations + Edge Functions