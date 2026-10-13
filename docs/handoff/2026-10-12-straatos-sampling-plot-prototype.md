# Sampling plot form, click-to-fill prototype (2026-10-12)

`projects/assets/straatos-sampling-plot/index.html` (local only, not in the case page yet).

- Base: Pietra's SVG `~/Desktop/straatos/04 · Sampling Plot · Identification (Edit, from the live app).svg`, copied as
  `base.svg`. Its text is outlined and it comes filled (dropdown open), so the form column (x 530-1210) is painted
  over and rebuilt in HTML at the SVG coordinates and colours (read from its rects and path fills). Map, comment
  icons, header, sidebars stay from the SVG. Stage 1440 x 1256 (the SVG's last row is stretched 20px so the Year box
  is whole).
- One click: a cursor fills Project region, ticks Plot SL003 + Plot SL012 (tags), Planting cycle, Technical partner,
  picks the year, clicks Save; a "Changes saved" toast shows (toast copy is mine). Click again to replay.
- Values = the SVG's own (Saloum, SL003 + SL012, Saloum Cycle 03, FSC NGO, 2026). Other options in the lists are mock.
- URL: `?autoplay`, `?nohint`, `?fast` (testing). Respects prefers-reduced-motion.
- Not seen animating: the automation tab is hidden, so timers stall there. Static states were checked against the SVG.

## Gap removed (same day)
The SVG leaves 140px under "Associated operational plots" for its open dropdown. Everything below it in the main
column is now shown 140px higher through a window onto the same SVG (`.lower`, SVG y 700+ drawn at 560). Rows moved:
Planting cycle 584, Technical partner 656, Perimeter 728, Year 1068. Stage is now 1440 x 1120; the base image is
clipped in the main column at 1100 so the old map edge does not bleed at the bottom. The dropdown now opens over the
rows below it. Previous version: scratchpad sp-index.bak.html.

## Save, view mode and sources (same day)
- Country / Region / Province are now normal selects filled by the cursor (Senegal, Fatick, Foundiougne).
- Perimeter: the cursor clicks the four corners of the SVG polygon (841,999.5 / 871.5,999.5 / 874,1042 / 826.5,1033.5)
  and closes it on the first; the map is the SVG's own image (map.jpg, extracted) so the baked polygon is gone.
- After save: save button disabled, toast "Subject updated successfully" (wording mine, style from the Handover toast).
- ✕ (real click) -> view mode, model from Handover page "Handling data received from external sources"
  (node 2774:166439): sources button (OWN badge + chevron, teal border), submit (teal), edit; values as text;
  "> Edit" dropped from the breadcrumb.
- Sources dropdown (real click): Own Data (saved by you, Straatos) and FSC NGO (implementing partner, Kobo, mock
  version: Plot SL003 only, Saloum Cycle 02, 2025, slightly different perimeter). Switching highlights what differs.
- Edit button = start over.
- Comment icons lightened (white veil at 45% over their column). Fill pace SPEED = 0.6 (about 40% faster).
- Leaving edit mode now animates: teal load bar under the header, skeleton lines where values go, map dims and comes
  back, values rise in one by one (45ms stagger).
- Sources: "Saved by you · Straatos" on one line; implementing partner renamed to "Coastal Roots Initiative" (mock,
  Pietra found FSC NGO bad there). The Technical partner field still reads FSC NGO, as in her SVG.
- Technical partner = "Coastal Roots Initative" (misspelt on purpose) in the developer's version; the partner's Kobo
  version is identical except "Coastal Roots Initiative", with a partner-only comment on that row (red "1" badge,
  popover: "Fixed the spelling of our name. "Initative" was a typo."). Comment copy and names are mock.
- View mode comment icons are plain bubbles (no "+").
- In the case: Data gathering, replacing data-sampling-plot.webp. `index.html?embed` in a 700px-tall frame
  (`.sp-frame`): stage fills the width, the iframe scrolls, the view follows the cursor, the hint is pinned to the
  bottom of the frame.
- Fields removed (Pietra): Region, Associated operational plots, Technical partner. Rows now Country 224, Province
  296, Project region 368, Planting cycle 440, Perimeter 512 (map 512-812), Year 852; stage 1440 x 904; the SVG
  window shows SVG y 844+ at 488. The partner's corrected-name difference and its comment are parked
  (PARTNER = {}, cm-icon/cm-pop no longer opened) until Pietra defines the new approach. Previous versions in
  scratchpad: sp-index.before-remove.html, sp-index.before-partner-removal.html.
- Sources button: neutral at rest (grey border, grey chevron); teal border + chevron only while open.
