# Handoff — 2026-08-28 · Kota case study, senior-portfolio pass

## Brief
Review `projects/kota.html` and propose complementary content so the case reads
at the level of the references (Clay, How&How, masid.design): the three product
visuals stay (video + two interactive dashboards), all on light; the rest of the
page was text-only and needed visual beats. Implement what's relevant.

## Diagnosis
- After the three visuals the page ran **nine text sections in a row** — five of
  them the same three-card grid. Nothing between Challenge/Solution and Ownership
  gave the eye a place to land.
- **"The Product" was six "Placeholder" boxes** under a headline promising screens.
  For a senior hire that reads as unfinished.
- The two dashboards **followed the page theme**, so on a dark page they rendered
  dark. The postMessage that sets their theme fired at page load, before the
  lazy iframes existed, so it was also lost on first paint.
- The strongest narrative asset — the one-sentence brief — was buried in a card.
- The sitemap carried spec vocabulary ("Editor populates · Custodian submits ·
  Reviewer decides"), the exact red flag from the case-study feedback.
- "The Opportunity" block pitched the company ("high-margin contract"); that is
  the founders' story, not hers.

## What changed (all in `projects/kota.html`)
Order now: Hero → Challenge/Solution → **Visuals** (video + 2 dashboards) →
**The Brief** → The People (+ constraint chips) → IA → Method → Navigation
Grammar (+ flow diagram) → **The Discipline of States** (before/after) →
**What Held** → Ownership → Reflection. Section backgrounds alternate.

New, all built in HTML/CSS on the page — no assets to export:
1. **The Brief** — the one-sentence brief set as a pull quote, with the three
   input types as a compact list beneath. Replaces the "Inputs" card grid.
2. **Constraint chips** under The People — replaces the Opportunity/Constraints
   section; keeps the four real constraints, drops the business pitch.
3. **Grammar flow** — three mini screens (table → Details hub → stage-scoped
   actions) above the three rules. Drawn on Kota's own palette, pinned light.
4. **Before / after** for the Customer Review empty state — the D12 episode
   from the authorship audit, which the page did not tell at all. Both states
   are live CSS mockups on Kota tokens (ghost cards shimmer, honours
   `prefers-reduced-motion`).
5. **What Held** — four evidence tiles replacing the placeholder gallery. Text
   values only ("One question", "One grammar", "Two years", "One form"); no
   metric was invented.

Removed: Opportunity/Constraints section, Inputs section, Product placeholder
gallery, the roles line in the sitemap, the empty "Live site —" sidebar row.
Old i18n keys were left in the dictionaries (harmless).

Theme: `tellEmbeds()` now posts **light** to any iframe inside
`.app-shot--kyc` whatever the page theme, and re-posts on each iframe's `load`
so lazy frames never boot dark. Verified in the live browser: both dashboards
report `data-theme="light"` on a dark page.

Copy: every new string has EN + PT-BR entries (checked programmatically —
no key missing). Framing follows the house rules: no "x, not y" definitions,
no invented facts, founder/domain expert unnamed, developer unnamed.

## Verified
- Live Chrome, light and dark: Brief, chips, grammar flow, before/after,
  What Held all render; reveal animation works on the new `.r` blocks.
- `python3 scripts/check-sync.py` → "ok — 4 páginas de case em sincronia".
- Backup of the pre-pass file:
  `scratchpad/kota.before-senior-pass.html` (session scratch).

## Sources used
`product-docs/interview-kota.md`, `product-docs/authorship-audit-kota.md`
(D1, D2, D3, D11, D12), `_case-studies/kota/case-study.md`. References:
how.studio/branding (image-first grid, alternating widths, minimal copy).
masid.design is client-rendered and the Clay case interiors were not
reachable from here; those two were read from known patterns, not fetched.

## Open for Pietra
1. **Hero cover** (`kota-cover.jpg`) still shows the *dark* dashboard on a
   tablet — the one visual not on light. Re-export on light if the rule is
   strict.
2. The "Two years" tile leans on the interview ("quase dois anos"). If the
   real gap differs, that word changes.
3. Straatos opens with a Visual System carousel; Kota has no equivalent.
   A palette/type/icon slide from the Kota tokens would match the house
   rhythm — worth a pass once the screens are exported.
