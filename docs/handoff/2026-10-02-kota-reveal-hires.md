# Kota: slider Low-fi / Handover em alta resolução

**O que mudou:** `projects/assets/kota-handover.jpg` e `kota-lowfi.jpg` re-renderizados de 1204×1001 (1x, JPEG muito comprimido, ~60KB) para 3840×3192 (3x, JPEG q82, ~800KB). Proporção idêntica, então o slider não muda de layout. Cache-bust em `kota.html`: handover `?v=6`, lowfi `?v=7`.

**Por que 3x:** a folha do case chega a ~1700px CSS em tela larga; em retina isso pede ~3400px de imagem.

**De onde saem as imagens** (servir `projects/assets/kota/` em localhost, Chrome headless via puppeteer, viewport 1280×1064, deviceScaleFactor 3, esperar ~6s pro mapa carregar):
- Handover: `bank-home-2026-09-11.html` com CSS injetado `.pagehead{display:flex!important;margin-top:4px}.kpis,.kpis .kpi,.row-map,.hero-chart,.needs-block{height:auto!important}`. O snapshot foi editado depois da captura original (saudação escondida, blocos com altura fixa); o CSS devolve o estado que a imagem publicada mostrava. O `margin-top:4px` alinha os cards com o low-fi no arraste.
- Low-fi: `bank-home-lowfi.html` sem alteração.

`bank-home.html` atual NÃO serve: o conteúdo evoluiu (Hello, N. Okonkwo / mapa escuro), não bate com o low-fi.
