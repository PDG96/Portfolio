# Kota, operator review: mapa com tipos e fluxo, e a metade de baixo do dashboard

Data: 2026-09-12
Arquivo: `projects/assets/kota/operator-detail.html`
Fontes: `~/Desktop/Dash.svg` (1440x2064), `~/Desktop/Form.svg` (1440x841)

## O que mudou

### 1. Mapa de Location

**Pin por tipo de site.** Cinco silhuetas, uma por papel: sede (prédio), concessão
(montanha), usina de lavagem (gota), depósito (caixa), trânsito (seta cruzando a
fronteira). Forma diz o tipo, cor diz o status. A concessão Rubaya é o único pin
vermelho porque é o único dentro da área de conflito.

**Hierarquia do HQ.** 38px contra 26px dos outros, anel claro na borda e halo
pulsante só nele. O HQ também foi retirado do agrupamento: Goma concentra três dos
cinco sites e o endereço registrado era o primeiro a sumir atrás do contador.

**Linhas de fluxo.** Três trechos na ordem declarada pelo operador (concessão, usina,
depósito, Ntaro). Os traços caminham no sentido da conexão. A direção foi conferida
no navegador, não presumida: engrossei a linha, congelei a animação e comparei
quadros no passo 0 e no passo 4 da sequência de dasharray. O padrão avança de oeste
para leste, ou seja na ordem das coordenadas. Os trechos são arcos porque três
trechos retos se empilhavam sobre a estrada que o basemap já desenha ali.

**Área de conflito.** Polígono de borda irregular sobre Masisi, com a Rubaya dentro.
Clicável pela área ou pelo rótulo; abre um painel ancorado no canto inferior esquerdo
do card, com botão de fechar. Não é popup do Mapbox: o mapa tem 270px de altura e
qualquer popup desse tamanho era cortado pelo overflow do card. O canto inferior
esquerdo é o único quadrante da vista inicial sem pin nenhum.

**Um selecionado por vez.** Popup de site e painel da zona se excluem. E o clique num
pin não abre mais o painel da área: marcadores são filhos DOM do container do mapa,
então o clique borbulhava para o handler do canvas, que encontrava o polígono embaixo
e trocava o popup do site pelo painel. Agora o handler ignora cliques originados num
`.mapboxgl-marker`.

### 2. Frame e sidebar

O frame passou de 650x350 para 1440x2064, a página inteira do Figma.

A sidebar é `position:fixed` com altura de viewport, e o app paga o espaço dela com um
padding da mesma largura. Passou por sticky antes, e sticky resolve contra o ancestral
que rola: funciona numa janela comum e não faz nada dentro de um frame tão alto quanto
o próprio conteúdo. O requisito é ver a barra inteira independentemente da altura da
página, e quem responde só à janela é `fixed`. Conferido no topo, no fim e numa janela
de 540px de altura: seis itens de navegação, engrenagem e avatar, todos na tela.

### 3. Tabela de formulários

Última coluna virou botão. Confirmed e Declined abrem como **View**, o resto como
**Review**. A coluna de status ganhou piso de 118px: como `1fr` puro ela crescia até
caber "Undetermined" e empurrava o botão para fora do card. Padding de linha caiu de
15 para 13px, senão a quinta linha ficava embaixo do scroll do card.

### 4. Shipments per month

Gráfico de blocos, um bloco por consignment, empilhado a partir da base. Dados lidos
pixel a pixel do SVG: Jan 3 (1), Fev 10 (5), Mar 7 (4), Abr 6 (3), Jun 9 (1), Jul 5
(2), onde o número entre parênteses é a parte laranja.

### 5. Declared volume

Doze barras, eixo 0 a 10 t, gradiente vertical como no Figma. Valores medidos das
alturas do SVG (gridlines a cada 61,2px, 30,6px por tonelada): 4.6, 5.9, 5.6, 5.9,
5.9, 5.7, 5.9, 5.9, 6.3, 6.5, 7.2, 6.7.

Os dois gráficos têm tooltip no hover, que é o padrão para gráfico em HTML.

### 6. Trade Relationships

