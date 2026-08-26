# Handoff — Reestruturação da landing (Hero, Work, Contact, footer, nav dos cases)

**Data:** 2026-08-25
**Arquivos:** `index.html`, `projects/{wazi,straatos,kota,supply-chain}.html`

## O que mudou

### 1. Hero
- Removidos os botões `See selected work` / `Get in touch` (markup + CSS `.hero-ctas`, `.hero .btn-primary`, `.hero .btn-ghost`).
- Removido o hint `Selected work` + seta animada na base (`.hero-scroll-hint`, keyframe `hero-hint-bounce`).
- **Bug corrigido:** `.view.is-on { display: block }` cancelava o `display: flex` do `.hero`, então `align-items: center` nunca rodava e o texto não centralizava verticalmente. Adicionado `.hero.is-on { display: flex }` logo depois (mesma especificidade, ganha pela ordem no source).
- Padding simétrico (`80px 0`); antes `80px 0 4rem`, onde o `4rem` reservava espaço pra seta.

### 2. Work — carrossel → grid 2×2
- `.work-scroll` (scroll horizontal com snap) virou `.work-grid` (2 colunas, `grid-auto-rows: 1fr`, altura fixa = viewport menos nav e segmented).
- Removidos: `.section-header` da seção, `.work-scroll-hint` (barra de progresso), o JS que atualizava o thumb, e as chaves i18n `scroll_hint`.
- Ordem definida pela Pietra: **WAZI, Straatos / Kota, TDI (supply-chain)**.
- Cards são **só imagem** — sem tag, sem título, sem link. `.case-thumb` virou camada `position: absolute; inset: 0`. O `<a>` tira o nome acessível do `alt` do `<img>`.
- Sem gradiente/scrim sobre as imagens (decisão da Pietra).
- Hover: `translateY(-6px)` + sombra no card, `scale(1.04)` na imagem.
- Mobile (<768px): 1 coluna, altura auto, a página rola.
- **Largura travada pela altura.** A grid tem altura fixa e largura livre, então em display extra wide o card esticava lateralmente (3.6:1 num ultrawide) e o `object-fit: cover` comia topo e base de toda imagem. Agora:
  ```
  --card-ratio: 1.6;
  max-width: calc((var(--grid-h) - var(--grid-gap)) / 2 * var(--card-ratio) * 2 + var(--grid-gap));
  margin-inline: auto;
  ```
  Cada card tem `(altura - gap) / 2` de altura; o `--card-ratio` deriva a largura disso, então a grid nunca passa de dois cards + gap. **`--card-ratio` é o botão:** subir deixa os cards mais largos e corta mais; descer corta menos e sobra mais margem lateral.
  Ratios reais das imagens: WAZI 1.78, Straatos 1.62, Kota 1.44, supply-chain 1.78 — 1.6 é o meio-termo.
  Efeito colateral: em 1440×900 a grid encolhe de 1220px pra ~1102px, então a margem lateral efetiva vira ~168px em vez dos 110px do `--page-gutter`.

### 3. Novo token `--page-gutter`
Inset lateral compartilhado entre a grid de Work e o sheet dos usecases:
```
--page-gutter: 110px;          /* default */
@media (max-width: 1199px) → 64px
@media (max-width:  899px) → 40px
@media (max-width:  599px) → 1.25rem
```
Aplicado em `.work > .wrap` (index) e em `.main-sheet .case-hero .wrap, .main-sheet .case-section .wrap` (os 4 usecases). O `--sheet-gutter` antigo continua existindo pro nav e pro segmented.

### 4. Contact — rediagramada
- Ganhou `min-height: 100svh`, no mesmo orçamento vertical das outras views.
- Layout 2 colunas: **esquerda** = heading + copy + form (a copy fica direto acima dos inputs, alinhada na borda esquerda deles); **direita** = a animação de dots.
- **Animação restaurada:** o swarm chaos→círculo→scatter do commit inicial (`91b1353`, seção `.ctc` / `#swarmCanvas`). 90 dots, `#F7FDB9`, GATHER 3s / SPIN 4s / SCATTER 3.2s, repulsão do mouse em 100px.
  - Diferença em relação ao original: `init()` roda **dentro** do IntersectionObserver, não no load. As views são `display: none` até serem selecionadas, então o parent não tem caixa pra medir antes de Contact entrar em tela.
  - Escondida abaixo de 900px.

### 5. Footer removido de todas as páginas
- `<footer class="footer">` + todo o CSS saíram do `index.html`.
- `<footer class="case-footer">` saiu dos 4 usecases.
- **Consequência:** o link do LinkedIn e o copyright não existem mais em lugar nenhum do site. Se forem voltar, o lugar natural é a seção About (que já tem os fact cards) ou o Contact.

### 6. Segmented nav nos usecases
- O componente `.seg` foi portado pros 4 usecases. Lá são `<a>` (navegação de volta pra landing), não `<button>`.
- `Work` carrega `aria-current="page"` + estado `.is-on` — um case study é onde Work leva.
- `.main-sheet` ganhou `padding-bottom: 5.5rem` pro controle não cobrir o conteúdo.

### 7. Roteamento por hash
Pra que o segmented dos usecases funcione, o switcher da landing agora lê `location.hash`:
- `show(fromHash())` no load, `hashchange` listener, e cada clique no seg faz `history.replaceState`.
- Logo do header aponta pra `#hero` (era `href="#"`, que o roteador ignorava) e `../index.html#hero` nos usecases.

> **Nota (mesmo dia):** a medida da Work descrita acima foi substituída pelo
> sistema em `docs/decisions/2026-08-25-sistema-de-grid.md`. O `--card-ratio`
> continua sendo o botão, mas agora limita a proporção nas duas direções.

## Pendências / decisões pra Pietra

1. **About estoura a viewport** em 1440×900 — os fact cards de baixo ficam cortados e o segmented passa por cima. Não foi pedido, não mexi.
2. **Nav do topo dos usecases** ainda tem os links `Work` / `Contact`, agora redundantes com o segmented. Não foi pedido, não mexi.
3. **Contact usa `--sheet-gutter`**, não `--page-gutter` — o pedido dos 110px foi específico pra Work e usecases. Se quiser as views alinhadas entre si, trocar o token em `.contact > .wrap`.
4. **Chaves i18n órfãs** ficaram no dicionário (`c1_tag`…`c5_d`, `c1_l`…`c5_l`, `work_heading`, `work_label`, `c3_*`). Deixadas de propósito, caso as tags e descrições voltem pros cards.

## Como verificar
```
python3 -m http.server 8899
# a landing roda o switcher por hash:
open http://localhost:8899/index.html#work
open http://localhost:8899/index.html#contact
open http://localhost:8899/projects/straatos.html
```
Pra ver o círculo formado sem esperar o ciclo, congele a fase trocando
`const phase = time % TOTAL;` por `const phase = 5000;` numa cópia do arquivo.
