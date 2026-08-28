# Handoff — 2026-08-28 · Kota: bento review, dashboard restyle, story screens

## Asked
Review the Kota Bento in Figma (`Projects` › node 1146-202605), bring the
interactive bank dashboard in the case to the same visual style, and propose more
screens on those components — including an operator register/login — that tell
the app's story.

## Read from Figma (MCP)
Variables on the bento: Inter (Text md 16/500, sm 14/400·500, xs 12/400·500);
Gray/900 #101828, Gray/90 #384250 (titles), Gray/70 #6C737F (subtitles, axis),
Gray/500 #667085, Gray/60 #9DA4AE, Gray/200 #EAECF0, Gray/30 #F3F4F6;
KOTA/Primary/70 #E25E25; geekblue/5 #597EF7 · /4 #85A5FF; Success/Warning/Error
50·500·700; chart greens/oranges (green/4 #95DE64, green/8 #237804, volcano/5,
Orange/400). Card = white, radius 8, padding 24, no border; Section header =
title 16/500 + subtitle 14/400 + 20px action; badge = tint bg, radius 16,
pl6 pr8 py2, 8px dot, 12/500; table = th 14/500 Gray/70, td py16 px24, ↗ action.

## Finding that shaped the work
The dashboard's `tokens.css` already carried the same greys and the same orange —
the embeds were built on the same system. The visible gap was **font** (system
stack vs Inter), **card chrome** (1px border + 18/600 title vs borderless 8px +
16/500), **badge/legend geometry** (square swatches, 6px dots) and the table
(icon tiles, uppercase 11px headers). Fixed at the shared level, so both embeds
moved together.

## Changed
- `assets/kota/tokens.css` — `--font` Inter, `--radius` 8, type scale tokens,
  `--title` Gray/90. **Light by default**: the `prefers-color-scheme` block is
  gone; dark only when a host stamps `data-theme="dark"` (the case pins light).
- `assets/kota/components.css` — card, header, badge, legend to the bento spec.
- `assets/kota/business-overview.html` — Inter, KRI table to spec (no icon
  tiles, ↗ row action, 10px bar), Confidence ring → semicircle gauge like the
  bento's, kebab in card headers, cache-busted sheets.
- `assets/kota-kyc-summary.html` — Inter + cache-bust (shares the sheets).
- New `assets/kota/shell.css` — the light app chrome for story screens.
- New screens (all on tokens + components + shell, fictional data):
  `operator-signin.html`, `operator-application.html`,
  `bank-registration.html`, `details-hub.html`.
- `projects/kota.html` — operator pair after The Brief, bank pair after the
  Navigation grammar rules, stacked one per row; captions EN + PT
  (`fig_signin`, `fig_application`, `fig_registration`, `fig_hub`).

## Review of the bento itself → see the published review page (artifact) and
`docs/handoff/` companion; the top items: stat-tile badge detached at 35.6px,
gauge subtitle is template copy, three KRI rows share one ID, treemap/waterfall
greens off-token, score bars are images not components, two cards named
"Declared settlement profile".

