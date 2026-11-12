# Revelator Illuminae — Cowork handoff packet

For a Cowork / local Claude Code session on the Mac with NAS access. Read `CLAUDE.md` first. Hard rules apply: bump the version in BOTH `site.js` and `index.html` on every push; stamp and pill every AI image; nothing to `main` until the owner says "ship it".

## State on arrival

Branch `claude/serene-curie-ikqp1f` (pushed) at `v2.9.12 · 2026.11.12`. Start there:

```bash
git fetch origin claude/serene-curie-ikqp1f
git checkout claude/serene-curie-ikqp1f
```

Already done, tested at 1400px and 390px, no console errors:

| File | What |
|---|---|
| `revelator.html` | Standalone page at `/revelator`. Reads `revelator.json`. Sections with empty data hide themselves. |
| `revelator.json` | Every word on the page. Draft copy for hero, is/isn't, offer, process, billing, contact. `_owner_todo` fields mark what's missing. |
| `images/revelator/README.md` | Asset naming, sizes, disclosure rules. Folders `hero/ plots/ renders/ ma3/` exist. |
| `index.html` | `BRANDS[1]` links to `/revelator`. Version badge bug fixed. |
| `.claude/commands/deploy-from-notion.md` | BRANDS index mapping corrected. |

Nothing to redesign. The job left is assets, owner's words, and wiring them into the JSON.

## Step 1 — ask the owner (one message, all at once)

1. NAS mount path, and the folders holding Vectorworks captures, concept renders, MA3 screen grabs, and the walkthrough video.
2. For each image: Vectorworks capture / real render / MA3 grab / photo / AI-generated or AI-upscaled. Unsure means stamp it.
3. Which shows are **Designed** (owner held the design credit) vs **Programmed / Supported**. ODESZA, Pretty Lights, Royel Otis in `tour-history.md` are SuperTech-side unless he says otherwise. Never list a design credit he didn't claim.
4. Go4oats.vizzies: what it is and its URL. No URL means drop it from `revelator.json` and from the `BRANDS[1]` desc + bullets in `index.html`.
5. Billing shape: flat fee per show, per tour, retainer, or other.
6. Ten-minute MA3 interview (Step 3).

## Step 2 — assets

Copy and resize into `images/revelator/`. JPG, under 2 MB, named by show not date.

```bash
# plots 2400w, renders 1920w, hero 2400x1350, og crop 1200x630
sips -Z 2400 --setProperty formatOptions 82 IN.png --out images/revelator/plots/plot-<show>-<year>.jpg
sips -Z 1920 --setProperty formatOptions 82 IN.png --out images/revelator/renders/render-<show>-<look>.jpg
sips -Z 2400 --setProperty formatOptions 82 IN.png --out images/revelator/hero/hero.jpg
sips -Z 2400 --setProperty formatOptions 82 IN.png --out images/revelator/ma3/ma3-<topic>.jpg
```

AI images: bake the stamp onto the file before committing (ImageMagick):

```bash
magick IN.jpg -gravity south -fill '#ffb400' -undercolor '#000000B0' -font 'IBM-Plex-Mono-Bold' -pointsize 28 \
  -annotate +0+24 ' ◆ RENDER PLACEHOLDER · AI GENERATED ◆ ' OUT.jpg
```

Then tag that file `"ai"` in `revelator.json` so the page shows the pill. Tag truthful work `vectorworks`, `plot`, `ma3`, or `photo`.

Export a 1200x630 crop of the hero as `images/revelator/hero/og.jpg` and replace both `og.png` URLs in `revelator.html` `<head>` with `https://fookn-oats.enterprises/images/revelator/hero/og.jpg`. Set `meta.ogImage` in the JSON to match.

Do not commit the video. Owner uploads it unlisted to Go4Oats / A.I. Oatmeal; put the 11-char id in `video.youtubeId`, plus `title` and `caption` (what it walks through, length).

## Step 3 — MA3 systems interview

Ask, record answers verbatim, then draft `ma3.intro` and `ma3.points` in his words. Questions:

- How is a show file structured when you start one? Pools, pages, layouts, what's where.
- Naming conventions: groups, presets, sequences, executors, worlds.
- What does a sub need in the first ten minutes to run it cold?
- What do you refuse to do in a file, and why.
- What's the one thing in your files other programmers notice.

Do not invent system names. `ma3.images[]` entries: `{"src":"/images/revelator/ma3/ma3-<topic>.jpg","caption":"...","tag":"ma3"}`.

## Step 4 — fill `revelator.json`

- `hero.image` → `/images/revelator/hero/hero.jpg`, `hero.imageTag` truthful.
- `work.designed[]` / `work.supported[]` entries:
  `{"artist","event","year","role","line","plot","render","plotTag","renderTag"}`
- `vizzies.url` + `text`, or leave empty to hide.
- `billing.text` to match his answer.
- Delete the `_owner_todo` keys when done.

## Step 5 — test

```bash
python3 -m http.server 8765
```

Open `http://localhost:8765/revelator.html` on desktop and a 390px viewport. Check: every image loads, every AI image shows both the baked stamp and the pill, video plays, form sends (it posts to the live Formspree id, so send one real test and tell the owner), version badge shows the new number, no horizontal scroll.

## Step 6 — ship

1. Show the owner the page and the full `git diff`.
2. Bump `site.js` `SITE.version` and `index.html` `<span id="nav-version">` to the next patch + today's date.
3. Commit, push to the branch.
4. Merge to `main` only on "ship it". Vercel deploys in about a minute; confirm the badge on the live site.