Três nós a montante (pin azul, são sites), o operador no centro, dois a jusante
(ícone laranja, são organizações). As curvas são desenhadas a partir das caixas reais
dos nós via `getBoundingClientRect` e redesenhadas no ResizeObserver, então o grafo
sobrevive a qualquer largura de embed.

**Linhas animadas.** Mesmo recurso do mapa: traço caminhando no sentido da relação.
Aqui é `stroke-dashoffset` de 10 a 0 em loop, o que empurra o padrão para frente ao
longo do caminho. Verificado no navegador: congelei a animação em offset 16 e 8 e os
traços andaram para a direita, que é o sentido Matoro para Tantalux. Cada trecho tem
uma linha contínua embaixo para o vínculo não sumir onde cai um vão do traço.

**Ator clicável.** Clique no nó abre um painel com papel, relação, participação
declarada e última declaração, e acende a linha daquele vínculo. O nó do operador
acende todas, porque está em todas. Fecha no x, clicando fora ou no Escape.

O painel desvia do nó central em vez de aceitar a sobreposição: as faixas livres acima
e abaixo do nó do operador têm cerca de 150px cada, então o painel foi apertado para
143px de altura e escolhe a faixa do lado onde o próprio nó está. Comprador de baixo
abre para baixo, fornecedor de cima abre para cima.

### 7. Formulário KYC, read-only

Abre pelo botão da tabela. Mesmo conteúdo que o operador compilou no lado dele
(`flow-operator.html`), com a edição retirada: seções com contador (5/5 verde quando
completa, 4/7 neutra), campo com rótulo e caixa de valor, "Not provided" em itálico
para vazio, selo Read-only no cabeçalho.

O que o revisor pode fazer é comentar, e o comentário fica preso ao campo, não ao
formulário. É a unidade de que "Request updates" é feito. Um comentário vem semeado
no Tax identification number para o painel não abrir vazio. Rodapé conta o total.

Modal é `position:fixed`: centrado no frame de 2064px ele abriria fora da vista, e o
foco puxaria a página para lá.

### 8. Nota do score virou info button

O parágrafo "Geography and network are driven by the map..." saiu do corpo do card e
virou um (i) ao lado do título, que abre no hover e no foco de teclado.

### 9. Painel de identidade fixo, e um piso para o frame

O card do operador tem a altura da tela e fica parado enquanto o dashboard rola, com os
botões de decisão no rodapé da janela. É `position:sticky` ocupando todas as linhas da
grade, porque um item de grade só gruda dentro da própria área: uma área que terminasse
na tabela soltaria o painel no meio da página. Sticky e não fixed aqui porque a largura
vem das frações da grade, e um elemento fixo precisaria dessa largura calculada à mão.

O frame ganhou `min-width:1440px`. Abaixo disso nada comprime: a página rola na
horizontal. A 1100px o nome do operador quebrava em duas linhas e os nós do grafo se
sobrepunham ao nó central. Mesmo princípio dentro da tabela de formulários, que mantém
24px entre colunas e rola lateralmente quando o card é mais estreito que a soma delas.

Breadcrumb caiu para 13px numa faixa de 52px: a 15px tinha o mesmo peso dos títulos dos
cards e encostava neles.

### 10. Ícones dos pins vindos da biblioteca

Os glifos desenhados à mão saíram. Agora são Untitled UI, extraídos do arquivo da
biblioteca (`xD6AThdpPaZJQ8OU6yboqD`, página Icons): building-05 (sede), tool-02
(concessão), droplets-01 (usina), package (depósito), truck-01 (trânsito). Entram
inteiros, na grade de 24, escalados a 0.47 dentro da cabeça do pin: um glifo de 9.4
unidades numa cabeça de 14, com mais de 2 unidades de ar de cada lado. O traço sobe para
2.3 para manter a mesma espessura visual através da escala menor, então o ícone fica mais
calmo sem ficar mais fraco. Node ids, para quando precisar mexer: building-05 `3463:404952`,
tool-02 `3463:405120`, droplets-01 `3463:407104`, package `3463:404320`, truck-01
`3463:407044`, e as alternativas diamond-01 `3463:404814` e diamond-02 `3463:404817`.

