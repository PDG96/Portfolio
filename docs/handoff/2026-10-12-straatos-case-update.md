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
- Who it serves: the two persona cards replaced by ~/Desktop/video case.mov (audio removed) -> assets/straatos/who-it-serves.mp4 + poster.
- Presentation mode: 'Presentation mode' button under Live site in the sidebar (hidden under 900px). Hides nav + sidebar, sheet fills the window, asks for fullscreen; exit with Esc or the faint 'Exit presentation' pill top right.
- Presentation mode propagated to kota, wazi and supply-chain (same button under the meta list, same CSS/JS); the bottom segmented control (.seg) is hidden too while presenting.

## Kota (same session, 2026-10-13)
- Operator / reviewer text block removed under the users video.
- "Who It Is For" header rewritten (EN + PT) as "The problem and the users", since a problem statement and the users follow.
- Problem statement video re-encoded from the full saved version (~/Desktop/Kota/Videos Kota /Problem statement.mov,
  10.97s, no audio, crf 20, 346 KB). The previous 8.3s cut restarted before the white 39% card finished appearing.
  src bumped to ?v=14. Previous file in scratchpad (kota-problem-statement.prev.mp4).
- Kota operator home (assets/kota/operator-home.html), order per Pietra: KPIs, Declared volume + How you score, Your applications, Your file + Open questions (grid rows and DOM order). Links to it carry ?v=3 to beat the iframe cache.
- Operator home: card 'Your file' retitled 'Assessment details'; both Open buttons in Your applications use the default style.
- Operator home, Assessment details: the 'Where the work is' list replaced by a line chart 'Answers over the last 8 weeks' (KYC white, Management systems orange, hover guide + tooltip). Weekly steps are mock and end on the card's counts (15/17, 8/19). Version ?v=6.
- Kota operator Applications page: "What has happened" removed; the table fills the window with blank rows below the
  real ones (fillBlank on draw/resize). Links ?v=2; operator-shell.js includes ?v=2.
- Kota evaluation (bank queue): Review buttons jumped 12px on hover because a comment broke a selector list and
  `.btn-sm:hover` picked up `.tbl{margin:0 -12px}`; selector fixed. Footnote "Five of the six..." removed. Links ?v=3.
- Kota bank home map card: title 'Operators location', subtitle 'Where each operator in the pipeline is based' (no names, other operators can be added); all six operators get pins (orange = submitted file with Details, white = still registering, popup shows stage/progress/location). bank-home links ?v=4.
- Kota bank home: 'Send reminder' buttons removed from the stalled list (Details stays on the live row). Links ?v=5.
- Kota bank home map: all pins identical, orange with the glow; Tulivu's popup still has Details. Links ?v=7.
- Kota bank home: feed names no longer orange links (entry still opens the file); pins smaller (30x33, glow scaled down). Links ?v=8.
- Kota: new section "Data compilation" right after "The prototype, live". It is a copy of the prototype
  (assets/kota-compilation/, independent of assets/kota/) showing the operator's "Your information" form
  (operator-form.html), no seat switch; click opens it full size in the shared overlay. The prototype controller in
  kota.html now drives every .proto-stack on the page (own seat, frame, pages via data-base; single-page stacks via
  data-src/data-title) and a close/reopen race that blanked the overlay is fixed. Header copy (EN + PT) is mine.
  Straatos got this section by mistake first; reverted (section and folder removed).
