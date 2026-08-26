# Handoff — Layout sidebar-shell aplicado em todos os cases

**Data:** 2026-08-13
**De:** Pietra (design)
**Arquivos:** `projects/straatos.html`, `projects/wazi.html`, `projects/kota.html`, `projects/tdi.html`

## O que mudou

O protótipo `straatos-sidebar-test.html` virou o padrão de todas as páginas de case.
O arquivo de teste foi removido depois de promovido.

### 1. Shell de duas colunas

```
body.shell-page
└── .shell            (flex, altura travada em 100svh − 60px, gap 1.5rem)
    ├── aside.sidebar (max(260px, 23vw), scroll próprio)
    └── .main-sheet   (flex 1, scroll próprio)
```

A janela não rola: cada painel rola por dentro, então nenhum card passa por baixo
do nav fixo. Abaixo de 900px o shell empilha e volta a ser um scroll único de
página (sidebar primeiro, conteúdo depois).

### 2. A sidebar passou a carregar a identidade do case

Saíram do hero e entraram na sidebar: `h1`, lead, bloco de meta (`.sidebar-meta`)
e a lista "Next up" (`.sidebar-next`, cards só de imagem, empilhados na vertical).
O hero no sheet ficou só com a imagem.

Sumiram: o link "Back to projects" (o logo e o "Work" do nav cobrem a volta),
a `.case-tag` acima do título, e a seção "Next / Other work" do fim da página.

### 3. Tema claro/escuro no lugar do seletor EN/PT

- Script de pre-paint no `<head>` carimba `data-theme` antes do primeiro paint —
  sem flash branco ao recarregar no escuro. **Escuro é o estado padrão.**
- Tokens novos: `--shell-bg` (calha atrás dos painéis), `--sheet` (superfície do
  painel), `--link` (teal com contraste ok nos dois temas), `--label-warn`
  (terracota do label "Challenge").
- `--text-2` virou `#6b6b6b` (o gray-500 só chegava a 4.16:1 sobre o `#f0f0ee`) e
  `--text-3` desceu um passo da rampa.
- O dicionário i18n e o `setLang` continuam ligados; só o controle EN/PT saiu e o
  idioma ficou preso em `'en'`. Dá pra devolver o botão sem reconstruir nada.

### 4. Iframes de bento

Ganharam `.embed-iframe--scaled` + `data-w`/`data-h`. O JS fixa a largura natural
de desktop e escala o conjunto via `ResizeObserver`, pra página embutida não cair
no próprio breakpoint mobile só porque a coluna ficou mais estreita.
Aplicado no straatos (2 bentos) e no kota (KYC summary, 1265×780).

## Decisões de conteúdo que precisam do seu aval

1. **Straatos** — o teste foi promovido como está, então as seções
   *Information Architecture / Sitemap* e *Key Insights / Design Principles*
   (a de fundo em vídeo) ficaram de fora, e o Swimlane passou pra depois do
   Visual System. Ordem atual: Hero → Challenge/Solution → Visual System →
   Swimlane → Application.
2. **Leads encurtados** pra caber na sidebar (EN e PT sincronizados):
   - WAZI: "…artisanal and small-scale gold mining, from miner to buyer."
   - Kota: "Counterparty due-diligence infrastructure for banks in the DRC…"
     (era um parágrafo de cinco frases)
   - TDI: cortada a segunda frase da lead.
3. **Kota** — o hero era um placeholder `.ph` com a nota "Replace with
   assets/kota-hero.png once exported". O arquivo já existe, então entrou.
4. **TDI** — título passou de "TDI — Continuous Due Diligence…" para
   "TDI, Continuous Due Diligence…", seguindo o padrão de vírgula dos outros.

## Correções de passagem

- `&amp;` literal aparecendo como "&AMP;" nos labels em caixa alta: o dicionário
  guardava a entidade e o `setLang` escreve via `textContent`. Trocado por `&`
  direto no dicionário (wazi: 4 ocorrências, straatos: 2).

## Pendências

- **TDI e Kota não estão linkados no `index.html`.** O straatos e o wazi apontam
  pra `kota.html` no "Next up", então o kota precisa entrar no deploy. O TDI
  continua órfão — decidir se entra no carrossel de work ou fica fora.
- A ordem dos cards do "Next up" está fixa no HTML de cada página. Se entrar um
  case novo, é edição manual nas quatro.

## Pass de textura (2026-08-14)

Segundo round, pedido depois de ver o layout rodando. Toca `index.html` também.

### Grain nos dois temas e em todas as páginas

O `body::after` que só existia na landing foi para as quatro páginas de case.
Mesmo SVG de `feTurbulence`, mesma escala de 200px.