### 11. Logo e modais de decisão

O logo do painel virou o vetor entregue (`Frame 1597880511.svg`, 48px): a marca dentro
do chip escuro, dois discos a 70% e o K atravessando a sobreposição. Entra inline, sem
raster.

Os três botões de decisão passaram a confirmar antes de decidir, com os mesmos modais do
business overview portados para a paleta escura deste arquivo:

- **Approve** mostra o que está em aberto antes de aprovar: score 62, 1 de 5 formulários
  confirmados, 1 de 5 sites em área de conflito. Os dois números ruins ficam em âmbar.
- **Request updates** conta os comentários reais que a pessoa deixou nos campos do
  formulário, não um rótulo. O contador lê o mesmo store que o modal de KYC escreve,
  porque é disso que o pedido é feito.
- **Decline** pede motivo e nota opcional, com o botão em vermelho.

Confirmar troca o estágio no painel (Approved, Updates requested, Declined, cada um com
seu par de cores) e dispara um toast de quatro segundos. Esc e clique no fundo fecham,
e o foco volta para o botão que abriu.

### 12. Ajustes finos e o estado depois da decisão

- Pin da sede virou **briefcase-01**. O building-05 tem três marcas de janela a 2px de
  distância na grade de 24, que viram um bloco cinza quando o glifo tem 13px. flag-01 era
  ainda mais leve e foi descartado por significado: "flagged" já quer dizer outra coisa
  nesta tela. building-08 lê como banco, que aqui é a outra ponta da relação.
- Botões de decisão em 14px, aplicado no `.btn` e não só nos três, para os rodapés dos
  modais acompanharem. O `.btn-sm` da tabela é outro controle e fica em 13.
- Breadcrumb em 10px.
- As setas saíram dos nós do grafo: prometiam um salto para outro lugar, e o que o nó faz
  é abrir o próprio painel ali mesmo.
- "Stage" virou **State**, o padrão é **Review**, e o campo subiu para o topo da lista do
  painel: onde a aplicação está é a primeira coisa que o revisor precisa.
- Concluída uma decisão, os três botões dão lugar a um só, **Settings**, que abre o popup
  do arquivo: três chaves (avisar quando o operador responder, copiar o compliance, manter
  o arquivo aberto ao desk de North Kivu) e **Reopen**, que devolve a decisão e traz os
  três botões de volta com o estado em Review.

Detalhe que custou um teste: `.btn` define `display`, o que ganha da regra `[hidden]` do
user agent. Sem `.btn[hidden]{display:none}` os botões escondidos continuavam na tela com
o atributo aplicado.

### 13. A rail virou navegação de verdade

Os seis discos vazios viraram destinos: Home, Registration, Evaluation (ativo), Clients,
Reports, Framework, com ícones Untitled UI que já estavam em `icons/` (home, file,
shield, users, chart, globe). Cada item é um quadrado de 36 com raio 9. Hover levanta o
fundo e acende o ícone; o ativo fica aceso e ganha um marcador laranja de 2px na borda da
própria rail. Engrenagem no rodapé usa o mesmo componente, e cada um tem `title` além do
`aria-label`.

O avatar "NO" saiu e no lugar entrou a marca do operador na variante clara
(`Frame 1597880872.svg`). O arquivo entregue traz o desenho embutido como imagem
rasterizada; reconstruí em vetor com a mesma geometria do logo de 48, mapeada na caixa de
38 do asset (`translate(5.5 8.25) scale(0.7988)`), então fica nítido em qualquer tela.

### 14. Header no topo, e o fim da coluna da esquerda

O painel do operador saiu da lateral e virou header. Nome, estado e endereço à esquerda,
as três tags à direita. Dois estados: em repouso o header respeita o mesmo recuo de 24px
dos cards; assim que a página se move por baixo dele, a barra sangra até as bordas e ganha
sombra. `position:sticky` com uma classe trocada no scroll, e o breadcrumb viaja junto,
porque breadcrumb e identidade são a mesma pergunta: onde você está.

