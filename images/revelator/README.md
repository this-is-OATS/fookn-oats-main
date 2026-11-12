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

## Plot export spec (for the Mac / Vectorworks)

Detail crops are not plots. The page needs full sheets a lighting vendor would recognize.

**Export from Vectorworks, not a screen grab.**
- Open the sheet layer for the plot. `File → Export → Export Image File` (or `Publish` to PDF, then rasterize).
- Whole sheet: plan, section if there is one, legend, truss and motor callouts all on the page and readable.
- Width **2400 px** minimum, long edge up to 3600 px. JPG quality ~85, under 2 MB. Landscape.
- White background. Line weights as printed. Do not export with the dark Vectorworks UI theme.

**Attribution lives in the caption, not the sheet.**
- If the title block names another designer, vendor, or client, crop the title block off or cover it with a flat rectangle before export. Do not blur; blur reads as hiding.
- The caption in `revelator.json` carries the honest line, e.g.
  `"Merged co-headline plot, fall 2017. Design by the production's LD; drafting and rigging paperwork by me."`

**Naming**
- `plots/plot-<show>-<year>.jpg` for the sheet. Add `-s2`, `-s3` for extra sheets of the same show.
- `renders/render-<show>-<look>.jpg` for any previz render of the same rig. Tag `vectorworks`.

**How many**
- One or two real sheets beat ten snippets. Start with the strongest single show, then add.

**Wire-up**
- In `revelator.json` under `work`, the entry gets `"plot": "/images/revelator/plots/plot-<show>-<year>.jpg"` (single sheet) or `"plots": [{"src","caption","tag":"plot"}]` (several).
- When at least one full sheet is in, set `work.hidden` to `false`. Section reappears.