- **Dark:** inalterado (`opacity: .3`, blend normal) — era o que já funcionava.
- **Light:** `opacity: .42` + `mix-blend-mode: multiply`. Sem o multiply o overlay
  clareia em vez de texturizar e o grão some no branco.
- `z-index` do grão desceu de 9999 para 9998, para ficar abaixo do lightbox
  (9999) e do cursor (10000). No 9999 o pseudo-elemento vinha depois dos filhos
  do body e cobria a imagem ampliada.

### Segundo tom no light

O light rodava num único cinza quase branco. Agora segue a mesma lógica do dark
(`#141414` de fundo, `#1c1c1c` na faixa do About):

| token | antes | agora |
|---|---|---|
| `--bg` (landing) | `#fcfcfc` | `#fbfaf8` |
| `--bg-alt` (About, thumbs, faixas `--alt`) | `#f5f5f5` | `#f1efea` |
| `--sheet` (painéis dos cases) | `#ffffff` | `#fbfaf8` |
| `--shell-bg` (calha atrás dos painéis) | `#f0f0ee` | `#ebe9e4` |

O off-white é levemente quente de propósito: dá ao grão um chão de papel em vez
de um branco cirúrgico, e a calha mais funda faz os painéis lerem como elevados.

### Dots da hero

Mais presentes, como pedido:

- alpha do caos: `0.06–0.24` → `0.10–0.36`
- alpha em grade: `0.35` → `0.52`
- linhas de conexão: `0.05` → `0.08`
- cor com mais croma na mesma família: dark `247,253,185` → `238,250,138`;
  light `150,158,71` → `134,143,46`

O `alphaScale` de mobile (0.45) continua valendo, então no celular o ganho é
proporcional e não vira ruído.

## Fix de espaçamento do shell (2026-08-14)

Os painéis encostavam no nav em cima e sobrava o dobro embaixo. Medido:
topo **−6px**, laterais 24px, base **54px**.

Causa: `.shell` era um bloco no fluxo com `margin: 60px auto 0` +
`height: calc(100svh - 60px)`. A margem de topo escapava para o elemento raiz e
deixava o documento 60px rolável — a página rolava sozinha 30px, os painéis
subiam para debaixo do nav e a folga da base crescia na mesma medida.

Agora `.shell` é um quadro fixo:

```css
position: fixed;
inset: 60px 0 0 0;   /* a altura do nav sai da caixa direto */
padding: 1.5rem;
```

Sem margem para escapar, sem dependência de `100svh`, e o padding de 1.5rem vale
igual nos quatro lados em qualquer tamanho de janela. No breakpoint de 900px o
`.shell` volta para `position: static` e o empilhamento com scroll de página
continua igual.

Conferido nas quatro páginas: topo, laterais, base e o vão entre os painéis todos
em **24px**, e `scrollHeight === clientHeight` na raiz (documento não rola mais).

## Dashboard ao vivo no straatos (2026-08-15)

Protótipo interativo (Mapbox GL + charts) copiado do scratchpad da sessão do
Storybook para `projects/assets/straatos-dashboard/`, embutido como primeiro item
do `.app-stack` da seção **Application** — o intro já abre com "The dashboard
anchors on a 3D globe", então ele entra antes do `straatos-final.png`.

Usa o mesmo padrão dos bentos: `.embed-iframe--scaled` com `data-w="1265"
data-h="1604"`, `loading="lazy"`, `scrolling="no"`. O 1604 é a altura natural
cheia do dashboard a 1265 de largura (146 de topbar + 1458 de conteúdo), então
nada fica cortado e o frame nunca rola — o scroll da página passa direto.
Legenda com `data-i18n="fig_dashboard"`, EN e PT no dicionário.

Limpezas na cópia (os originais seguem intactos no scratchpad de origem):

- `sidebar.svg` (85KB) e a pasta `assets/` inteira (32KB) removidos: todo ícone,
  bandeira e o SVG da sidebar já estão inline como base64 no HTML, nenhum dos
  arquivos era referenciado. A pasta caiu de 268KB para 132KB.
- `<html lang="pt-BR">` → `lang="en"`: a UI do dashboard é toda em inglês.

### Pendências deste embed

- **Token do Mapbox exposto.** O `pk.eyJ1IjoicGlldHJhZ290dGFyZG8i...` está no
  fonte e vai para o ar junto. Token público é feito para rodar no cliente, mas
  sem restrição de URL na conta Mapbox qualquer um pode usar a cota dela.
  Adicionar `pietragottardo.com` (e o domínio de preview) nas URL restrictions
  do token antes de publicar.
