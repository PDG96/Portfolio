# Handoff · Animação da sidebar do TDI (recriada do Jitter)

**Data:** 2026-09-22
**Arquivo:** `projects/assets/tdi/sidebar-motion.html`
**Origem:** artboard "Teste claude" do arquivo TDI no Jitter (4s, 194×696)

## Como foi feito

O Jitter não exporta código, então li os parâmetros camada por camada no
painel do próprio editor (aba Animate) e reconstruí em CSS. Nada foi
estimado no olho: duração, easing, direção e stagger vêm do painel; só os
tempos de início foram medidos na régua da timeline (0s em x=234, 172,75 px/s),
com precisão de ~±15ms.

## A coreografia

Sequência inteira dura ~0,94s. No Jitter ela começa em 1,644s do artboard;
aqui começa em zero.

| Camada | Efeito | Duração | Easing | Início |
|---|---|---|---|---|
| Text 1 (título "Supply Chain") | Mask in ↑, 100%, por palavra (227ms entre elas) | 757ms | Smooth | 0 |
| Rectangle 2 (destaque do item ativo) | Fade in | 590ms | linear | 116ms |
| Icon (6×) | Grow in a partir de 50%, sem fade | 610ms | Slow down | 133 · 214 · 289 · 364 · 440 · 515ms |
| Shape 2 (divisória vertical) | Mask Reveal ↓ | 620ms | Smooth | 214ms |
| Text 2–7 (labels) | Slide in ↑ 50%, por palavra (47ms entre elas) | 346ms | Smooth | 272 · 289 · 376 · 457 · 521 · 590ms |

Stagger entre linhas da nav: ~76ms nos ícones, ~80ms nos labels. O ícone
sempre entra antes do próprio label.

## Duas traduções que importam

1. **`fill-mode: forwards`, não `both`.** No Jitter, "Mode: In" significa que a
   camada não existe antes da própria animação. Com `both` o CSS aplica o
   primeiro keyframe já no frame 0 e tudo aparecia de uma vez. Com `forwards`
   vale o estado base (escondido) durante o delay, e a camada entra na hora
   certa. Foi a única diferença real entre a primeira tentativa e o original.
2. **Easings do Jitter.** "Smooth" (intensidade 50) é um ease-in-out simétrico,
   `cubic-bezier(.45,0,.55,1)`. "Slow down" é um ease-out,
   `cubic-bezier(.22,1,.36,1)`. Estão como variáveis `--smooth` e `--slowdown`
   no topo do arquivo.

## Como usar a página

- Abre com loop de 4s (mesma duração do artboard). Botões **Replay** e **Loop**.
- `seek(t)` no console congela a cena num instante exato, sem depender do
  relógio (aba em segundo plano estrangula animação CSS no Chrome, foi o que
  atrapalhou a primeira comparação). `resume()` volta a tocar.
- Foi assim que comparei frame a frame com o preview do Jitter: `seek(0.353)`
  aqui contra t=1,997s lá bate quase exatamente.

## Verificação

Comparados os frames em +0,25s · +0,35s · +0,50s · +0,75s · +1,10s contra o
preview do Jitter. A ordem de entrada, o stagger e o ritmo batem. Diferença
residual de ~10 a 15ms em algumas camadas, dentro do erro de medição dos
tempos de início.

## Pendências

- A animação está sobre a sidebar em DOM/CSS, não sobre o SVG exportado. Se a
  ideia for animar os SVGs de `svg-export-dark/`, dá pra portar: os mesmos
  keyframes funcionam em grupos `<g>` com `transform-box: fill-box`.
- Faltam as outras duas artboards do arquivo ("Animacao dashboard", 6,89s cada).
  Mesmo método, é só pedir.
