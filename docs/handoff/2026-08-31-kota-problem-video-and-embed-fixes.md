# Handoff: Kota, video do problem statement + fixes no embed

Data: 2026-08-31
Quem: Claude (sessao com a Pietra)

## O que mudou

### 1. Problem statement virou video em loop (primeira media do case)
- `projects/kota.html`: a figure `app-shot--board` com `kota-problem-statement.png` foi substituida por uma figure `app-shot--video` com `assets/kota-problem-statement.mp4`, mesmo padrao do bento (`autoplay muted loop playsinline preload="metadata"`).
- Decisao: mp4 em loop em vez de GIF. Os cards metalicos tem gradientes suaves; GIF (256 cores) gera banding e ficaria 5-10x mais pesado. O site ja usa esse padrao no bento.
- Encode: fonte `Desktop/Videos Kota /Kota problem statement.mov` (1502x1046, h264, 60fps, 8.84s, 7.0MB) -> h264 crf20 preset slow, sem audio, `+faststart`. Resultado: 715KB.
- Trim a pedido da Pietra: o conteudo dos cards termina de sumir em ~7.1s; cortado em **7.25s** pra deixar so ~0.15s de cards em branco antes do loop reiniciar (antes eram ~1.8s em branco).
- Aria-label atualizado pro conteudo novo (39% adultos com conta / EU importer 3TG due diligence / 8.7% firms com credito). Figcaption `fig_problem` mantida.
- O PNG antigo (`assets/kota-problem-statement.png`) ficou sem referencia; mantido no repo por enquanto.

### 2. Hint "Interactive · click and scroll inside" agora persiste ate o clique
- Antes: sumia apos 2.2s ou em wheel/tecla/toque.
- Agora: fica ate o primeiro clique/tap no frame (`pointerdown`; `keydown` tambem dispensa, pra quem navega por teclado). Timeout e listener de wheel removidos.
- So `projects/kota.html` tem esse componente (verificado por grep), nada a propagar.

### 3. Erros de alinhamento no embed business-overview (reportados pela Pietra com prints)
- `assets/kota/business-overview.html:47` — `.applicant` era `sticky; top:108px`, mas a posicao natural do card e 88px (topbar 64 + padding 24). O sticky engatava em repouso e empurrava o card do applicant 20px abaixo dos cards da direita. Corrigido pra `top:88px`. Medido no browser: 88 = 88.
- `assets/kota/business-overview.html:101` — `.ring .gauge + .val` tinha `padding-top:40px`; o bloco "78 / of 100" invadia ~7px o arco no apice. Ajustado pra `padding-top:52px`, que centra o bloco exatamente no miolo do semicirculo (area interna 59-105 do viewBox). Verificado com zoom no browser.
- Padroes checados nos outros embeds (bank-registration, details-hub, operator-application, operator-signin, kota-kyc): nao existem la.

## Atencao / pendencias
- **Cache local**: o preview antigo rodava num server Python sem cache headers; o Chrome guardou o HTML dos iframes com cache heuristico. Se o embed aparecer desalinhado ainda, e cache — hard refresh (cmd+shift+R). Troquei o server local pra `npx http-server` na porta 8742 (suporta range requests, que os `<video>` precisam pra seek).
- Videos nao pintam em aba oculta do Chrome (visibilityState hidden) — comportamento normal do browser, nada a corrigir.
- Nada commitado; working tree do portfolio ja tinha mudancas antes desta sessao.

### 4. Documento do usecase (pedido no fim da sessao)
- Case narrativo da pagina viva compilado num documento: https://claude.ai/code/artifact/a803d551-9659-4bc3-b837-25019fe9150b
- Fonte: copy EN atual de projects/kota.html (nao o draft v2 de _case-studies/kota, que tem pendencias marcadas). Abre com o video novo do problem statement embutido; midias interativas viram "plates" descritivas com as figcaptions reais.

### 5. Ajustes pos-review da Pietra (mesma noite)
- Gauge do business-overview: removido o "of 100" de dentro do anel (pedido dela, pra eliminar o bug de sobreposicao com o arco em dark). O "78" sozinho centra no miolo com o mesmo padding-top:52. "of 100" segue no tooltip e no painel Decision (sao texto, sem bug).
- Tag "Live" (`.embed-tag`) removida dos dois embeds de kota.html (pedido dela). CSS da tag ficou orfao no arquivo; chaves hint_tag dos dicionarios idem, sem efeito.