- **Primeira dependência externa fora as fontes.** O `mapbox-gl.js` vem de CDN,
  o que contraria a convenção "sem dependências externas" do CLAUDE.md. Está
  isolado dentro do iframe e é lazy, mas vale registrar: sem rede, o dashboard
  cai no fallback interno em vez de quebrar a página.

## Dashboard: frame, scroll e coreografia (2026-08-17)

**Removidas** da seção Application, a pedido: `straatos-final.png` (laptop no
pedestal), `project-creation.png` (drawer New Project) e `straatos-mockup-03.png`
(Planting Cycle + Monitoring Campaign). As chaves `fig_project` e `fig_cycles`
saíram dos dois dicionários. Os PNGs continuam em `assets/` caso voltem a ser
usados em outro lugar.

**Movido** para antes da seção de identidade visual, em bloco próprio. Ordem
atual: Challenge/Solution → **Dashboard** → Visual System → Swimlane →
Application.

**Frame de navegador** (`.browser-frame` + `.browser-bar`): barra com três
pontos e a pílula de URL `app.straatos.io/dashboard`, tudo em tokens, então
segue o tema claro/escuro. O iframe passou de 1265×1604 (altura natural inteira,
sem rolagem) para **1200×860**, um desktop padrão — perto de escala 1:1 na
coluna, então o texto renderiza no tamanho real em vez de miniatura.

**Rolagem interna:** o `scrolling="no"` saiu. A estrutura do protótipo já
resolvia o resto — `.sidebar`, `.header` e `.page-title` são `flex-shrink: 0` e
só `.content` tem `overflow-y: auto`. Sidebar e header ficam fixos, o conteúdo
rola, e ao chegar no fim a rolagem encadeia de volta para a página.

**Coreografia de entrada** (`dashboard.html`, bloco novo no fim):

1. Cards entram em cascata (fade + subida), 160ms entre eles.
2. Números correm de 0 até o valor real com easing cúbico.
3. Gráficos pintam da esquerda para a direita via `clip-path`.
4. O globo dá uma volta lenta (`easeTo` com easing linear, que é o que faz
   parecer rotação) e depois desce no Saloum Delta — o projeto que o case
   acompanha — abrindo o card e o polígono do território.

Só arma quando roda dentro de um iframe; aberto sozinho o protótipo fica no
estado normal. `prefers-reduced-motion` desliga tudo. O gatilho reusa o
`bento:visible` que a página já postava para os bentos.

Dois cuidados que valem saber, porque não são óbvios:

- `reveal()` e `play()` são separados. A rede de segurança de 4s só revela os
  cards, para nenhum frame ficar em branco se o host não avisar; a volta do
  globo fica guardada para uma chegada de verdade, senão ela é gasta enquanto
  a pessoa está em outro ponto da página.
- Os contadores têm um `setTimeout` que crava o número final além do `rAF`. Em
  aba de fundo o `rAF` fica suspenso e a figura congelaria em 0.

**Verificado:** com a aba em foco a coreografia roda inteira — o globo dá a
volta, desce no Saloum Delta e abre o card do projeto com o polígono do
território. Em aba de fundo nada disso aparece, porque o `rAF` fica suspenso e
as animações de câmera do Mapbox dependem dele; o estado interno continua
correto (contadores nos valores finais, cards e gráficos revelados).

**Altura do frame:** 1200×860 → **1200×780** a pedido. O rodapé "Powered by
datastake" da sidebar fica cortado nessa altura — é só a arte do SVG, sem
conteúdo perdido.

## Escala dos embeds em tela grande (2026-08-17)

Uma causa só por trás de dois sintomas: os iframes eram ampliados acima de 1:1
em telas largas. O Chrome rasteriza o iframe na resolução dele e depois estica
essa textura, então ampliar não redesenha nítido, só aumenta pixel.

- **Dashboard** (`.embed-iframe--app`, regra própria): pega a largura da coluna
  a 1:1 e a **altura fica travada em 780px** em qualquer tela. Antes crescia nas
  duas direções e virava um bloco mais alto que a viewport. Só reduz quando a
  coluna fica menor que os 1000px que o protótipo precisa.
- **Bentos** (`.embed-iframe--scaled`, compartilhado com o kota): escala limitada
  a `min(1, coluna/natural)`. Passando da largura natural a composição para de
  crescer e centraliza, e a altura acompanha a escala em vez do `aspect-ratio`,
  para não sobrar faixa morta embaixo.

**Readout do pH cortado:** o gauge divide a largura em `1fr | barra | 1fr`, o que
deixava ~60px para a coluna do readout enquanto a linha (traço + "pH" + valor)
pedia ~87px, então o número batia na borda do card. A barra, os vãos e o corpo
do texto foram reduzidos por variável só nesse tile, e o traço ganhou
`--vg-dash-width` no componente (antes era 28px fixo).

