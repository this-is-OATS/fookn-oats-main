# images/revelator — asset intake spec

Referenced from `revelator.json`. Name by show, not by date. JPG, under 2 MB each.

```
hero/      hero.jpg                  one 2400x1350 render for the page top (also used as og:image → export a 1200x630 crop as hero/og.jpg)
plots/     plot-<show>-<year>.jpg    Vectorworks plot captures, 2400px wide
renders/   render-<show>-<look>.jpg  concept/show renders, 1920px wide, 16:9
ma3/       ma3-<topic>.jpg           grandMA3 show-file screen grabs
```

Resize/compress on the Mac:

```bash
sips -Z 2400 --setProperty formatOptions 82 in.png --out plots/plot-show-2026.jpg
```

## Disclosure (hard rule, see CLAUDE.md)

- Vectorworks captures, renders, and MA3 grabs are the owner's own work product. Tag them `vectorworks` / `plot` / `ma3` in `revelator.json`. No AI stamp needed.
- Anything AI-generated or AI-upscaled MUST have the baked-in `◆ RENDER PLACEHOLDER · AI GENERATED ◆` stamp on the file AND be tagged `ai` in `revelator.json` so the page shows the `RENDER PLACEHOLDER` pill. When unsure, stamp it.
- The video is NOT committed here. Upload it unlisted to YouTube and set `video.youtubeId` in `revelator.json`.