O grid perdeu a primeira coluna: agora são 998 e 316 em vez de 258, 715.5 e 316.5, e a
largura da coluna do operador foi toda para o card de Location, como no desenho.

Também saiu o `aspect-ratio` do frame. Com três painéis de alturas diferentes não existe
mais uma altura única para dividir, então cada banda mantém a altura em que foi desenhada
e a página cresce conforme o painel aberto.

**Onde cada coisa foi parar** (provisório, até você me passar o conteúdo de cada tag):

- **Insights**: Location, Overall risk score, os dois gráficos, Trade Relationships, e a
  barra de decisão no fim. A decisão fecha o painel de evidência: as provas acima, a
  chamada no fim.
- **Detailed Information**: a faixa de identidade registrada (ID. NAT., país de origem,
  países associados, que perderam a coluna da esquerda) e a tabela de formulários, cujo
  título já era esse.
- **Settings**: as chaves do arquivo e o Reopen. O modal de settings foi removido, já que
  agora existe uma seção com esse nome; o botão que aparece depois da decisão leva para a
  aba em vez de abrir diálogo.

### 15. Header em duas linhas, e a página de detalhes deixando de ser só uma mesa

As tags desceram para uma linha própria sob o título, e o canto superior direito ficou
com a decisão: três botões de ícone, x para recusar, balão para pedir atualização, check
para aprovar. Cada um carrega `title` e `aria-label`, porque ícone não é palavra, e menos
ainda no que fecha o arquivo. A barra de decisão no fim do Insights saiu: a decisão agora
mora junto do nome a que se aplica.

**Registered identity** subiu para o Insights e ganhou o resto do que já existia nas
respostas de KYC: número de registro, data de registro, categoria, subcategoria, nome
registrado e sites declarados, além de ID. NAT. e as bandeiras. Nada inventado, tudo
vindo dos mesmos dados que os formulários carregam.

**Colunas da tabela** passaram de largura fixa para frações com piso. Com o card agora do
tamanho da página inteira, as colunas fixas deixavam a linha amontoada à esquerda e um
terço do card vazio. Cada trilho mantém o mínimo que o conteúdo precisa, então abaixo
disso a tabela volta a rolar em vez de espremer.

**Card de settings** virou card normal: largura cheia, 24px de padding, e o conteúdo numa
medida centrada de 640px, porque uma linha de chave com 1300px joga rótulo e controle em
pontas opostas da tela.

**A página de detalhes ganhou duas coisas além da mesa**, ambas lidas das mesmas cinco
linhas em vez de escritas ao lado delas:

- **Review progress**: quantos formulários confirmados, a média de preenchimento, e uma
  barra de cinco segmentos coloridos pelo estado de cada um, com 2px de card entre eles
  para a fronteira ser um vão e nunca uma cor emprestada. Os números saem do DOM da
  tabela, então a barra não consegue afirmar algo que a tabela desminta.
- **Open comments**: a lista dos comentários deixados em campos específicos, com o campo
  a que pertencem e um botão que abre o formulário. Lê o mesmo store que o modal de KYC
  escreve, e atualiza quando um comentário novo é criado.

### 16. Hover em tudo que é clicável

Passei o arquivo inteiro procurando controle sem resposta ao mouse. Faltava em quatro:
as chaves do settings, o ícone de filtro no cabeçalho dos cards, as tags inativas do
segmented control (só trocavam a cor do texto) e as linhas da tabela, que carregam um
botão e não diziam qual linha ia ser acionada. A regra do segmented control também
repintava a tag ativa no hover; agora é `:not(.is-on)`.

Ordem dos ícones de decisão: pedir atualização, recusar, aprovar. Recusar e aprovar ficam
lado a lado, com o primário na ponta.

### 17. O hover existia e não se via, e mais limpeza

Os estados de hover estavam todos lá, e todos com 6 níveis de diferença sobre o fundo
escuro, o que na prática é invisível. Subi para cerca de 20 níveis e dei borda mais clara
junto: #34363A nos botões e caixas, #2E3033 nas tags e na rail, e os dois botões com cor
própria agora clareiam o próprio tom em vez de aplicarem filtro.

