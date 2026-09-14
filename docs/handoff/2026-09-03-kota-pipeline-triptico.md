# Handoff: Kota, o pipeline ao vivo em tres telas interativas

Data: 2026-09-03 · Quem: Claude (sessao com a Pietra)

## O que e
Pedido da Pietra (por voz): tres telas interativas contando a MESMA historia em tres assentos: o operador completa e submete a aplicacao, o banco e notificado/avalia/aprova, o agregador ve o operador verificado na cadeia. Entidade que atravessa as tres: **Riverbend cooperative** (ficticia, ja existia na tabela do banco). Banco: **Meridian Bank** (ja existia no lado do operador).

## Arquivos novos (projects/assets/kota/)
- **flow-operator.html** — derivado de operator-application.html. Interativo: clicar secoes incompletas completa (progresso/check), clicar docs verifica, hint do submitbar recalcula ("3 sections and 3 documents to go" -> ...), submit habilita quando tudo em dia; submeter avanca o stage bar (1-2 done, 3 Await confirmation), pill vira "Submitted", toast.
- **flow-bank.html** — derivado de bank-registration.html. Sino com badge -> popover de notificacao ("Riverbend submitted their application") -> linha do Riverbend vira Ready for evaluation (100%, 7/7, KPI 4->5, highlight+scroll) -> clicar a linha abre modal "Evaluate Riverbend cooperative" (indicadores + Sanctions Clear) -> Approve -> pill "Approved", toast "operator and aggregator notified". Convite original intacto.
- **flow-aggregator.html** — derivado de bank-registration.html, revocabularizado pro assento do agregador (Suppliers / Due diligence / Coverage; KPIs Suppliers 24, Bank-verified 9, Coverage 82%, Open gaps 3; estados "Verified by bank" / "With the bank" / "Self-declared" / "Onboarding"). Sino -> "Meridian Bank approved Riverbend cooperative" -> linha vira Verified by bank 100%, KPIs 10/86%, toast. Demonstra o "same engine, own vocabulary" na pratica.

## Na pagina (kota.html)
Nova secao apos os cards de atores: label "The Pipeline, Live" / h2 "One record, three seats." + intro + 3 figures (embed-frame com hint persistente + figcaption instrutiva, dash-h 900/820/820). i18n EN/PT completo (chaves pipe_* e fig_flow1-3; PT rascunho meu, revisar tom).

## Tecnica
- Telas derivadas por script python (copy + cirurgia com asserts) pra herdar tokens/components/shell e SVGs sem divergencia.
- IIFE original do bank exposto via window.__bank/__agg (rows/say/openModal/closeModal) pros roteiros de cena reutilizarem helpers.
- Limitacao conhecida no flow-bank: apos a notificacao, a linha do Riverbend e clonada (pra remover handlers antigos) e o filtro de busca do arquivo original deixa de esconde-la; invisivel no uso normal do demo.
- Roteiros verificados clique a clique no Chrome (screenshots na sessao).
- Update: flow-operator agora abre o formulario de Ownership inline (3 respostas dadas + 2 perguntas clicaveis; responder as duas completa a secao).
- Update: flow-operator reestruturado espelhando a gramatica do banco: sidebar fixa a esquerda (info do Meridian Bank, status, stage, validade 'in 26 days', referencia mock, stepper VERTICAL, progresso geral do arquivo) e area de trabalho a direita (form KYC aberto + documentos + submit). Progresso da sidebar atualiza ao preencher; submit avanca o stepper vertical.
- Update: formulario do operador agora e funcional de verdade: 4 secoes em accordion com campos reais (inputs, selects, chips multi-pick), progresso por secao calculado do preenchimento, completar/descompletar dinamico; identidade vem preenchida e editavel.
- Update (4 pedidos da Pietra em sequencia):
  1. Stepper aninhado (ref visual dela): "Compile information" abre em substeps KYC / Management systems / Additional information, com dots; substeps sao botoes que rolam ate o grupo correspondente e mudam de estado (now/done) conforme os grupos completam.
  2. Form regrupado em 3 cards: KYC (identity+ownership), Management systems (activities+trade partners), Additional information (documentos).
  3. Layout de app: sidebar ocupa a tela inteira (100vh) e so o form rola a direita; submitbar sticky no rodape do scroll. Mesma logica no flow-bank: KPIs viraram sidebar vertical fixa (Meridian Bank · Registration desk) e a tabela rola.
  4. Dark mode: botao de tema no topbar das TRES telas (tokens dark ja existiam no tokens.css compartilhado).
