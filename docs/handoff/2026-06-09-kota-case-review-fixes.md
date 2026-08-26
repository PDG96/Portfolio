# Handoff — KOTA case study: review vs spec v1.2.12 + fixes (2026-06-09)

## O que foi feito

Review completo de `projects/kota.html` contra `reference/KOTA v1.2 — Workflows
and Screens v1.2.12.html` (4 frentes: acurácia, narrativa, layout, língua),
seguido da aplicação dos fixes que não dependiam de input da Pietra.

Decisões verbais respeitadas (corretas no case mesmo contradizendo o spec):
sem KYC/Form action no Registration Stage 1; Suspend no lugar de Settings no
kebab; submenu Other Forms; sem "start from empty form"; Copy/Clone nos forms;
"Invited" como status formal; Registration Type "System" pra convites
pendentes; sidebars como escritos.

## Aplicado em kota.html

**Conteúdo**
- Deployment Matrix: 4º caminho adicionado (External · existing relationship
  claimed → Registration Form, 3 passos COM review, flip atômico pra Client) e
  Q8 reposicionada no wizard de registro (não no form). Subs das linhas agora
  carregam "reviewed / no review".
- Process: 1 frase de nuance — o caminho institution-led de relação já
  examinada não tem verify (resolvia contradição interna com a matriz).
- Seção nova "Course Corrections / Correções de Rota" entre Matrix e Product:
  as duas reversões documentadas no spec (W2 dividido→unificado 2026-05-06;
  W4b form completo, não subset). Product virou `--alt` pra alternância de bg.
- Outcome: fatos estruturais reais (15 workflows, 16 telas como contrato de
  engenharia).
- Persona Operator: frustração reescrita (eliminava redundância com Challenge).
- Personas intro: Administrator separado dos 3 papéis que trabalham o registro.

**Língua**
- PT: "Registro de registration"→"Ficha de registro"; counterparty→contraparte
  (ia_intro); "O Aggregator"→"O Agregador"; "streamlined"→"direto"; scr1/3/5_t
  encurtados pro nível do EN; ph_hero_cap alinhado; linhas da matriz
  traduzidas.
- EN: lead "opens pre-filled"→"opens mostly pre-filled" (alinhado ao PT, e ao
  W14); scr2_t "stage and decision"→"origin and status".
