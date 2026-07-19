# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Träningsapp

## Projektbeskrivning
En tränings- och kostapp byggd som en PWA (Progressive Web App),
installerbar på mobilen. Ingen inloggning – all data sparas lokalt
på enheten.

## Tech-stack
- React + Vite + TypeScript
- vite-plugin-pwa för PWA-funktionalitet (manifest, service worker, offline)
- Lokal lagring (IndexedDB/Dexie.js) – ingen backend eller molnsynk

## Konventioner
- TypeScript föredras framför JavaScript
- Funktionella komponenter med hooks
- (fyll på efterhand som ni bestämmer mer)

## Project status

React + TypeScript + Vite is scaffolded and running as an installable PWA (`vite-plugin-pwa`), with Dexie installed for local storage. `src/App.tsx` is currently a placeholder that just renders "Träningsapp" to confirm the setup works. No database schema or app features exist yet.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check (`tsc -b`) and build for production (also generates the PWA service worker)
- `npm run preview` — preview the production build locally
- `npm run lint` — run oxlint

## Architecture

- `src/main.tsx` — entry point, mounts `App` into `#root`
- `src/App.tsx` — root component (currently a minimal placeholder)
- `vite.config.ts` — Vite config; registers `@vitejs/plugin-react` and `vite-plugin-pwa` (PWA manifest: name "Träningsapp"; app icons are not set yet — TODO)
- Dexie is installed but no database schema has been defined yet — add a `src/db.ts` (or similar) with a `Dexie` subclass when persistence is needed