### 6. Card de recomendacao virou "AI assistant" (business-overview)
- O card laranja com escudo ("Recommended: approve with conditions") lia como alerta. A pedido da Pietra virou um fluxo de assistente: o analista pede a leitura.
- Interacao: pill "Read this file and suggest a verdict" (com sparkle) -> skeleton shimmer ~1s -> chip "Approve with conditions" + texto em streaming palavra a palavra -> nota "Assisted by AI agent · the decision stays with the analyst" com fade.
- Container com borda em gradiente sutil (accent -> border), sem o wash de alerta. prefers-reduced-motion: tudo instantaneo.
- Bug corrigido no caminho: `hidden` nao escondia o botao porque `.ai-ask{display:flex}` vencia o UA style; resolvido com `.ai [hidden]{display:none!important}`.
- Copy mudou de "Recommended:" pra "Suggested" no chip; texto da leitura mantido.

### 7. Modernizacao do business-overview (pedido: "moderniza")
Sensacao "anos 2010" diagnosticada e atacada em 4 frentes (so forma; tokens/paleta compartilhados intactos):
- Gauge: stroke 16 -> 6, numero 28 -> 34px peso 600. O arco fino deixa o numero dominar.
- Risk distribution: donut grosso (stroke 38) -> barra empilhada fina (10px, segmentos arredondados com gap) + lista 2x2 com dot, label e numero 16px. Tooltips por segmento preservados.
- Decisao: primaria solida unica (Approve, com sombra), "Approve with conditions" tonal (border-soft), "Reject" ghost com hover bad-bg. Sem bordas 1px, radius 10.
- Densidade: cards radius 12 (scoped), tabular-nums no body do embed.
Nao alcancado daqui: o video do bento (kota-bento.mp4) e o cover ainda mostram o donut/gauge antigos - sao capturas do produto. Re-capturar se a coerencia incomodar.

### 8. Problem statement: video -> imagem nova (pedido da Pietra)
- A figure `app-shot--video` com kota-problem-statement.mp4 voltou a ser `app-shot--board` com imagem, agora a arte nova (screenshot do Figma, Desktop 21.40.06): layout 2 colunas, headline a esquerda com fontes, cards a direita (bolha 39% adults, card laranja, card escuro "a bank loan is the exception") com bleed no topo/rodape.
- Aparei 8px do rodape do screenshot: tinha uma linha roxa de selecao do Figma na borda.
- Asset: sobrescrevi projects/assets/kota-problem-statement.png (antigo esta no git) e referencio com `?v=2` pra furar cache (padrao da casa, tipo handheld-ipad.jpg?v=3).
- Legenda fig_problem: fontes atualizadas pra "Sources: World Bank Global Findex 2025 · EU Regulation 2017/821." nas 3 ocorrencias (inline + 2 dicionarios), porque a imagem cita Global Findex 2025 e a EU Reg, nao mais Enterprise Surveys 2024.
- kota-problem-statement.mp4 ficou sem referencia no repo (mantido em disco caso volte).

### 9. Modernizacao REVERTIDA (pedido: "volta o dashboard como tava antes")
- Secao 7 desfeita por inteiro: gauge stroke 16 + numero 28px, donut original (stroke 38) + legend, botoes de decisao com borda (outline/bad-bg), sem radius 12/tabular-nums.
- Mantidos (pedidos anteriores dela): sticky 88px, "of 100" removido do anel, bloco AI assistant, sem tag Live.

### 10. Problem statement: imagem -> video em loop perfeito (Esse.mov, 2026-09-01)
- Fonte: Desktop/Esse.mov (1504x1054, 60fps, 10.26s, 8.3MB): a arte nova animada, headline fixo e 3 cards ciclando a direita.
- Loop: corte ingenuo (fim vs frame 0) dava PSNR 26dB com "pop" visivel na bolha dos 39%. Busca pairwise em 615 frames achou o ciclo real: frame 126 (t=2.10s) == frame 592 (t=9.87s), PSNR 39.9dB (residuo = anti-aliasing subpixel). Trim frames 126..591 -> 7.77s, emenda cai dentro do hold do card dos 39%.
- Encode: h264 crf20 slow, sem audio, faststart -> 409KB. Sobrescreve assets/kota-problem-statement.mp4; referenciado com ?v=2.
- Figure voltou a app-shot--video; aria-label descreve a versao animada. Legenda fig_problem (Global Findex 2025 · EU Reg 2017/821) segue valida.
- kota-problem-statement.png (?v=2, a versao estatica desta mesma arte) ficou sem referencia; mantido em disco.

### 10b. Ajuste do loop: card claro com tempo igual aos outros
- Feedback da Pietra: o card claro (39%, circulos) ficava pouco em tela. Causa: o corte 126..591 entrava no fim do hold dele (0.3s + settle, vs ~3s do laranja e ~2.5s do escuro).
- Novo trim: frames 34..591 (inicio do hold do card claro, mesma pose estatica do frame 592, PSNR conferido). Loop de 9.30s; card claro volta a ~2.4s de tela. Referencia bump pra ?v=3.

