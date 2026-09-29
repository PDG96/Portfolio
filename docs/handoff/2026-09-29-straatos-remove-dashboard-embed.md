# Straatos: protótipo do dashboard sai da seção Application

**Data:** 2026-09-29
**Pedido:** Pietra pediu pra remover o protótipo interativo do dashboard (iframe em moldura de browser, `app.straatos.io/dashboard`) do case do Straatos.

## O que mudou
- `projects/straatos.html`: removida a `<figure class="app-shot--browser">` com o iframe `assets/straatos-dashboard/dashboard.html`.
- Removidas as strings `fig_dashboard` (EN e PT-BR).
- Intro da seção ajustada: "Five surfaces" virou "Four surfaces" e caiu a frase sobre o dashboard ancorar no globo 3D, já que ele não aparece mais. Copy nova em EN e PT-BR; Pietra pode reescrever o tom.

## O que ficou
- O asset `projects/assets/straatos-dashboard/` continua no repo (não é servido por nenhuma página).
- CSS `.app-shot--browser` / `.browser-*` e o script de escala do `.embed-iframe--app` ficaram; o script sai cedo quando não há iframe. Se o embed não voltar, dá pra limpar depois.

## Conferência
- Página servida localmente e aberta no Chrome: a seção Application abre direto no bento de análise, sem buraco de layout.