- HTML hardcoded sincronizado com dicionário EN (persona_title "Four
  people"→"Three actors" + intro).
- Órfãs removidas: `ph_sitemap_cap`, `scroll_hint` (EN+PT).
- JS validado com node --check após as mudanças.

## Redesign UI (mesmo dia, pedido da Pietra: "feio e unfriendly")

Três seções redesenhadas mantendo a linguagem do site:

- **IA / sitemap**: de caixa-admin com 3 faixas pra **diagrama de fluxo
  vertical** — card escuro do Counterparty (gray-true-900 + glow laranja,
  atributos como pills) → conector → ciclo (2 cards + seta gradiente) →
  conector → 2 views com barra superior (laranja = instituição, grafite =
  operador). Sem moldura externa. Breakpoint de empilhar o ciclo subiu
  480→559px (alinhado com o das views).
- **Personas**: bandas de header tintadas com os tokens dos case cards da
  landing — **Operator = amarelo, Bank = azul, Aggregator = rosa** — com
  avatar branco + ícone SVG stroke (armazém / banco / nós convergindo).
  Corpo em zonas (quem / goal+frustração / time), cards stretch na grid.
- **Deployment Matrix**: colunas com identidade casando com as personas
  (tinta azul = banco, rosa = agregador, dot colorido no header), chips de
  caminho (amarelo = operator-led, neutro = institution-led), pills de form
  maiores, células "não se aplica" hachuradas, mais respiro, hover laranja
  removido. Usa `:has()` (ok em browsers modernos; degrada sem hachura).

Sistema de cor agora é coerente entre as duas seções: quem é amarelo nas
personas é amarelo na matriz, etc. Verificado por screenshot headless em
1440px e 500px.

## NÃO feito — pendências pra Pietra

1. **Meta do hero**: `[ Timeline ]`, `[ Deliverables ]`, `[ Team ]` continuam
   placeholder — preciso dos dados reais (não invento fatos).
2. **Embeds interativos** (projeto à parte): proposta de aterrissagem mapeada
   no review — hero = bento do dashboard (chart-card + indicator-stack +
   vertical-gauge); Application flow = stepper step×viewer (Convention C10);
   Customer summary = vertical-gauge + smooth-line; Self-assessment espelho =
   stacked-area; Review fica estático. Reestruturar "The Product" de grid pra
   figuras full-width estilo Straatos (`.app-shot` já existe no CSS).
   Candidata mais forte: **Deployment Matrix com toggle Bank ↔ Aggregator**.
3. **Visual System**: seção ausente (Straatos tem); CSS de identidade
   (vis-bento, id-car, phase-slider) está morto no arquivo — decidir entre
   criar a seção ou limpar (~850 linhas).
4. Mobile do iframe embed usa altura fixa 1880px (herança Straatos) — trocar
   por aspect-ratio quando os embeds entrarem.
5. O 2º bloco `.case-section--insights` é override intencional (gradiente
   laranja Kota) — não é duplicata, mantido.

## Fontes
- Spec: `reference/KOTA v1.2 — Workflows and Screens v1.2.12.html` (no repo)
- Comparação estrutural: `projects/straatos.html`
- Texto extraído do spec: `/tmp/kota-spec.txt` (descartável)

---

## ADENDO 2026-06-10 — Reescrita completa sobre a tese auditada

A versão spec-driven foi descartada após feedback da Pietra. Processo:
entrevista (`product-docs/interview-kota.md`) → análise estratégica de 10
narrativas → **auditoria de autoria** (`product-docs/authorship-audit-kota.md`,
D1–D12) → reescrita do case sobre a tese honesta: "a designer que transforma
visão sem forma (specs, frases, ideias faladas) em linguagem de produto
consistente e reutilizável".

Decisões da Pietra: lead B ("I never met a user"), Datastake nomeada / pessoas
genéricas ("domain expert", "founder", "a developer"), só telas de produto
(sem artefatos de processo).

Nova estrutura do kota.html (EN+PT, 123 chaves i18n com paridade validada):
Hero (lead B + meta real: 2024·retomado 2026, designer única) → Challenge
"Papel, preenchido pelas mãos erradas" / Solution "Mudar quem segura a caneta"
→ IA "A pergunta que dividiu a arquitetura" (diagrama mantido) → Inputs "Nada
chegou como design" (3 cards: documento/frase/voz) → Method "Dois loops"
(dark) → Navigation Grammar "Um padrão carrega todos os apps" (3 regras) →
States "Uma tela não está pronta quando o caminho feliz funciona" (episódio do
empty state + edge case do dev) → Product (6 tiles, captions por decisão) →
Ownership "O que foi meu, e o que não foi" → Reflection (dark) "O rigor não
desaparece sem usuários. Ele muda de lugar." → Next.

REMOVIDO: Personas, Design Principles (decisões chefe-time), Deployment
Matrix, Course Corrections, grupos institution/operator da galeria.

Pendências: exportar as 6 telas da galeria (refs nas captions); rodar
design-polisher; CSS morto de personas/dep-matrix pode ser limpo depois.

## ADENDO 2026-06-10 (2) — Embed interativo: KYC Summary do operador

Recriação anonimizada da tela real (screenshot da Pietra) como embed interativo
em `projects/assets/kota-kyc-summary.html`, no padrão Straatos
(`.app-shot--embed` + iframe + `bento:visible`), inserida no topo da seção
The Product do kota.html (variant `.app-shot--kyc`: scroll interno, aspect
1265/780, mobile 78vh). Legenda i18n `fig_kyc` EN/PT.

Anonimização aplicada: zero nomes reais (Gécamines/EITI-DRC/TFM/etc → Acme
Holdings, Northbridge Trading...; pessoas → J. Smith, A. Costa...), mapa
abstrato sem geografia real, bandeiras → círculos neutros, "Mine site" →
Supplier/Buyer (Aggregator mantido), sem "Powered by datastake". Dados
fictícios em `projects/assets/kota-kyc/*.json`.

Library (~/portfolio/components):
- REUSADOS: chart-card, chart-tooltip, stacked-area (Performance),
  smooth-line (Accumulation).
- CRIADOS (mesmo padrão data-chart/data-src/IO/bento:visible, registrados na
  galeria): score-gauge (gauge gradiente + marker tooltip), ring-chart
  (modos rings=donut duplo e pie — Completeness + Triangulation),
  column-chart (Contributions), node-graph (hub Governance E cadeia linear
  Trade Relationships via config), status-table (Compliance com ícones de
  status+tooltips+busca E Governance table via config).
- Interatividade: toggle Graph|Table funcional, tooltips dos 3 estados de
  compliance, tooltip do score marker, busca viva nas tabelas, hovers.
