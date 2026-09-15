# Briefing de site em pietragottardo.com/briefing

Data: 2026-09-15
Arquivos: `briefing.html`, `functions/api/briefing.js`, `_headers`

## O que é
Formulário de briefing pra orçamento de site, em seis seções, na identidade do
site (tokens, Lausanne, grain, seg no pé, cursor). Nasceu como artifact
(claude.ai/artifact/2nLhoTLAmEr3gMXDNgxkvD) e foi movido pra cá porque o
artifact não consegue guardar respostas de gente de fora da organização.

## Como chega até você
- A página não aparece em lugar nenhum do site: sem card, sem item no seg,
  sem link. Só quem receber a URL abre. `_headers` manda `X-Robots-Tag:
  noindex` e a página carrega `<meta name="robots" content="noindex">`.
- O botão **Enviar briefing** faz POST em `/api/briefing`
  (`functions/api/briefing.js`), que manda o texto por Resend pra
  `pietragottardo@gmail.com`, com `reply_to` no e-mail do cliente. Mesma
  chave `RESEND_API_KEY` do `/contact`, nada novo pra configurar.
- Assunto: `Briefing de site: <empresa>`; se faltou obrigatória, o assunto
  diz quantas (`(2 obrigatórias em branco)`).
- Se o envio falhar, o cliente vê o aviso e tem **Copiar texto** + o mailto
  como caminho de reserva.
- Rascunho fica em `localStorage['briefing-v1']`; a seção aberta em
  `sessionStorage`. Tema lê a mesma chave `theme` do site.
- **Anexos** (último campo de Técnico): até 3 arquivos, 10 MB no total,
  vão como attachment do próprio e-mail via Resend (limite deles é 40 MB).
  Nada é guardado em lugar nenhum. Os arquivos ficam só na memória da aba:
  fechou, precisa escolher de novo (o resto do rascunho continua salvo).
  Com anexo, a página manda `multipart/form-data`; sem, JSON. A function
  aceita os dois.

## Decisões
- Light-native como as case pages (`:root` claro, dark por sistema ou
  toggle). É um formulário que o cliente preenche.
- Listas ruled no lugar de cards, como o Get in touch.
- Wordmark "Pietra Gottardo." leva pra home (`/`).
- Perguntas novas: "O que o site de hoje não resolve", "As imagens do site",
  "Quem cuida do site depois do lançamento". A pergunta de dados ficou só em
  Conteúdo; no checkbox de funcionalidades virou "área com dados ao vivo".

## Pra você conferir
- O texto "Os projetos começam em 1 mil" na faixa de investimento é o que
  veio do artifact. Não sei se vale pra EUR/USD/GBP também.
- O artifact continua no ar com a mesma cara, mas sem o envio automático.
