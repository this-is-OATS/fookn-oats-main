# FOOK'N OATS — fookn-oats.enterprises

Live site deploys from `main` via Vercel. Every push to main goes live in ~1 minute.

## HARD RULES

- **ALWAYS bump the version number on EVERY push.** No exceptions. Bump BOTH:
  1. `site.js` → `SITE.version`
  2. `index.html` → `<span id="nav-version">` fallback
  Format: `v2.6.3 · 2026.07.06` (patch bump + today's date). The badge is how the owner verifies a deploy landed.
- Production changes go to `main`. Feature branches don't deploy.
- Show diffs and get confirmation before pushing copy/content changes, unless explicitly told to deploy.

## Source of truth (what actually renders)

- `index.html` — the SPA. Inline JS data arrays: `DEPARTMENTS` (services), `BRANDS`, `SECTIONS`, home copy, detail pages. Meta/OG tags.
- `ticker.json` — the live ticker text. NOT site.js.
- `site.js` — `SITE.version`, `about.paragraphs`, `about.tree`. Its `services`/`brands` arrays are NOT rendered by the live site — don't write copy there.

## Content workflow

Notion "FOOK'N OATS — Site Content Engine" database drives copy via `/interview` and `/deploy-from-notion` commands (see `.claude/commands/`).

## Brand voice

Professional but not corporate. First person, active voice, short sentences, no agency-speak, no generic taglines. Identity: "Imagination Creation Station" — Kenosha HQ, versatile space, creation-led (not touring-for-hire framing).