### 10c. Loop final com captura nova (entrada e saida completas)
- A Pietra regravou comecando e terminando no card claro VAZIO (Screen Recording 2026-09-01 11.28.50, 1478x1034, 13.68s). Isso resolve a limitacao das versoes anteriores: agora toda entrada/saida de card existe na captura.
- Corte: frames 15..819. O frame 819 == frame 15 (empty card, PSNR 34.7dB, residuo = anti-aliasing de texto; sem cursor). Aparei o pre-roll do inicio (dead time entre record e play) deixando ~0.5s de respiro no estado vazio na emenda.
- Resultado: loop de 13.42s, todas as entradas e saidas visiveis, emenda invisivel. Encode crf20 faststart. Referencia ?v=4.

### 10d. "Travando, nao ta em loop": causa era o server local
- O arquivo estava certo (teste mecanico: seek pro fim -> atravessa a emenda e continua). O sintoma vinha do preview da Pietra: localhost:8765 rodava `python -m http.server` (sem range requests). Sem Accept-Ranges o Chrome trata video como stream nao-seekavel: toca uma vez e congela no ultimo frame, sem loop.
- Fix: matei o python (PID 10482) e subi `npx http-server -p 8765` no mesmo diretorio/porta; agora responde 206. O 8742 (meu preview) tambem segue de pe. Ha outro python server em 8903 servindo o portfolio COM ranges; deixei quieto.
- Obs: o server antigo tambem era a fonte dos caches heuristicos teimosos (HTML/iframes velhos). Depois da troca, um hard refresh limpa.

### 10e. Trava no 2o round (claro -> laranja): cache truncado
- Sintoma: loopava e congelava sempre no mesmo ponto do segundo round. Hipotese: o ?v=4 foi baixado pela primeira vez ainda via python server; ao matar o server a resposta ficou truncada no cache do Chrome, e no wrap o playback bate no fim do corpo truncado.
- Fix: bump pra ?v=5 (URL nova = fetch limpo pelo server com ranges). Arquivo em disco identico e integro.

### 10f. Trava real encontrada: jank NA captura + reparo provisorio (v6)
- Com cache descartado (?v=5 limpo e ainda travando), analise frame a frame do rec2 mostrou: a transicao claro->laranja tem 4 freezes gravados (417/567/267/567ms) E um buraco de captura (salto de posicao entre frames 207-212; o inicio do slide nao foi gravado). As outras transicoes estao limpas. E jank do playback/captura no primeiro slide apos o record.
- Tentativas: minterpolate (mci) gerou ghosting feio em flat design; descartado. Crossfade 0.23s ficou limpo, mas e um fade onde as outras transicoes sao slides - aceitavel como PROVISORIO.
- v6 = [frames 15..190] + xfade 14f + [212..819], 13.3s, emenda de loop preservada. Validado: zona do splice sem freeze-runs e sem spike.
- Fix definitivo: export renderizado direto do Jitter (sem captura de tela). Em andamento na sessao.
- Update: export do Jitter descartado por decisao da Pietra (free = 720p/30fps + marca d'agua; ela nao paga o plano). Estado atual: v6 (crossfade) no ar. Definitivo: regravacao com warm-up (rodar a animacao 1x antes de gravar, fullscreen, sem apps pesados) e remontagem do loop.

### 10g. FINAL: corte da Pietra no CapCut (v8)
- A Pietra cortou ela mesma no CapCut (Desktop/0901/0901.mov, 3078x2160 30fps, 11.13s): um ciclo completo, pontas repouso->repouso (PSNR 30.2), holds ~2s cada, sem freezes de jank. Dois jump-cuts deliberados dela (f111 e f208, saida de pausa direto pro meio do movimento) mantidos.
- Aparada a linha roxa de 2px no topo (cropdetect). Encode: crop + scale 1600w, crf20, 30fps, faststart. Referencia ?v=8.
- Historico completo da saga do loop nas secoes 10-10f. Fontes intermediarias (esse.mov, rec2, esse2) analisadas e descartadas por jank de captura na transicao claro->laranja.
- v9: +4px aparados de cada lado a pedido da Pietra (1592x1112).
- Removidos a pedido dela (2026-09-02): secao 'One pattern carries every app' inteira do kota.html (incl. embed bank-registration) e o bloco AI assistant do business-overview (markup+css+js). Chaves i18n/CSS orfaos mantidos sem efeito.
- Embed do kyc (business-overview) expandido pra largura total (max-width 1500px -> none) pra alinhar com o video do bento acima, a pedido dela.
- Cards dos atores (Three actors) trocados de paragrafo pra estrutura PAIN/NEED/GOAL (dl .actor-png, i18n EN/PT novo; _d antigos orfaos). Copy destilado do proprio case, pra Pietra avaliar no preview. PT e rascunho meu, revisar.
