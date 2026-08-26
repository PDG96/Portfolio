# Decisão — Um sistema de medida pra todas as superfícies

**Data:** 2026-08-25
**Status:** Etapa 1 aplicada. Etapa 2 (grid de 12 colunas) pendente.

## O problema

Quatro superfícies, quatro sistemas diferentes de medida:

| Superfície | Medida horizontal | Vertical |
|---|---|---|
| Work | travada pelo `--card-ratio` | 100svh |
| About | `.wrap` → `clamp(72rem, 90vw, 110rem)` = até 1760px | 100svh, estourava |
| Get in touch | full width com `--sheet-gutter` | 100svh |
| Usecases | full width, sem teto (decisão explícita anterior) | rola por dentro |

E o orçamento vertical (`calc(100svh - 80px - 4.5rem - clamp(...) - 1.5rem)`) estava escrito à mão em três lugares.

## A decisão

**Três tokens, um container, uma exceção.**

### Tokens
```css
--page-gutter: 110px;   /* piso: inset lateral em janela estreita */
--page-max: 1600px;     /* teto: até onde a medida cresce */

--nav-h: 80px;
--seg-band: calc(4.5rem + clamp(1.25rem, 3vh, 2.5rem));
--view-pad-top: calc(var(--nav-h) + 1.5rem);
--view-h: calc(100svh - var(--view-pad-top) - var(--seg-band));
```
`--view-h` é derivado das duas coisas que realmente limitam a view, então o pill pode mudar de altura num lugar só.

### Container único
```css
width: min(100% - 2 * var(--page-gutter), var(--page-max));
margin-inline: auto;
```
Aplicado em `.hero > .wrap`, `.work > .wrap`, `.about > .wrap`, `.contact > .wrap`, no `.nav > .wrap` (das duas páginas) e no `.shell` dos usecases (via `max-width: calc(var(--page-max) + 2 * 1.5rem)`).

O nav **não** entrou. Foi testado no measure pra que o logo dividisse a borda esquerda da grid, mas em janela baixa a Work é mais estreita que o measure (limitada pela altura), então os dois continuavam desalinhados e o logo só flutuava pra dentro. Revertido pro gutter flat (`--sheet-gutter`).

### A exceção — conteúdo de proporção fixa
A Work é a única superfície cujo conteúdo não reflui: as imagens têm proporção. Texto se acomoda em qualquer caixa, imagem não.

```css
--card-ratio: 1.6;
--w-from-h: calc((var(--view-h) - var(--grid-gap)) * var(--card-ratio) + var(--grid-gap));
width: min(100%, var(--w-from-h));
```
com `aspect-ratio: var(--card-ratio)` no card.

`--w-from-h` é a largura que a grid precisaria pra duas linhas de cards nessa proporção preencherem exatamente o orçamento vertical. O `min()` disso com o measure prende a proporção **nas duas direções**:
- janela baixa → a altura limita, a grid estreita
- janela alta → o measure limita, a grid simplesmente não preenche a altura

Nos dois casos o `object-fit: cover` não tem o que cortar.

## O que foi revertido

O `.shell` dos usecases tinha um comentário explícito dizendo que não havia max-width, pra que o layout "nunca vire uma ilha estreita flutuando no meio de um display largo". O `--page-max` reverte isso. A troca: os usecases deixam de ser a única superfície do site sem borda direita.

## Dois bugs achados no caminho

1. **`.view.is-on { display: block }` cancelava o `display: flex` das quatro views.** Já tinha sido remendado só pro hero (`.hero.is-on`). Só apareceu na Work quando a grid deixou de preencher a altura toda. Corrigido na origem: `.view.is-on { display: flex }`, e o remendo do hero saiu.
2. **O `--card-ratio` só limitava uma direção.** Em janela alta (2560×1440) os cards ficavam altos demais e o `cover` cortava os lados — o problema oposto ao do ultrawide. O `min()` de duas restrições resolve os dois.

## Revertido depois

O cap do `.shell` nos usecases foi revertido. O sidebar é `max(260px, 23vw)` — proporcional à **viewport**, não ao shell. Com o shell travado em 1648px o sidebar continuava escalando com a janela e passou a comer 589px, 36% do shell em vez dos 23% pretendidos, esmagando o sheet em colunas de texto ilegíveis. Pra manter o cap, o sidebar teria que virar `23%`. Ficou sem cap.

O `--page-max` continua valendo pras quatro views da landing.

## Pendente — etapa 2

Grid de 12 colunas dentro do container, com o mesmo gap em todas as superfícies: Work = 6+6 em duas linhas, About = 6+6, Contact = 6+6, usecases = 3+9. Hoje cada uma inventa a sua (`1fr 1fr` gap 80px na About, `minmax(0,1fr)` gap clamp na Contact, `max(260px, 23vw)` nos usecases).

