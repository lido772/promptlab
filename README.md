# Promptup

Promptup is a multi-page Vite application for prompt analysis and AI-assisted rewriting. It scores prompts instantly in the browser, then uses OpenRouter through a same-origin Cloudflare Pages proxy when the user asks for a rewrite.

## Features

- Instant heuristic analysis with detailed score breakdowns
- Optional AI rewriting via OpenRouter
- Cloudflare Pages deployment with `_worker.js` proxying `/api`
- Multi-page marketing/navigation flow: Analyze, Features, Security, Models
- Geist Sans and Geist Mono typography with responsive layout

## Quick Start

1. Install dependencies with `npm install`
2. Start local development with `npm run dev`
3. Build production assets with `npm run build:pages`
4. Deploy with `npm run deploy`

## Deployment

Production is designed for Cloudflare Pages.

- Build command: `npm run build:pages`
- Output directory: `dist`
- Required secret: `OPENROUTER_API_KEY`
- Worker entry copied to `dist/_worker.js`

## Key Files

- `index.html`: main analyzer page
- `app.js`: prompt analysis and OpenRouter rewrite flow
- `openRouter.js`: model catalog and request client
- `_worker.js`: same-origin API proxy for Pages
- `promptAnalyzer.js`: heuristic scoring engine
- `styles.css`: design system and layout
- `vite.config.js`: multi-page Vite build

## Notes

- Browser-side legacy AI runtime features are intentionally removed from the active product surface.
- The app is English-first in the current runtime, with shared i18n strings still available.
