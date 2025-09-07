## Space Guilds — AI Contributor Guide (Claude/LLM CLIs)

This document orients AI coding assistants to the Space Guilds prototype so you can contribute safely and efficiently.

### Project Overview

- Mobile-first, text/ASCII space exploration game (static web app).
- Core files: `index.html`, `style.css`, `game.js` (monolithic game logic), assets in `/assets`.
- Design docs: `README.md`, `RESOURCE_SYSTEM.md`, `exploration-system.md`, `docs/scanner_and_navigation_design.md` and others.

### Tech Stack

- Pure HTML/CSS/JavaScript, no framework or bundler.
- Static hosting on Vercel.
- Local dev served by `http-server` via npm scripts.
- Persistence via `localStorage` with migration logic in `game.js`.

### Run, Build, Deploy

- Local run: `npm install` then `npm run dev` (serves at `http://localhost:3000`).
- No build step; everything loads directly from the repo.
- Production hosting: Vercel, project is configured as a static site.
- Production URL: https://space-guild.vercel.app/
- GitHub repo: https://github.com/sbharri2/space_guild
- Production branch: `main` (all production deployments come from `main`).
- Previews: every non-main branch auto-deploys to a unique Preview URL (may be protected/401).

### Vercel Configuration Notes

- `vercel.json` serves the entire directory via `@vercel/static`.
- Cache headers: `Cache-Control: public, max-age=3600`. Bust caches by bumping query strings like `?v=...` on assets.
- Redirect: `/favicon.ico` → `/favicon.png`.
- Known pitfall: do not mix top-level `routes` with `headers`/`redirects`. If needed, prefer `redirects`/`headers` only for static sites.

### Repository Map

- `/index.html` — HTML shell, runtime manifest injection, dev menu, energy metrics snippet.
- `/style.css` — mobile/terminal styling.
- `/game.js` — all gameplay logic, UI rendering, input handling, save/load migrations.
- `/assets/` — images for ships/mockups.
- `/docs/` — design docs (scanner/navigation design).
- `vercel.json` — static hosting config.
- `manifest.json` — PWA metadata (loaded at runtime via script in `index.html`).
- `claude.md` — this guide.

### State & Persistence

- Global `gameState` in `game.js` holds UI, player, galaxy, resources, NPCs.
- Save key: `localStorage['spaceGuildSave']`.
- Save/load includes migration (`migrateSaveData`) for backward compatibility (Maps/Sets serialization handled).

### Development UX

- Dev menu button (gear icon) exposes utilities: add AP, teleport, regenerate systems/resources, tile-state tools, profiling, animation toggle.
- Tile-state “paint” mode supports marking scanned/visited/claimed.
- Scanner system planned; see `docs/scanner_and_navigation_design.md`.

### Coding Guidelines

- Keep changes minimal and surgical; avoid broad refactors of `game.js` unless explicitly requested.
- Match existing style and naming. Prefer clear function/variable names over cleverness.
- Do not introduce build tooling; remain framework- and bundler-free.
- If adding new files, place them where obvious (e.g., small helper modules near `game.js` or within `/docs` for docs).
- Avoid mixing unrelated changes in one commit.

### Contribution Workflow (AI CLIs)

- Start by outlining a short plan; implement in small, verifiable steps.
- Validate locally when possible; for deployment changes, note exact Vercel steps.
- When editing assets or static files, remember cache-busting query params in `index.html`.
- Preserve save/migration behavior; never break existing local saves.

### Performance Constraints

- Mobile-first target, aim for 60fps but tolerate 30fps on low-end devices.
- Heavy loops or frequent DOM reflows in `game.js` should be avoided; batch updates where possible.
- Energy metrics HUD exists for profiling; can remain disabled by default.

### Testing & QA

- No formal test suite; rely on manual smoke tests:
  - Load on iOS Safari and Android Chrome.
  - Move ship, open dev menu actions, verify localStorage persistence on reload.
  - Try system/resource generation, tile-state toggles.

### Assets & Cache Busting

- Static assets served at root and `/assets`.
- Bump query strings (e.g., `style.css?v=YYYYMMDDx`, `game.js?v=...`) when modifying.
- Icons present: `/icon-192.png`, `/icon-512.png`, `/favicon.png` (with `/favicon.ico` redirect).

### Deployment Policy

- All game updates deploy via Vercel from `main`.
- Every push to `main` triggers a Production deployment.
- Pushes to other branches create Preview deployments.
- Rollbacks: use Vercel “Promote to Production” on a previous deployment.

### Security & Privacy

- No secrets/keys. Client-only app. Do not add privileged endpoints.
- Be mindful not to collect PII; optional analytics should be privacy-friendly if added later.

### Common Tasks (Quick How-Tos)

- Update UI styling: edit `style.css`, bump `?v=` in `index.html`.
- Add dev menu item: update HTML in `index.html` and implement handler in `game.js`.
- Adjust AP logic or movement: see navigation handlers around `gameState` usage in `game.js`.
- Modify resource system: edit constants/functions in `game.js` and align with `RESOURCE_SYSTEM.md`.
- Deployment tweak (Vercel): modify `vercel.json`, push to `main`, redeploy in Vercel if needed.

### Pointers to Design Docs

- Resource System: `RESOURCE_SYSTEM.md`
- Exploration/Warp System: `exploration-system.md`
- Scanner & Navigation: `docs/scanner_and_navigation_design.md`

### Contacts

- Owner: `sbharri2` (GitHub)

## Git Repository Setup & Access

### Repository Information
- **Repository URL**: https://github.com/sbharri2/space_guild.git
- **Main Branch**: main
- **Test Branch**: test-preview

### Initial Setup (for new workstations)
```bash
git init
git remote add origin https://github.com/sbharri2/space_guild.git
git fetch origin
git checkout -b main origin/main --force
```

### Common Git Commands
```bash
# Pull latest changes
git pull origin main

# Push changes
git add .
git commit -m "commit message"
git push origin main

# Switch branches
git checkout main
git checkout test-preview
```

### Known Issues on Windows
- Repository may contain Zone.Identifier files that cause checkout issues
- Solution: `git config core.protectNTFS false` before checking out
- These files can be safely deleted as they are Windows metadata files

### Project Structure
- **Main game file**: game.js (350+ KB)
- **UI/Layout**: index.html
- **Styling**: style.css
- **Assets**: /assets directory (ships, resources, space objects)
- **Documentation**: Multiple .md files for game systems
- **Configuration**: manifest.json, package.json, vercel.json