- Auditoria de contraste do dark (pedido dela com prints):
  1. tokens.css: `--title` nao tinha override dark (ficava #384250, quase invisivel) -> `:root[data-theme="dark"]{--title:#F2EBE1}`. Corrige titulos de card, nomes nas tabelas, valores de KPI, steps.
  2. components.css: `.pill` usa mix-blend-mode:multiply (caixa preta no escuro) -> override `:root[data-theme="dark"] .pill{mix-blend-mode:normal}`. Corrige todas as pills (stage, status, docs) nas 3 telas.
  3. CSS compartilhado bumpado ?v=5 -> ?v=6 em todos os HTMLs do kota (cache heuristico segurava os fixes).
  - Verificado em dark: operador (form completo), banco (tabela + popover + modal + toast), agregador (tabela + toast). Estados profundos inclusos.
- Toast fantasma no load do flow-bank: nao reproduz em load limpo (diagnostico via JS: sem sel, sem toast, 1 tabela, 6 rows). Provavel clique perdido da automacao; nada no codigo dispara sozinho.
- Dark repintado FRIO a pedido dela ('tons mais frios, esse ta mto alaranjado'): grounds do dark em cinza-azulado (bg #0F1115, surface #151A21, borders #2A303B, textos #EEF1F5/#C9CFD9), laranja preservado so como acento; sidebar rail #101319; overrides (.av/.me/.pill.neutral) esfriados. CSS bump ?v=7. O comentario 'warm dark deliberado' dos tokens ficou superado pela decisao dela.
- Dark reequilibrado pra NEUTRO (3a iteracao dela: warm -> frio -> neutro): grays sem vies de matiz (bg #111214, surface #17181B, border #2C2E33, texto #F0F1F2), semanticos suavizados, acento laranja intacto. Bump ?v=8.

## 2026-09-04: KYC da auditoria aplicado no flow-operator (com fixes e escala)
- A Pietra forneceu a auditoria completa do formulario KYC real (6 etapas, inventario, logica condicional, achados B1/A1-3/M1-4/L1-4). Aplicada no flow-operator como as 6 etapas: Identification, Registration, Governance, Scrutiny, Compliance, Organisation policies, navegaveis pelo subnav aninhado do stepper (KYC abre nas 6).
- Fixes incorporados por design: A1 obrigatorios com asterisco + chip "x of y answered" por etapa + gating que LISTA o que falta; A2 campos derivados com tratamento travado uniforme (cadeado + tooltip "Derived from the record"); A3 sem dados de teste; M1 sem campo Type travado exposto (adds tem tipo unico por contexto); M2/M3 toasts/titulos interpolam a politica e a entidade (todas as nove, incluindo Community & society); M4 toda dtable tem empty state com CTA no corpo; L1/L2/L3 caps corretos (VAT, FATF, AML/CFT, ID) e "Add board member" no singular.
- Escala: Board members pre-populado com 100 membros (dados ficticios gerados), toolbar com contador, busca e paginacao com elipse; add prepende e atualiza contagem. Padrao .dtable reutilizado em certificado, watchlist, FATF e banking records.
- Padrao do sistema reproduzido: trio de acoes auxiliares por campo (No available information / Not applicable / Add comment), contador 0/60, selects com placeholder.
- Componentes nomeados para a futura extracao de design system (pendencia registrada na memoria): .field, .field--locked, .q, .opts, .chips, .dtable(-toolbar/-empty/-foot), .policy-list, .step-chip, .subnav.
- Contact da landing: colunas alinhavam pelo rodape (align-items:end), topo da lista de fatos flutuava conforme viewport (report da Pietra). Fix estrutural: eyebrow+h2 viram .connect-head atravessando o grid, colunas alinham por start, row-gap 0 (respiro vem do margin do h2). Lista casa com o 1o paragrafo em qualquer largura.