## Conhecido, não resolvido

- **About não cabe em 900px de altura.** Ganhou `align-items: safe center` (o topo continua alcançável) e rola, mas o conteúdo continua maior que uma tela. Ou diminui, ou a view assume que rola.
- **Em janela baixa a Work fica mais estreita que o measure** (1103 vs 1220 em 1440×900). É consequência direta de a Work ser limitada pela altura ali; só coincide com o measure quando a janela é alta o bastante. Foi o que inviabilizou pôr o nav no measure. Alternativas, se um dia valer: baixar `--page-max` (aperta as outras) ou subir `--card-ratio` (corta mais).

---

## Substituído pelos mockups de 3 displays (mesmo dia)

A Pietra mandou 15 mockups cobrindo MacBook Air 1280×832, Desktop 1440×1024 e Ultrawide 3440×1258. Medidos, os três caem numa regra só, e ela substitui os números da etapa 1:

| | MacBook | Desktop | Ultrawide |
|---|---|---|---|
| margem lateral | 32 | 32 | 583 |
| conteúdo | 1216 | 1376 | 2272 |
| topo / base / gap | 112 / 100 / 24 | igual | igual |

`--page-gutter: 32px` (era 110), `--page-max: 2272px` (era 1600), `--work-max: 2208px`. A grid da Work foi desenhada 64px mais estreita que as outras superfícies no teto.

Vertical: `--view-pad-top: 112px`, `--seg-band: 100px`, `--grid-gap: 24px`. A altura do card é **derivada** — `(view-h - gap) / 2` — e bate exata com o desenho nos três (298 / 394 / 510).

### O teto de proporção
Largura e altura derivam de fontes diferentes, então a proporção do card varia: 2.00 / 1.72 / 2.14. As imagens são 1.44 a 1.78, então o corte no ultrawide come um terço da altura do Kota.

`--card-max: 2.0`. Escolhido em cima dos números, não do palpite:

| teto | MacBook | Desktop | Ultrawide |
|---|---|---|---|
| desenhado | 1216 (marg 32) | 1376 (marg 32) | 2210 (marg 615) |
| 1.8 | 1097 (marg 92) ✗ | 1376 ✓ | 1864 (marg 788) |
| **2.0** | **1216 ✓** | **1376 ✓** | 2068 (marg 686) |

O 1.8 quebrava o MacBook, cujo card desenhado é 2.00. O 2.0 reproduz o desenho em dois dos três e só encolhe o ultrawide.

**Atenção:** os frames são altura de tela cheia. Um browser real tem ~87px a menos de viewport, e como a altura do card é derivada, uma janela mais baixa empurra a proporção pra cima e faz o teto morder mais cedo. Em 1440×937 (Desktop real) a margem vira 77 em vez de 32.

---

## Correção: um edge, e a Work define o measure

Duas coisas estavam erradas na leitura anterior.

**1. Existiam dois números de inset.** `--page-gutter` (110, depois 32) e `--sheet-gutter` (clamp 20–32) conviviam: o nav e o pill usavam um, o conteúdo usava outro. Nada encostava em nada. Agora existe `--edge: 32px` e tudo deriva dele, incluindo a altura da faixa do nav e a do pill.

**2. Cada superfície calculava a própria largura.** O certo é o contrário: a Work é a única superfície com restrição real — altura de card derivada de `--view-h` mais um teto de proporção — então a largura dela é o measure, e About, Get in touch, os usecases e o header tomam esse valor em vez de calcular o seu.

```css
--measure: min(
  calc(100% - 2 * var(--edge)),
  var(--work-max),
  calc(var(--card-h) * var(--card-max) * 2 + var(--grid-gap))
);
```

`--edge` é o piso: quando a janela encolhe o bastante pra Work caber com 32px de margem, o terceiro termo para de mandar e todas as superfícies travam nos 32 juntas.

**O header entrou junto.** Nos mockups o logo está em x=584 no ultrawide, exatamente a borda do conteúdo (582) — ele sempre andou no measure. Uma tentativa anterior de pôr o nav no measure foi revertida porque o cap estava em 1600 na época, então a Work ficava mais estreita que a barra e o logo alinhava com o vazio.

**O pill estava com 45px contra os 32 desenhados**, o que comia 13px da folga inferior em todas as páginas. A altura agora vem do token, então a aritmética de `--seg-band` é verdadeira.

### Verificado
| viewport | logo | work | about | contact | hero |
|---|---|---|---|---|---|
| 1440×937 | 32 | 32 / 1376 | 32 / 1376 | 32 / 1376 | 32 / 1376 |
| 3440×1171 | 769 | 769 / 1902 | 769 / 1902 | 769 / 1902 | 769 / 1902 |