## Open for Pietra
- Copy on the new screens is mine; the promise headline ("Apply for banking with
  a record you own.") and the four-stage list mirror the marketing site.
- The Details hub shows evaluation actions "locked" with a plain label; a
  tooltip explaining *when* they unlock would be the next refinement.
- Kota screens are light-only now. If a dark Kota is ever wanted, the
  `[data-theme="dark"]` block still exists and works.

## Follow-up (same afternoon)
- Pietra removed four embeds from the case: the operator KYC summary, sign-in,
  application and Details hub. Left in: bento video, bank dashboard, bank
  Registration table. The removed HTML files stay in `assets/kota/` unreferenced.
- Interactive-embed hint on every `.embed-frame` in `kota.html`: a dark scrim
  with a tapping hand ("Interactive · click and scroll inside") when the frame
  reaches 20% visibility, gone after 2.2 s or on the first pointer / wheel /
  key / touch — plus a small permanent "Live" tag top-right. EN + PT keys
  `hint_live`, `hint_tag`. Kota page only for now; Straatos embeds can take the
  same block if wanted.
- **Wheel anywhere scrolls the sheet** (all four case pages): the shell is a
  fixed frame and `.main-sheet` the only scroller, so a wheel over the sidebar
  or gutters did nothing. A small listener forwards wheel and Space / arrows /
  PageUp-Down to the sheet; the sidebar keeps its own scroll while it can move.
- Gauge bug: the old value ring had been left under the new semicircle — removed.
- Actions wired: dashboard KRI ↗ and card kebabs give feedback via the toast;
  Registration table has live search, Stage / Province chips (× to clear),
  row select with a toast, pager, Invite operator, and an empty state.

## Consistency pass (Pietra's list, same day)
- Risk distribution → the bento's donut (thick filled ring, legend below, dot legend with counts).
- Signal coverage by source: All / Verified / Pending tabs removed.
- Data lineage: links are dashed and flow toward Identity resolution and on to the
  record (`flowdash`, off under reduced motion); zoom stack pinned bottom-right of the card.
- One shell for every Kota screen: the dashboard now uses `shell.css` (K mark, 64px
  topbar, breadcrumbs, bell); same rail set and order as Registration; theme toggle gone.
- Decision buttons: Approve applicant = KOTA orange primary · Approve with conditions
  = default · Reject = alert (red tint). `corrections` state renamed `conditions` (good).
- Modals (shared in `components.css`): Approve, Approve-with-conditions (previews the
  written conditions), Reject (reason + optional note) on the dashboard; Invite operator
  (org, mobile, province, message) on Registration — sending adds an "Invited" row.
  Esc / scrim / × close, focus returns to the opener, aria-modal set.
- Sheets cache-busted to v=4.

## Update 2026-08-28 — Untitled UI icons + revisão completa

**Ícones.** 33 ícones exportados do Untitled UI System (Figma `xD6AThdpPaZJQ8OU6yboqD`, página 3463-407484) para `projects/assets/kota/icons/*.svg`, normalizados (viewBox 24, `stroke="currentColor"`, width 2, sem rects de fundo). `icons/_paths.json` guarda nome → path pra reuso. Todos os `<svg class="ic">` desenhados à mão foram trocados nas 5 telas Kota (business-overview, bank-registration, operator-signin, operator-application, details-hub), inclusive os strings injetados por JS (resultIcon) e os chevrons do stage tracker. `shell.css` `.ic` passou de stroke 1.7 → 2 (spec do sistema). Único que ficou manual: a seta de tendência `+6` (chevron-up não estava no set exportado).

**Revisão UX (achados e correções).**
- `:focus-visible` só existia no business-overview → movido pro `shell.css` (vale pra todas as telas) + classe `.sr-only`.
- Registration: chip "Stage · Registration" mostrava linhas Invited / Ready for evaluation → renomeado "Stage · Before evaluation"; chip Province mostra o valor ("Province · North Kivu"); toasts ajustados.
- Registration: header vazio da coluna de ação recebeu `<span class="sr-only">Open</span>`.
- Auditoria via JS em ambos os dashboards: 0 botões sem nome acessível, 0 inputs sem label, dialogs com role/aria-modal/aria-labelledby, sem overflow horizontal, fonte Inter em 100% dos nós.
- Verificado no navegador: invite modal, approve with conditions (subform → modal com preview), reject modal (reason + nota), Esc fecha e devolve foco.
- Signal coverage by source: as barras não renderizavam (`.bar` era `<span>` inline, altura 0) → `display:block`. Bug estava lá desde a remoção das tabs.
- Cache-bust dos CSS → `?v=5`.

Nada commitado.

## Update 2026-08-28 (tarde) — ajustes finos + publicação
- Confidence score: gauge centralizado, texto menor embaixo (coluna única); número desceu pra dentro do arco.
- Data lineage: tiles de origem com largura fixa 190px (bordas direitas alinhadas às linhas).
- Decisão: botões sem ícone; subform de condições começa vazio com placeholder claro; confirmação vira "Send conditions" (uma linha).
- Tooltips em todos os gráficos: gauge, donut (fatia destaca no hover), linha (mês + os dois valores, guia vertical), barras e sparklines da KRI, coverage. Engine única em `.tip` + `data-tip`.
- Registration: chips de filtro removidos (só busca).
- Case Kota: vídeo do bento agora na largura total, igual aos dashboards.
- Landing: Get in touch redesenhado (duas colunas, e-mail como CTA, lista com régua). Sem `connect_p3`; chaves novas `connect_eyebrow`.
- Commit `1ae987f` em main → deploy Cloudflare Pages.
