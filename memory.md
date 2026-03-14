# Mémoire Projet - Promptup

## Informations Clés
- **Projet**: Promptup
- **Type**: Application web d'optimisation de prompts IA
- **Architecture**: Vanilla JS avec Vite, design inspiré de Linear, Cloudflare Pages + `_worker.js`
- **Tech Stack**: JavaScript, HTML, CSS/Tailwind, OpenRouter API

## Fichiers Importants
- `index.html`: page d'analyse principale
- `app.js`: logique d'analyse et réécriture OpenRouter
- `openRouter.js`: catalogue de modèles et client API
- `_worker.js`: proxy same-origin pour `/api`
- `promptAnalyzer.js`: scoring heuristique
- `styles.css`: layout et design system
- `vite.config.js`: build multi-page

## État Actuel
- Déploiement Cloudflare Pages opérationnel
- Réécriture IA via OpenRouter uniquement
- Anciens modules d'IA côté navigateur retirés de l'interface active et du bundle principal
- Navigation: Analyze, Features, Security, Models

## Notes Opérationnelles
- Secret requis en production: `OPENROUTER_API_KEY`
- Commande de build Pages: `npm run build:pages`
- Commande de déploiement: `npm run deploy`