Saíram os três ícones de filtro e o kebab dos cards: prometiam uma ação que a tela não
entrega.

A faixa de identidade passou a `space-between`, ocupando o card inteiro, e perdeu ID.
NAT., Registered name e Registered since.

Os três componentes do score ganharam tooltip próprio, no mesmo componente do (i) do
título: o que cada um conta e por que está no valor em que está.

O painel da área de conflito abre onde foi clicado, não mais no canto. Ele foi parar no
canto quando o mapa tinha 270px de altura e qualquer painel aberto dentro dele era
cortado; o card agora é metade da página, então a restrição sumiu. O clamp mantém o painel
inteiro dentro do mapa quando o clique é perto da borda.

A rail ganhou a linha de 1px que separa ela do dashboard, em #202122, amostrada do SVG.
E o breadcrumb virou Evaluation › Operators › Kivu Minerals.

### 18. Settings deixou de parecer um diálogo

Era uma coluna estreita centrada, a única tela do produto com esse formato. Agora usa a
mesma grade de duas colunas das outras, com quatro cards e conteúdo alinhado à esquerda:

- **Notifications**: o que chega e quando, três chaves, com uma nota de para onde vai.
- **Access**: quem lê o arquivo, com papel ao lado do nome, mais a chave de manter o
  arquivo aberto ao desk.
- **Review**: reabrir a revisão e reatribuir a outro revisor.
- **Record**: baixar o registro da decisão e exportar os formulários compilados. Na coluna
  estreita o controle desce para baixo do texto e ocupa a largura do card, porque em linha
  a frase ficava espremida numa sarjeta.

**Reassign, Download e Export ainda não fazem nada.** São os únicos controles inertes da
tela; se quiser, viram modais como os de decisão.

Saiu também a barra laranja na lateral esquerda dos blocos de comentário, nos dois lugares
onde ela existia: na lista de Open comments e nas notas dentro do formulário.

## Decisões que precisam da Pietra

1. **Maio não existe no Shipments per month.** No SVG as seis colunas são Jan, Fev,
   Mar, Abr, Jun, Jul, igualmente espaçadas. Construí como está desenhado. Se maio
   deveria estar lá, preciso do valor: inventar um número não é opção.

2. **O que as duas cores significam.** O SVG não traz legenda. Usei laranja para
   "Rubaya concession" e claro para "Other sites", que amarra o gráfico ao mapa e ao
   componente de geografia do score. Se a divisão pretendida era outra (documentado
   versus pendente, por exemplo), é troca de duas strings.

3. **Contraste do rótulo CONFLICT ZONE.** Sem a sombra que você pediu para tirar, o
   texto fica em #F97066 sobre o preenchimento rosa claro. Dá para escurecer só o
   texto mantendo a família.

4. **O card de identidade à esquerda** vai até o fim da segunda banda (rows 1 a 2). No
   Figma ele termina ~200px antes. Mantive esticado porque o vazio embaixo some.

## Verificado no navegador

Direção do dash, seleção da área pela área e pelo rótulo, fechar no x e clicando
fora, clique em pin dentro e fora da zona, sidebar fixa ao rolar, cinco linhas da
tabela com os botões dentro do card, tooltip dos dois gráficos, grafo redesenhando no
resize, modal abrindo dos cinco formulários, comentário novo aparecendo no campo com
contador no rodapé, Escape fechando com foco voltando ao botão de origem.

## Nota de método

Rodei o validador de paleta da skill de dataviz no par do waffle
(`#E8723F,#DBE0E9` sobre superfície escura). Separação CVD 24.7 e normal 28.1, ambas
bem acima do piso, contraste acima de 3:1. Os dois FAILs que ele aponta (faixa de
luminosidade e piso de croma) são de paleta categórica, em que toda cor é uma
identidade. Aqui não é isso: é acento contra neutro, o padrão de destaque, que é o que
o Figma desenhou. Mantive as cores e adicionei a chave de duas entradas no card, que a
própria skill exige a partir de duas séries.