### Risco: os componentes de chart não sobem

`components/` está no `.gitignore` e não é rastreado. Os dois bentos montam os
gráficos por `/components/...`, então **no site publicado os `chart-mount`
ficam vazios**: o gauge de pH e o de emission reductions não aparecem. Localmente
funciona porque o servidor serve a pasta. Decidir se `components/` entra no
deploy ou se esses gráficos viram imagem exportada.

## Colunas dos charts e swimlane (2026-08-17, fim do dia)

**Terceiro chart maior que os outros dois:** `.chart-card:last-child` rodava com
`flex: 1.14`, herdado das proporções do mockup. Como os SVGs são `width: 100%`,
esses 14% escalavam o chart inteiro — tipo maior, plot mais alto e menos
respiro dentro do próprio card que os vizinhos. Regra removida, as três colunas
voltaram a ser iguais (medido: 473 / 473 / 473).

**Seção Swimlane removida** junto com as chaves `swim_label`, `swim_title` e
`swim_intro` dos dois dicionários. A `straatos-swimlane.png` continua em
`assets/`. Ordem final do case: Hero → Challenge/Solution → Dashboard →
Visual System → Application.

**Cache:** o iframe do dashboard ganhou `?v=2` no `src`. Sem isso o navegador
continuava servindo a versão antiga do protótipo mesmo depois de editar o
arquivo. Vale lembrar disso a cada mudança dentro de `straatos-dashboard/`.

## Bentos fluidos e limpeza no wazi (2026-08-17, noite)

**A sobra nas laterais do bento** era o corte de escala 1:1: a composição parava
em 1265px e centralizava. Como as tiles são todas posicionadas em %, ela na
verdade renderiza bem em qualquer largura — o `transform` só existia para não
deixar a página embutida cruzar o próprio breakpoint de 900px.

Agora o scaler dá a largura real da coluna ao iframe, com piso e teto:

```
iw    = min(1500, max(920, coluna))
scale = min(1, coluna / iw)
```

Piso de 920 mantém o embed acima do breakpoint dele; teto de 1500 impede que as
tiles cresçam além da tipografia em px fixo lá dentro. Medido numa coluna de
1822: 1500px de largura, `scale(1)`, 161px de cada lado. Em coluna de 1200–1500
preenche sem sobra nenhuma, e sempre nítido.

**Kota** saiu do scaler de composição e foi para o de app (`--app`,
`data-min-w="920" data-h="780"`): aquele embed é uma tela de aplicação com
`.content` rolando por dentro, então altura fixa e largura fluida, igual ao
dashboard. Com o de composição a altura teria crescido junto com a tela.

**Seção "Research & Process" removida do wazi** (o carrossel de três artefatos),
junto com as seis chaves `rp_*` dos dois dicionários. Como nada mais no arquivo
usava `.rp-*` nem `.h-scroll-*`, tirei também as 14 regras de CSS órfãs e o
tracker do thumb — o arquivo caiu de 87KB para 84KB. Os três SVGs continuam em
`assets/wazi/`.

## Entrada do grafo de stakeholders (2026-08-18)

`assets/wazi-network.html`, mesma lógica da coreografia do dashboard: só arma
dentro do iframe, `prefers-reduced-motion` desliga, rede de segurança de 4s para
o grafo nunca ficar invisível se o host não avisar.

Na chegada, em ordem:

1. Os nós entram em ondulação a partir do centro do quadro (o atraso de cada um
   é a distância dele até o centro), as linhas entram logo atrás.
2. `simulation.alpha(0.85).restart()` — o layout se acomoda à vista em vez de
   aparecer pronto.
3. Aos 2,2s um incidente **abre sozinho** e fecha 2,6s depois. Não é uma
   animação decorativa: é a própria função `showIncident()` do clique, rodada
   uma vez, com o anel de pulso e tudo. É o sinal mais direto de "isso aqui é
   clicável".

O `wazi.html` não tinha o handshake `bento:visible` (só o straatos e o kota
tinham), então adicionei o notificador apontando para `.network-iframe`. O `src`
ganhou `?v=2`.

Conferido: card abre com "Mercury contamination report", fica ~2,6s e fecha.

**Sobra no quadro:** o grafo se agrupa numa fração de um frame bem alto, com
bastante espaço morto em volta. É a força do layout (`charge -110`,
`link distance 60`) contra um quadro grande — não é bug, mas dá para calibrar
os dois pelo tamanho do frame se quiser que ele ocupe mais.

## Verificado no navegador

Quatro páginas rodadas em `localhost` nos dois temas, com scroll pelo conteúdo:
hero, seções, carrosséis horizontais e iframes renderizam dentro do sheet sem
estouro lateral. Sem erros de console.