- Kota Data compilation flow (assets/kota-compilation/ only):
  - operator-home-empty.html (new): the operator's home the day registration is done. Welcome header + "Start
    assessment", KPIs at zero, "Start your assessment" card with KYC (17) and Management systems (19) steps, empty
    "Your applications". Applications in the rail disabled. Copy is mine.
  - operator-form.html: opens empty (registry fields, answers, documents, board, the bank's questions all blank);
    clicking the KYC or Management systems heading fills that group section by section, field by field, back to the
    current state (KYC 15/17, MS 8/19); the bank's questions arrive with KYC. Pill and section notes hidden until
    their group is filled. Home links in the copy point to the empty home.
  - The section in kota.html now opens on the empty home (?v=1); form ?v=4, shell ?v=3.
- Kota assistant (assets/kota and assets/kota-compilation): history button in the panel header (clock icon, count badge) opens a small 'Decision history' popover: Accepted / Dismissed per field with source and date. Entries are mock and static. assistant.js/css ?v=4.
- Kota form (both copies): after an AI-filled answer closes a bank question, the green "Answered" box shows for ~3s
  then folds away; the "✦ From <document>" caption stays and now carries "View in history", which opens the
  assistant with the Decision history popover. "Let Kota read it" renamed "Fill with AI assistant".
  Versions: assistant ?v=5, assist-form ?v=4, operator-form ?v=6, empty home ?v=3.
- Kota reorder (Pietra): The product (title rewritten "The operator fills in one file, and every bank reads the same
  one.", intro updated, EN + PT) now runs low-fi/handover compare -> [AI slot, comment only, content to come] -> bento
  video; then Data collection (was Data compilation, the empty-home/form copy); then Data visualisation (was The
  prototype, live: bank/operator seats, for the analyses). Backup: scratchpad kota.before-reorder.html.
- Kota Data collection: seat switch restored. Bank seat = assets/kota-compilation/operator-detail.html?v=2, opening
  on the Detailed information tab for a just-registered operator (sections 0 answered, Not yet / Not assigned / Not
  started, ring 0%, no comments). Clicking the Review progress card ("Click to fill") fills the rows one by one back
  to today's state (47%, two Needs review, the two comments). Operator seat = the empty home -> empty form.
- Bank seat in Data collection: status pill starts 'Just registered' (muted) and turns 'Review' once the review is filled. operator-detail ?v=3.
- Data collection opens on the operator seat (empty home); the controller now starts each stack on the seat its switch marks.
- Kota (both copies): Ask Kota launcher covered 'Next section'; assistant.css now adds 72px under .main so the last action scrolls clear of it (checked: Next bottom 966 < launcher top 1032). assistant.css ?v=6, form ?v=7, empty home ?v=5.
- Data collection form (kota-compilation only): bank comments removed (asks never restored, pill hidden); 'Fill with AI assistant' hints only show under empty fields after 'Show what's missing'; 'Send updates' disabled until every mandatory field is answered (tooltip says how many are left). Form ?v=8, assist-form ?v=5.
- Disabled 'Send updates' shows a hover tooltip 'Missing mandatory fields · N still empty' (wrapper carries data-tip, since a disabled button gets no mouse events). Form ?v=9.
- Data collection copy: the form is split in two, operator-form.html?group=kyc (default) and ?group=ms; each shows and fills only its own group. Empty home: KYC Start -> kyc form, Management systems Start -> ms form; dashboard and other pages keep both halves. Form ?v=11, empty home ?v=10.
- Data collection form: the left rail now runs as tall as the form (fitRail, capped by the window) and the 'Your file' card sits at its base, aligned with the form's base (checked: both 959px). Form ?v=13.
- Data collection copy, later fixes:
  - Form card height fixed to Registration (fields scroll inside); Back / Next buttons hidden.
  - Assistant crashed on sections not in the split form (fieldOf on a missing section); now skipped, fill works.
  - After the KYC fill only the tax identification number is left (VAT comes in with the fill: 16 of 17).
  - The assistant reads the tax number from "Registration certificate · Tulivu Cooperative SARL" (greeting, chip and
    step copy updated; no Banque Orimu questions mentioned).
  - Empty home: "Your applications" shows Banque Orimu's invitation (Invited, 0%, Today, Start -> KYC form); KPI
    "Banks you applied to 1 · Invited by Banque Orimu".
  Versions: form ?v=17, assist-form ?v=8, empty home ?v=17.
- Data collection copy: the extra 72px under the content for the Ask Kota launcher is reverted (no footer buttons there any more); the Data visualisation copy keeps it, since its Next section button is still there.
- Data collection: Save draft / Send updates keep the form state for the visit (sessionStorage 'kota-comp-kyc' /
  'kota-comp-ms'); returning to a form shows it filled, and the empty home reads it (Your file %, step counts with
  "draft saved" / "sent", application row Draft or Sent with the %, "Continue assessment"). kota.html clears both keys
  on load so every visit to the case starts empty. Form ?v=19, empty home ?v=19.
- Data collection flow: Applications disabled in the rail ('Not available for demo') on every page of the copy; Registration note now 'The tax identification number is the one answer left in this section.'; assistant says 'Fill it from here, or review it on the form.' for a single answer. Form ?v=20, shell ?v=5, assist-form ?v=9.
- Data collection form: card height = max(Registration height, room to the window bottom - 24px), so no empty band under it; footer line hidden while the section note is empty. Form ?v=21.
- Data collection send dialog: title 'Send your updates', subtitle 'The reviewer is notified and reads the file as it stands' (no names); 'Answers changed now' row and the Banque Sefali note removed; toast without names. After sending, Send updates is disabled again ('Updates sent · nothing new to send') until something changes, also when returning to a sent form. Form ?v=22.
- Empty home: a finished step's 'View' is a secondary (ghost) button; the header 'Start assessment' disappears once anything is saved. Empty home ?v=23.
- Kota operator detail (both copies), Insights: the Location map and Trade Relationships now show the same six
  participants. Map sites: Tulivu HQ (Goma), suppliers Matoro (Rubaya, inside the conflict zone), Amani Bethem
  (Kirotshe) and Mweka (Minova), buyers Maki Banga (Goma) and Kandril Components (Gisenyi); flow lines run supplier ->
  HQ -> buyer. In the graph Matoro has a red border and a "Conflict zone" badge, and its card shows Location + Area.
  Conflict popup "1 of 6 · Matoro", Declared sites "6 · 1 in conflict area", shipments key "From Matoro · Rubaya".
  Supplier/buyer locations are mock. All operator-detail links ?v=5.
- Kota operator detail (both copies), Detailed information: rows grouped under KYC and Management systems; the five MS sections added with the operator form's counts (2/4, 2/4, 2/4, 1/4, 1/3 = 8/19), 'Not sent' / 'Not assigned', Review disabled, kept out of the review ring (still 47%). Grid row no longer fixed at 488px. Subtitle 'The sections this desk received, counted'. Links ?v=7.
