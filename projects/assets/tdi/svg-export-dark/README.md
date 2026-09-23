# TDI · SVGs em dark mode (para o Figma)

Gerados a partir do protótipo `../tdi-flow-map.html` com `data-theme="dark"` e
accent roxo, layout travado em 1440px (rail 56 + sidenav 250 + main 1134), pelo
script `../export-png-dark.js`, que injeta o conteúdo exato da composição
`image 8.png` da Pietra (21/set): a cadeia do Flow Overview (Nikola → LGES → CATL
→ Umicore → Huayou → Jinchuan / Umicore → Ningbo Congo / China Molybdenum → TFM /
CDM → TCC / MIKAS → Tshipuki, Kamilombe, Kamilombe2, Dinamitiere, Drain DCA),
as sete linhas da tabela (posições "Refinery", "Artisanal Mine Site", riscos
Low/Medium/High) e o detail card com risco Medium.
Vetor puro: `<text>` em Inter (editável se a fonte estiver instalada), ícones
como stroke paths, layers nomeadas por id (`node/…`, `edge/A→B`, `row/…`,
`fact/…`, `dot/…`, `land/…`, `legend/…`). Todos com LGES selecionada.

| Arquivo | O que é | Tamanho |
|---|---|---|
| `TDI-dark-page-flow.svg` | Tela inteira, view Flow, cadeia da LGES em destaque | 1440 × ~1500 |
| `TDI-dark-page-map.svg` | Tela inteira, view Map, globo + Flow Overview lateral | 1440 × ~1500 |
| `TDI-dark-flow-graph.svg` | Só o grafo, escala natural (cards 196×74) | ~2020 × 1234 |
| `TDI-dark-globe.svg` | Só o globo (países, labels, arcos, pontos) | 720 × 720 |
| `TDI-dark-node-states.svg` | 7 estados do card de ator, pra component set | 1692 × 180 |
| `TDI-dark-detail-card.svg` | Card do participante selecionado | 1126 × 208 |
| `TDI-dark-participants-table.svg` | Tabela Supply Chain Participants (filtrada pela cadeia) | 1126 × ~560 |
| `TDI-dark-flow-overview.svg` | Card Flow Overview compacto (modo Map) | 448 × 748 |
| `TDI-dark-legend.svg` | Legenda dos 10 tiers | 468 × 78 |
| `TDI-dark-sidebar.svg` | Rail + sidenav | 306 × 900 |
| `TDI-dark-header.svg` | Breadcrumb, título e segmented Map/Flow | 1440 × 104 |
| `TDI-dark-flow-overview-short.svg` | Flow Overview cortado na linha das minas (como no PNG) | 648 × 828 |
| `TDI-dark-supplier-assessment.svg` | Tela Supplier Assessment (Analysis): risco inerente/residual/audit, Details com mapa, Information Availability, Supplier Status, Assessment Details, Risk Matrix, Trade Relationships | 1440 × 2118 |
| `TDI-dark-entry-form.svg` | Tela Supplier Assessment (Entry form): nav de seções, Scrutiny com dropdown aberto, Past Activity, footer Cancel/Save | 1440 × 1546 |
| `TDI-dark-composition.svg` | **A composição inteira**, angulada como o `image 8.png`: plano inclinado (x 16° pra cima, y 21° pra direita, escala .8), faixa roxa, sombras, globo redondo. Gerada por `../compose-dark.py`; cada tela é um grupo `screen/…` com transform, então dá pra mover no Figma | 2000 × 1500 |

Tokens dark usados (do próprio protótipo): ground `#121215`, surface `#1B1B20`,
surface-2 `#202026`, line `#2A2B33` / `#363843`, text `#F1F1F4`, muted `#9A9EAB`,
faint `#6C7080`, accent `#7A5AF8`, node `#22232A`, edge `#34363F`, ok `#4ADE80`,
warn `#FBBF24`, bad `#F87171`, ocean `#2E5C86→#1F4468`, land `#2C2E36`.

As duas telas de Supplier Assessment vêm de `../screens-dark.js` (gerador
próprio, independente do protótipo) e podem ser vistas e copiadas em
`../screens-dark.html`, que tem botões "Copy SVG" pra colar direto no Figma.
Base: os SVGs light `Group 11277` / `Group 11278` da Pietra, traduzidos pros
tokens dark do TDI.

Regerar o resto: subir `python3 -m http.server 8787` na raiz do portfolio e um receptor
POST na porta 8790 (qualquer coisa que grave `?name=` em disco), abrir o
protótipo e rodar `export-png-dark.js` no console. Os hooks `window.TDI_MINI`,
`TDI_ROWS` e `TDI_DETAIL` são o que troca o conteúdo; sem eles, o export sai
com os dados mock do protótipo.
