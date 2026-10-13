# Straatos case: update to the new Figma structure (2026-10-12)

Source of the structure: Figma Projects, page "Claude ler aqui", frame 1822:331382
https://www.figma.com/design/9DY7VhRuE0omc12GRJMQi4/Projects?node-id=1822-331357

Local only, nothing committed. Previous version of the page: scratchpad copy `straatos.before-update.html`
(also recoverable with `git diff projects/straatos.html`; HEAD does not have the deck draft block either).

## Page order now (projects/straatos.html)
Hero (unchanged) > The challenge > Who it serves > Process · swimlane > Visual identity > Navigation >
Data gathering > Project monitoring > Next steps.

Removed from the page: old Challenge/Solution block, the "What the deck adds" draft, the identity carousel
(palette, flamingos + type, icons) and the Application section (analysis bento, phone + polygon, simulation bento).
The calculations video block was kept and moved into Project monitoring. CSS for the removed parts is still in the file.

## Assets (projects/assets/straatos/)
- who-field-technician.webp, who-project-developer.webp, visual-identity.webp, data-new-project.webp,
  data-sampling-plot.webp, submission.webp: from ~/Desktop/straatos PNGs, WebP q86.
- swimlane.png: 2x export of Figma node 1822:331411.
- screens-tilt.mp4 (+ poster): ~/Desktop/Screen Recording 2026-10-12 at 22.21.03.mov, 1600 wide, h264, no audio.
- challenge-poster.webp: poster of the Figma video fill (1822:331387). The video file itself cannot be pulled through the Figma MCP.

## Navigation demo
`assets/straatos-nav/index.html?embed`: no controls, transparent ground, dark bezel, stage centred and scaled to the iframe.

## Open for Pietra
1. Challenge video: send the file; the poster is a placeholder (TODO in the HTML).
2. Labels: Figma has "Project submission" over the tilted screens + calculations and "Project monitoring" over the
   submission screen. The page swaps them to match the screens. Confirm.
3. Copy I wrote (Figma had Lorem or a duplicated subtitle): challenge subtitle, Data gathering, Project monitoring,
   Project submission headings and subtitles. Built from the deck notes and the screens, no new facts.
4. Visual identity: kept "Visual system / Visual identity", no subtitle.
5. Not verified: video playback (automation tab did not load media) and phone width (window would not resize).

## Change (same day)
Per Pietra, "Project submission" became **Next steps**: offline app for the field technician and automatic
submission to Verra (copy is mine, written as future work). The submission screen was then removed from the section (Pietra), so Next steps is text only.

## Visual identity, live components (same day)
- Image split: `assets/straatos/visual-identity-top.webp` (palette + icons, cropped from visual-identity.webp).
- Below it, `assets/straatos-identity-bento.html` (iframe, 1280 x 698, same scaled-embed script): salinity
  (smooth-line), indicators (indicator-stack), emissions (area-comparison) reuse /components and the existing
  straatos-charts JSON. Events Timeline is new inline code; block counts and the resting tooltip follow the Figma,
  hover titles/dates/activity types are mock data.
- New Project card: dashed "Card pending" placeholder until Pietra sends it.
- Not verified animated: the automation tab reports visibilityState hidden, so charts freeze mid-animation there
  (the old analysis bento does the same in that tab).
- Icon bar is now an infinite marquee (HTML/CSS, `.icon-marquee` in straatos.html): same rectangle proportion as the
  Figma bar (2530 x 171), 16 icons from ~/Desktop/straatos/icons copied to assets/straatos/icons/01-16.png, set printed
  twice, 48s linear loop, edge fade, stops under prefers-reduced-motion. Palette image is now visual-identity-palette.webp.
- New Project card placed (was "Card pending"): ~/Desktop/straatos/New Project.png -> assets/straatos/new-project-card.webp,
  scaled so its card body (1446 x 2806 in the PNG) lands on the tile edges.
- Data gathering: first image replaced by `assets/straatos-data-gathering.html` (Pietra's new layout): laptop with
  New Project drawer bleeding off the left edge of the sheet, New Document tilted -8deg, Comments below. Pieces reused
  from straatos-bento2/ (pc, document, comments) with the same hover. Note: comments.png is the older version (reply
  shown as a "Me" bubble, no "Life on land" subtitle); the layout screenshot shows the reply still in the input.
  The sampling plot image stays below it.
- Events Timeline tooltip now uses the shared ChartTooltip (render + domStyles), same type and box as salinity and emissions.
- Challenge section: poster image removed per Pietra (section is header only; video no longer pending).
- Events Timeline month labels now match the chart axis labels (11px, rgba(20,20,20,.55)).
- Space between case sections halved on this page (.main-sheet .case-section padding = --section-py / 2).
- Events Timeline: tooltip only on hover (no resting tooltip), vertical guide line behind each month.
- Data gathering composition: Comments card enlarged (27% -> 34% width, top 55%) so the thread is legible.
- Section label 'Project monitoring' renamed 'Data visualisation' (Pietra).
