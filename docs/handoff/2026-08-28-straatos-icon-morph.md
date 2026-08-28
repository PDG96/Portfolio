# Handoff — 2026-08-28 · Straatos icon morph (GIF in the Visual System carousel)

## What shipped
- `projects/straatos.html`: fourth slide in the Visual System carousel
  (`.id-car-slide--morph`), after the icon set. Two GIFs, swapped by theme so the
  loop sits on the page's own ground: `assets/straatos-icon-morph.gif` (light,
  #fbfaf8) and `assets/straatos-icon-morph-dark.gif` (dark, #141414). 600×600,
  200 frames, 25 fps, ~0.9 MB each, infinite loop. Icon fixed in the centre —
  no route travel (Pietra's call).
- Sequence: Monkey → Ladybug → Caterpillar → Crab → back. Hold 1.1 s, morph 0.9 s,
  spring overshoot 0.35 on the body.

## How the frames are made (no in-betweens drawn)
Engine in session scratch: `morph_export.py` (geometry) + `morph_gif.py`
(raster). Each stroke of the exported Figma path is resampled to 56 points;
the longest strokes covering 62% of an icon's length are the **body** and morph
point-to-point into the neighbour's body; the rest are **details** and shrink
into their own centre while their stroke width goes 2 → 0 (incoming ones grow
0 → 2). No opacity anywhere — Pietra rejected the dissolve. Sequence order was
chosen by topological similarity of neighbours.

## Also delivered
- `~/Desktop/icon-morph-svg/` — per transition, five SVGs (A, 25, 50, 75, B)
  with identical layer structure (`body`, `details-out`, `details-in`, same ids,
  same point count) for Jitter keyframes. Geometry linear in t; easing in Jitter.
- `~/Desktop/icon-morph-preview.html` and the artifact
  https://claude.ai/code/artifact/2b1fe024-e4d8-4080-a221-c32db3386099 — live
  preview with sliders (hold / morph / overshoot / travel / details mode).
- GIF copies on the Desktop.

## Open
- Crab → Monkey (the loop's return) is the busiest transition: two big
  strokes into one. A bridge shape would smooth it if it bothers.
- If the GIF ever reads soft on retina, the same engine can run inline as SVG
  on the page (crisp at any DPI, theme-aware) — the preview already is that.

## Follow-up (same day)
- Morph tightened to 0.6 s (hold 1.0 s); partnerless body strokes now tween their
  width so no full-weight dot rests on an icon during a hold (was visible on the
  monkey's forehead and mouth). Applied to GIF, SVG export and preview alike.
- Carousel trimmed on Pietra's call: the type-specimen overlay came off the
  flamingo video and the static icon-set PNG slide was removed. Order is now
  palette → video → morph. `straatos-icons.png` and `straatos-typography.png`
  stay in assets, unreferenced.
- Flamingo video slide removed as well (Pietra). Carousel is now palette → morph.
  `straatos-flamingos.mp4` stays in assets, unreferenced.

## Screens-wall flyover (added 2026-08-28, afternoon)
- `assets/straatos-screens-wall.mp4` opens the Application section, before the
  globe. Source: Pietra's 7 s Figma-canvas pan (1082×604). It is one-way, so the
  file is **ping-ponged** (forward + reverse, 14 s) to loop without a cut.
  30 fps, CRF 24, no audio. Caption key `fig_wall`, EN + PT.
- Same `.app-shot--video .video-frame` treatment as Kota's bento video.
