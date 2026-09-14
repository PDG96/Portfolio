# KOTA · lado do operador, troca de persona e responsividade

Data: 2026-09-13
Arquivos: `projects/assets/kota/`

Fecha as duas listas de requisitos. O que segue é o que existe agora, por que
está assim, e o que ficou em aberto pra você decidir.

---

## 1. O produto agora tem dois lados e uma porta de entrada

| Tela | Arquivo | Quem senta ali |
|---|---|---|
| Escolha de assento | `start.html` | ninguém ainda |
| Home do banco | `bank-home.html` | Meridian Bank |
| Evaluation | `evaluation.html` | Meridian Bank |
| Ficha do operador | `operator-detail.html` | Meridian Bank |
| Overview do operador | `operator-home.html` | Kivu Minerals |
| Your information (formulário) | `operator-form.html` | Kivu Minerals |
| Your applications | `operator-applications.html` | Kivu Minerals |
| Application detail | `application-detail.html` | Kivu Minerals |

`start.html` é a única tela sem rail: duas fichas, uma por assento, com o que
cada lado enxerga e o que pode fazer. A escolha grava `localStorage['kota-seat']`
e o botão no pé do rail troca de assento de qualquer tela, nos dois sentidos.
Não existe caminho sem volta entre os dois fluxos.

### Shell compartilhado
`operator-shell.css` + `operator-shell.js` carregam o rail, o sino, o popover de
assento, a tooltip e o header grudento das quatro telas do operador.
`buildOperatorRail(current)` recebe só qual item está ativo. Nada nesse par de
arquivos sabe do conteúdo de uma página, então mexer no rail é mexer em um lugar.

---

## 2. Um registro, duas leituras

As duas perguntas que o revisor deixou são o fio que costura os dois lados:

- na ficha do banco aparecem em **Open comments**, presas ao campo;
- na Overview do operador aparecem como **o trabalho a fazer**, com o botão que
  leva direto ao campo;
- no formulário aparecem **coladas no próprio campo**, não num painel lateral;
- no Application detail aparecem dentro da seção como o banco recebeu.

O texto é o mesmo nos quatro lugares. Reescrevi as duas frases porque estavam
divergindo entre telas e uma delas estava escrita pro próprio banco ler
("Ask the operator to…"), o que soava estranho na tela do operador:

- Tax: *"This answer is blank. Attach the tax certificate so this section can be confirmed."*
- VAT: *"A VAT number is mandatory for exporters. Add it before the next review."*

A ficha do banco só carregava **uma** das duas perguntas, enquanto o resto do
produto contava duas (incluindo o feed da Home). Corrigido: agora são duas nos
dois lados.

---

## 3. Responsividade

`responsive.css`, carregado por último nas sete telas de app. As classes são
compartilhadas entre elas, que é o que faz um arquivo bastar. Três decisões
carregam o resto:

1. **O rail vira barra inferior.** 54px são 14% de uma tela de 390 e ficam fora
   do alcance do polegar. Embaixo são os mesmos destinos, na mesma ordem.
   Os itens desativados **continuam lá**, apagados: eles falam do tamanho do
   produto, e sumir com eles faria as duas versões discordarem.
2. **Toda grade vira uma coluna, em ordem de leitura.** As telas já são escritas
   com a primeira coluna sendo o argumento e a segunda o aparte, então empilhar
   preserva o sentido.
3. **Tabelas deixam de ser tabelas.** Cada linha vira bloco com o nome primeiro;
   os valores se explicam sozinhos (uma tag diz o estado, uma barra diz a
   fração, uma data é uma data), então nenhum rótulo precisou ser inventado.

Ajustes específicos que valem registro:

- **Trade Relationships**: lado a lado, a posição dizia a direção do comércio.
  Empilhado, isso se perde, então os dois grupos ganham rótulo (`Upstream` /
  `Downstream`) só no mobile.
- **Gráfico de 12 meses da Home** (`bank-home.html`): era um SVG com
  `viewBox` fixo e `preserveAspectRatio="none"`, ou seja, o texto era esticado
  pela razão que o card tivesse. No celular os nomes dos meses viravam lascas.
  Reescrevi pra desenhar na largura real do card: 11px continua 11px em qualquer
  largura, e abaixo de ~26px por mês ele rotula mês sim, mês não, terminando em
  dezembro, que é o mês dos dois pontos e dos números da legenda. A geometria
  (24px de ar à direita) é a mesma que estava desenhada à mão.
- **Contagens**: ficam duas por linha mesmo no celular. Quatro cards de largura
  total seriam 400px de rolagem antes da página dizer qualquer coisa; o que cede
  é a linha dentro do card, que desempilha.

Checado em 390px e 820px nas oito telas: nenhuma rola de lado
(`scrollWidth == viewport` em todas).

---

## 4. Bugs encontrados e corrigidos no caminho

- **O mapa da ficha do operador estava morto.** Quando os ícones saíram dos
  pins, sobrou um bloco de comentário sem fechar, que engolia `pinSvg`,
  `tooltip` e o começo do handler de `style.load`. O `try/catch` escondia isso
  atrás do cartão "Map unavailable". Comentário reescrito, mapa de volta.
- **`.docs .n` / `.docs .s` eram spans inline** no formulário, então o nome do
  documento e o seu meta saíam grudados numa linha só. Viraram bloco.
- **Texto do fallback do mapa** dizia "precisa rodar sobre http", o que era
  falso (estava em http). Trocado por algo verdadeiro.
- **Travessões**: varri as oito telas. Saíram dos `<title>`, da copy do
  `start.html` e dos nomes de documento. Os que sobram estão só em comentários
  de código. Os traços que marcavam célula vazia viraram texto que diz o que
  falta: `Not scored`, `Not submitted`, `No reviewer`, `Not assigned`.

---

## 5. O case agora abre no protótipo, e só nele

`projects/kota.html` tinha quatro telas interativas: `business-overview.html` e
os três `flow-*` da seção "The Pipeline, Live". Saíram todas. No lugar entrou
uma seção só, com um embed:

- label **The Prototype, Live**
- título **"Sit as the bank, or as the operator."**
- o embed é o próprio `start.html`, ou seja, a primeira coisa que aparece já
  são os dois assentos lado a lado, com o que cada um vê e o que pode fazer.

A seção antiga foi removida inteira porque a copy dela ("One record, three
seats", o agregador recebendo a verificação) descrevia exatamente as telas que
saíram; deixar o texto seria descrever algo que não está mais na página. As
chaves `pipe_*` do dicionário viraram `proto_*` em EN e PT. O site está preso em
inglês hoje (`let lang = 'en'`, o controle EN/PT foi removido), mas as duas
línguas estão preenchidas.

Dois detalhes que fazem isso funcionar:

- **Assento clicado dentro do embed abre em aba nova.** A coluna do case tem
  ~1023px e as telas do app são desenhadas pra 1440. `start.html` detecta que
  está em iframe e usa `window.open`; aberto sozinho, navega no lugar como
  sempre. Uma linha aparece só no embed avisando disso.
- **O frame mede o que desenha.** Todo outro embed do case é composição fixa,
  então uma razão basta. Esse é uma página cuja altura depende da largura que
  recebe: lado a lado os assentos são uma linha, empilhados são duas. Um
  `ResizeObserver` lê a altura real do conteúdo (mesma origem) e dá ao frame
  exatamente ela, com a altura do CSS como piso caso o script não rode.

Os arquivos das telas antigas continuam em disco, sem referência de nenhuma
página viva. Não apaguei: os handoffs anteriores falam deles, e voltar atrás é
uma linha.

---

## 6. O formulário virou dois grupos: KYC e Management systems

O rail de seções agora tem duas metades, porque o arquivo responde duas
perguntas diferentes. KYC é quem a organização é, coisa que um registro
consegue atestar. Management systems é como ela roda a cadeia, coisa que só ela
responde. Numa lista plana de nove isso sumia, e sumia junto o motivo da
segunda metade ser a que tem trabalho sobrando.

**KYC** (15 de 17): Identification, Registration (as 2 perguntas do banco),
Governance, Scrutiny.

**Management systems** (8 de 19): Supply chain policy, Internal structure,
Chain of custody, Supplier engagement, Grievance mechanism.

Esses cinco não foram inventados: são os cinco pontos do **Passo 1 do OECD Due
Diligence Guidance for Responsible Supply Chains of Minerals from
Conflict-Affected and High-Risk Areas** (política, estrutura interna, controles
e rastreabilidade, engajamento com fornecedores, mecanismo de reclamação). É o
framework que a **Regulação UE 2017/821** exige dos importadores, que já é
citada no vídeo de problema do case. Por isso um banco pede isso de um operador.

Detalhes de construção:

- **As contagens são derivadas dos campos**, nunca escritas ao lado deles. Um
  campo conta como respondido se tem valor, uma escolha marcada ou um documento
  anexado. Número escrito à mão ao lado do dado é número que desencontra na
  primeira vez que um campo entra.
- Isso corrigiu de brinde o `Registration 4 of 7`, que na verdade era 5 de 7.
- **Campo sem resposta agora tem forma**: escolha sem opção marcada, e linha de
  documento vazia com "Nothing attached yet · Attach". A falta fica visível em
  vez de ausente.
- Cada grupo carrega a própria contagem no cabeçalho, e o painel da direita diz
  em qual metade você está.

### O número mudou, e propaguei

Com as 19 respostas novas, o arquivo passa de 74% para **64% (23 de 36)**.
Atualizei onde esse número aparece: KPI "Your file" da Overview, a barra da
tabela de applications e o card do Meridian Bank em Your applications.

Aproveitei pra matar uma contradição: a Overview dizia **"3 of 5 forms
confirmed"** enquanto a ficha do banco e o Application detail dizem **"1 of 5"**.
Virou "23 of 36 answers", que é a mesma unidade da barra ao lado.

E o "What was sent" do Application detail agora diz que o que foi enviado é a
metade KYC, e que management systems ainda está sendo preenchido. Antes a tela
mostrava quatro seções sem explicar por que não eram nove.

---

## 7. "Show what's missing", e o que veio junto

Botão que marca as respostas que faltam. Mora **embaixo da barra de progresso**,
na barra lateral, não no topo: o que ele age é o número logo acima dele, e o
topo é pra o que você faz com o arquivo, não pra como você olha ele.

- Ligado, ele marca os campos em **âmbar tracejado** com "Not answered yet", e
  pinta de âmbar a contagem das seções que ainda têm buraco. Âmbar, não
  vermelho: resposta em branco é trabalho por fazer, não erro. O laranja do
  produto fica reservado pra pergunta que um banco realmente fez, e onde os dois
  caem no mesmo campo, a pergunta do banco ganha, porque diz mais.
- Desligado por padrão. Formulário que grita sobre cada buraco desde o primeiro
  segundo é formulário que se lê como lista de falhas antes de alguém digitar.
- Ligar ele estando numa seção completa não faz nada visível, o que pareceria
  botão quebrado, então ele leva você pra primeira seção que tem buraco.
- Quando não sobra nada, ele diz "Nothing left to answer" e desativa.

### Corrigido junto

- **A barra lateral voltou a acompanhar a página.** Com 4 seções ela cabia; com
  9 mais a barra de arquivo ela ficou mais alta que a janela, e caixa `sticky`
  mais alta que a viewport não gruda, só passa. Agora a coluna é limitada à
  altura que tem de fato e a lista rola por dentro, o que mantém a barra de
  progresso e o botão na tela em qualquer ponto do scroll. A última linha
  desvanece em vez de ser cortada, pra ler como "tem mais embaixo".
- **"2 questions" no rail parecia duas respostas em falta**, logo abaixo de
  "5 of 7 answered". Virou **"Meridian Bank asked 2"**: dizer quem pergunta é o
  que separa as duas coisas. A tag do painel virou "2 from the bank".
- **Attach e Replace não faziam nada.** Agora abrem o seletor de arquivo de
  verdade: o arquivo não sai do navegador, que é o limite honesto de um
  protótipo, mas a linha que volta é o nome, tipo, ano e tamanho reais do que
  foi escolhido, e as contagens andam junto. Botão que diz Attach e não faz nada
  é pior que botão nenhum.
- **Uma altura só de controle no painel.** Input, Yes/No e os dois botões do
  rodapé estavam em 46, 40 e 36, três escalas empilhadas na mesma coluna. Todos
  em **36**, que é a altura que todo controle do produto já usa.
- **As respostas agora voltam pro dado.** Digitar num campo ou marcar um Yes/No
  atualiza o rail, as contagens dos grupos e a barra na hora, sem redesenhar o
  painel (o que tiraria o cursor do input no meio da frase).

---

## 8. Board members virou mesa, e o comentário fecha sozinho

**Board members deixou de ser um anexo.** Era um PDF chamado "Board of
directors · 5 members", ou seja, o banco tinha que abrir um arquivo pra
descobrir quem são. Agora é uma mesa de pessoas: nome, cargo e o documento de
identidade de cada uma, editada no lugar, com "Add a member" embaixo e um x por
linha. Toda célula é input direto, transparente até ser tocada, pra cinco linhas
lerem como lista e não como quinze caixas.

A regra de contagem acompanha: a lista só conta como respondida quando tem pelo
menos uma pessoa e **toda** linha tem nome, cargo e documento. Board com nome e
sem papel não é board que o banco consegue conferir. Como as cinco linhas já
nascem completas, Governance segue 3 de 3 e nenhum número de outra tela mudou.
Adicionar uma linha vazia derruba a seção na hora, o que é a demonstração.

**O comentário do banco agora resolve.** A regra é simples e não precisou de
estado novo: uma pergunta está aberta enquanto a resposta embaixo dela está em
branco. Preencheu, resolveu. O que acontece junto:

- o bloco do comentário vira verde e ganha "Answered · goes back to Meridian
  Bank with your next update";
- a borda laranja do campo sai;
- o chip do rail cai de "Meridian Bank asked 2" pra 1, e some no zero;
- a tag da seção vira "Complete" e o número vira check verde;
- a pílula do header vira verde e passa a apontar o próximo passo:
  "Questions answered · send your updates".

O texto original do revisor fica na tela mesmo depois de resolvido, em cinza. É
o motivo pelo qual o campo foi preenchido, então apagar seria apagar a razão.
Efeito colateral: no Tax ID lê-se "This answer is blank" com a resposta logo
acima. Se te incomodar, dá pra trocar o texto por uma versão passada quando
resolve, mas aí não é mais o que a pessoa escreveu.

---

## 9. Revisão do lado do banco

**Header.** "MERIDIAN BANK" em caixa alta e duas cores virou **"Meridian Bank"**,
uma cor só, 19px semibold. A letterspacing larga de wordmark saiu: ao lado do
monograma ela já era logo, o tracking só empurrava a saudação pra longe.

**Pins cinzas.** Perderam a sombra e ganharam contorno `#6E747A`. Sombra sob uma
forma clara em basemap claro vira borrão; contorno define. Só o pin vivo segue
com sombra, porque só ele deve flutuar sobre o mapa.

**Applicants & verified clients.** O card já tem 24px de padding, então x=0 do
SVG **é** 24px da borda. O gráfico agora ocupa a caixa inteira: os rótulos do
eixo Y começam em 0 e dezembro cai na borda direita. Medido: 24px dos dois
lados. Os pontos das pontas passam a desenhar dentro do padding
(`overflow:visible`) pra não serem cortados.

E entrou a **tooltip que faltava**: crosshair tracejado que gruda no mês mais
próximo, ponto marcado nas duas séries e um balão com os dois valores. Gráfico
de linha sem isso obriga a pessoa a estimar doze valores contra quatro linhas de
grade, e a distância entre as duas curvas é justamente o assunto do card.

**Transições de página.** `page-transition.js`, carregado pelas oito telas. Um
véu na cor do fundo do app entra sobre a página que sai, a navegação acontece
atrás dele, e a página que chega o dissolve enquanto sobe 4px. Sem slide, sem
scale: isso é um arquivo sendo aberto de uma lista, não um card voando.

Peguei os dois tipos de navegação que o protótipo usa: `<a href>` (um listener
no documento, nenhum handler por link) e os `location.href` de linhas de tabela,
popups de pin e menu de assento, que agora chamam `KOTA.go()`. Um detalhe que
não é frescura: `requestAnimationFrame` não roda em aba de segundo plano, então
o véu tem também um `setTimeout` de 80ms. Sem ele, uma tela aberta em aba de
fundo ficava atrás do véu até alguém olhar pra ela.

**Evaluation.** "2 wks" virou "2 w".

---

## 10. Revisão da ficha do operador

- **Pin principal ganhou o ícone Home** (Untitled UI home-03, desenhado na grade
  24 e escalado pra cabeça do pin). Só ele: um glifo em um pin é marco, glifo em
  todos é ruído, que foi o motivo dos outros terem saído.
- **Trade Relationships**: os nós estavam em `#202122` sobre um card `#1D1D1E`,
  dois passos do próprio fundo, então liam como região chapada e não como
  objeto. Subiram pra `#282A2C` com contorno mais claro e sombra.
- **Shipments e Declared volume**: o branco quase puro dos dados gritava mais
  alto que a leitura. Desceu um degrau nos dois (`#DBE0E9` → `#AEB5BF`, e o
  gradiente das barras de `#E0E0E0` → `#B7B8B9`).
- **Review progress**: a barra colorida subiu pra mesma linha do texto e toma a
  largura que sobra. Antes pendurada embaixo, lia como uma segunda frase sem
  relação. O card ficou 60px mais curto de brinde.
- **Settings refeito.** O diagnóstico: quatro cards de largura cheia, cada um com
  uma ou três linhas, deixavam cada switch a 1200px da frase a que pertencem e
  abriam uma coluna de ar no meio da página. Agora são **duas colunas** com uma
  divisão de sentido: o que você muda à esquerda (Notifications, Access), o que
  você faz à direita (Review, Record). A anatomia passou pras linhas, não pros
  cards: cada uma é um controle com fio, hover e o texto limitado a 46ch, então
  o switch nunca se afasta do significado. As ações empilham botão sob descrição,
  porque na coluna estreita lado a lado não cabe nenhum dos dois.

---

## 11. Revisão do painel do operador

- **Mais indicadores.** Entrou **"Your file"**, que é a carta principal da tela:
  as duas metades com barra e contagem, e abaixo **"Where the work is"**, as três
  seções com mais pendência, clicáveis direto pro formulário. E entrou
  **"Declared volume"**, os mesmos doze meses que o banco lê na ficha, vistos
  deste lado.
- **Hierarquia.** "What the banks asked for" era a coluna esquerda inteira da
  segunda fileira, o que fazia uma tela sobre um arquivo parecer uma tela sobre
  duas reclamações. Virou **"Open questions"** na coluna estreita, embaixo do
  score. Continua acionável, deixou de ser o assunto.
- **Logos dos bancos.** Cada pergunta carrega a marca de quem perguntou, o mesmo
  monograma que a Home e o cartão de assento já usam, então as três telas
  concordam sobre a cara do Meridian Bank.
- **Call to action.** "Continue your information" nomeava um substantivo que o
  produto não usa em lugar nenhum. O botão agora é calculado do próprio dado:
  **"Answer 2 questions"** quando há pergunta aberta, "Keep filling your file"
  quando não há.

---

## 12. O formulário abre num overview

A primeira coisa que alguém via eram sete campos sob nove seções: uma parede,
antes de qualquer noção de quanto já estava feito. Agora a tela abre num
**overview**, que é a opção que você listou primeiro.

Ele responde três coisas, nessa ordem:

1. **Onde você está**: "You have answered 23 of 36. 13 to go."
2. **O que fazer agora**: no máximo dois cartões, na ordem que importa de
   verdade. Primeiro o que um banco está esperando ("Answer 2 questions from
   Meridian Bank"), depois onde o seu próprio trabalho parou ("Continue Supply
   chain policy"). Uma lista de nove seções iguais não responde "e agora".
3. **O mapa**: as duas metades com barra, e só então as nove seções numa grade
   de três colunas, pequenas o bastante pra serem mapa e não fila.

O rail ganhou uma linha "Overview" acima dos grupos, porque o mapa é um lugar
pra onde se volta, não uma etapa que se atravessa uma vez. "Back" na primeira
seção leva pro overview em vez de ser botão morto, e "Next" na última volta pra
ele.

---

## 13. Applications: cards viraram tabela

Você pediu pesquisa antes do redesenho, então ela veio primeiro. O que decidiu
o desenho, com fonte:

**Tabela, não cards.** NN/g, *Data Tables*: "two adjacent data points are easy
to compare because users don't need to move their eyes much", enquanto "a
card-based presentation requires users to spatially reorient each time they
move their eyes from one card to another". Cards são pra itens heterogêneos que
se navega; applications são registros do mesmo tipo que se compara.
<https://www.nngroup.com/articles/data-tables/>

**Mas não uma tabela analítica.** O Polaris separa as duas: `DataTable` é pra
visualizar dados, `IndexTable` é pra "a collection of objects of the same type
to help merchants get an at-a-glance of the objects to perform actions or
navigate to a full-page representation of it". É a segunda. Por isso a linha
inteira é o alvo do clique e o cabeçalho é grudento.
<https://polaris-react.shopify.com/components/tables/index-table>

**A primeira coluna é o identificador legível** (NN/g), e a ação da linha fica
perto dele, não na outra ponta. Ação **persistente**, não no hover: o Carbon
manda inline até três opções ("reduces a click and makes available actions
visible at a glance") e o Polaris avisa que shortcut actions no hover "are not
shown on small screen devices".
<https://carbondesignsystem.com/components/data-table/usage/>

**O status nomeia quem está segurando o arquivo.** É como Sumsub e Alloy
escrevem: `Awaiting user`, `Awaiting service`, `Requires action`. Isso mata a
necessidade de uma coluna "com quem está" e responde "de quem é a vez" no
próprio chip. Teto de seis valores, e chip com ponto + cor + rótulo, porque o
Carbon exige pelo menos dois dos três (cor, forma, símbolo): cor sozinha reprova.
<https://docs.sumsub.com/docs/applicant-statuses> ·
<https://carbondesignsystem.com/patterns/status-indicator-pattern/>

**Uma divergência que resolvi a favor da sua lista.** O Carbon proíbe barra de
progresso pra processo de múltiplas etapas conduzido por pessoa: barra é pra
operação de sistema com conclusão quantitativa. Você pediu progresso na coluna,
e aqui ele é honesto: "23 de 36 respostas" é literalmente quantidade. O chip
mede a **etapa** da revisão, a barra mede **quanto do arquivo existe**. Duas
perguntas diferentes, então podem dividir a linha sem dizer a mesma coisa duas
vezes. Se preferir o caminho canônico, o Ironclad resolve com quatro pontinhos
de etapa dentro da célula de status e nenhuma barra.
<https://carbondesignsystem.com/components/progress-bar/usage/>

**"Next action" não tem respaldo de design system nenhum.** É padrão de produto:
a coluna "Suggested action" da Ramp (com o badge sendo o alvo do clique) e a
coluna `TURN` do Ironclad. O mais perto de argumento de pesquisa é o NN/g em
status trackers: "prioritize information related to the latest update". Mantive
porque você pediu, e agora tem de onde defender.

### O que ficou na tela

Cinco colunas: **Bank** (marca + nome + mesa), **Status**, **Your file**,
**Next action**, **Last activity**, mais a ação. Acima: busca aberta (não
colapsada, porque a dez linhas é a primeira coisa que se procura), um filtro
promovido por status com contagem, e o total à direita. Polaris manda no máximo
2 ou 3 filtros promovidos; aqui status é o único que importa. Aplicação
instantânea, que é o que NN/g e Carbon recomendam quando o filtro é local e
rápido.

Ordenação em todas as colunas, padrão por última atividade decrescente, porque
numa fila o padrão é o que precisa de você no topo. Estado vazio quando o filtro
não casa. Chips de status só aparecem pros status que existem, então o filtro
nunca oferece uma porta que abre no nada.

**São duas applications e continuam duas.** O padrão é que foi construído pra
dez: busca, filtro, ordenação, contagem e estado vazio funcionam igual nos dois
tamanhos.

### Ajustes que vieram junto

- O painel dizia **"One decided, one in review"**, o que nunca foi verdade: uma
  está em revisão e a outra é rascunho. Virou "Banks you applied to · One in
  review, one still a draft".
- O estado do Meridian no painel virou "Awaiting you", igual à tabela.
- Header do painel do operador: nome + saudação, no lugar de nome + endereço
  registrado, que é como um banco olha uma contraparte.
- "Open questions" e "How you score" trocaram de lugar: o que um banco está
  esperando é a coisa viva, o score é a consequência.
- As barras de "Where the work is" andaram pra junto do número que descrevem.

---

## 14. A porta de entrada virou uma chave

A pré-tela saiu do case. No lugar dela, um **switch acima do frame**: *Be the
bank* / *Be the operator*. Ler um case study não é o momento de ser obrigado a
escolher um lado antes de ver qualquer um dos dois, e o argumento inteiro do
produto é que os dois lados são o mesmo registro. Então a chave **é** o
argumento: vira ela e o mesmo arquivo aparece pelo outro lado.

O `start.html` continua existindo como porta de entrada quando o protótipo é
aberto sozinho, e o "Back to the front door" do menu de assento ainda leva pra
ele. Ele só não é mais o que o case mostra primeiro.

### E o protótipo abre por cima do case, não em aba nova

Sair da página pra experimentar a coisa de que a página fala é uma troca ruim.
"Open full size" abre um overlay de `min(1560px, 96vw)` por `min(940px, 92vh)`
com o app rodando dentro, barra escura com o nome do assento, a mesma chave
espelhada e um × . Escape fecha, o foco volta pro botão que abriu, o `body`
trava o scroll enquanto está aberto e o iframe volta pra `about:blank` ao
fechar, pra não ficar um app rodando atrás.

Acima de 1440 de largura o overlay entrega o layout desktop de verdade, que é
justamente o que o embed de 1023px não conseguia mostrar.

Detalhe de construção: as duas chaves (a inline e a do overlay) são o mesmo
controlador, então nunca dá pra ficar com o embed num assento e o overlay no
outro. O thumb é medido, não fixo, porque os dois rótulos têm larguras
diferentes e mudam de novo em português.

### Um susto que valeu registrar

No meio disso a case page apareceu em branco e eu achei que tinha quebrado
alguma coisa. Não tinha: nesta automação a aba fica com `visibilityState:
hidden`, e o reveal das case pages depende de `IntersectionObserver`, que não
dispara em aba oculta. Um scroll revela tudo. Mesma causa do véu de transição
que precisou de um `setTimeout` de reserva. Vale lembrar disso antes de
diagnosticar "página quebrada" por aqui.

---

## 15. Rodada de acabamento

**Movimento.** `motion.css`, carregado pelas sete telas de app. Três regras
seguram tudo: cada coisa anima a partir da linha de base em que é medida (barra
cresce de zero, progresso corre da esquerda, arco varre do início), toca uma vez
na chegada e nunca mais, e usa só transform e opacity. `prefers-reduced-motion`
desliga, não encurta.

Ligado em: a curva de 12 meses e as quatro sparklines da Home (desenham com
`pathLength` normalizado a 100, então um valor de dash serve qualquer linha), o
waffle de consignments (bloco a bloco), as barras de volume declarado, os
medidores de progresso, as cinco fatias do Review progress e os dois gauges.

**Navegação entre páginas.** Antes era só o véu. Agora a saída tem direção (a
tela recua 6px e escurece sob o véu) e a chegada monta: o quadro assenta e os
cards caem em ordem de leitura, 48ms entre eles. Card que contém mapa fica fora
do stagger, porque animar um ancestral transformado sobre canvas WebGL faz o
mapa tremer sem ganho nenhum.

**Colunas desalinhadas na Evaluation.** O cabeçalho e o corpo eram dois grids
separados, cada um dimensionando as próprias colunas contra o próprio conteúdo
(`min-width:max-content` em cada wrapper), então uma célula longa empurrava a
coluna pra além do rótulo em cima dela. As colunas viraram `minmax(0, fr)`:
frações da tabela, não do texto dentro delas. Medido antes: cabeçalho e corpo
começavam em 510 vs 556, 816 vs 895, 1148 vs 1264. Depois: idênticos. Mesma
correção aplicada nas tabelas do painel do operador e da ficha do banco.

**Contact desalinhado.** O bloco trava em 86rem mas estava encostado à esquerda
dentro de um wrap de 1676px: 300px mortos de um lado só, enquanto Work e About
ficavam no eixo. Um `margin-inline:auto`. Agora 150px de cada lado.

**Mastheads.** A Home do banco cumprimenta a pessoa na mesa, não a instituição
em que ela trabalha: "Hello, N. Okonkwo". O painel do operador idem: "Hello,
Kivu Minerals". E o breadcrumb "Overview" virou "Home" nas quatro telas do
operador, mais o rótulo do rail, porque "Home" nomeia um lugar e "Overview"
nomeia uma tela.

**Mapa da Home.** Só o pin do Kivu. Os cinco cinzas abriam num "este operador
ainda não se registrou", ou seja, cinco lugares pra clicar por nada, e puxavam o
olho do único que faz alguma coisa. O card virou "On the ground", porque
"Operators by location" no plural com um pin se contradizia.

**Ícones desativados do rail.** `#4A4C4E` dava 2.10:1 sobre o rail, o que lê como
ausente e não como desligado. `#5E6164` dá 2.91:1: ainda claramente um degrau
abaixo dos ativos (5.51:1), mas sólido o bastante pra existir.

**Legendas no case.** As quatro figuras ganharam título e uma linha de descrição,
em vez do rótulo mono sozinho, que era etiqueta e não legenda.

**A prévia do protótipo.** O app é desenhado com piso de 1440 e a coluna do case
tem 1190, então ele estava sendo cortado à direita: o quarto indicador e metade
da coluna lateral simplesmente sumiam, o que lê como screenshot quebrado. Agora
renderiza na largura real e escala inteiro pra caber (0.83). Nada é cortado de
lado. Escalado ele deixa de ser coisa de usar e vira coisa de olhar, então o
frame é um botão: um clique abre em tamanho real. Abaixo de 760px de coluna ele
para de escalar e mostra o layout mobile do app, que é a prévia honesta naquele
tamanho.

**O overlay no celular.** Um diálogo que já quer 96% da tela deve parar de fingir
que é diálogo e tomar tudo: tela cheia, sem borda nem raio. A barra fica com as
duas coisas de que precisa ali, em qual assento você está e a saída; o título sai,
porque a tela atrás já diz de quem é. E o Escape passou a funcionar de dentro do
iframe, que antes engolia a tecla.

---

## 16. Os pendentes, fechados

**Nenhum nome real.** Trocados por nomes cunhados: **Meridian Bank → Banque
Orimu**, **Banque Lisala → Banque Sefali** (Lisala é cidade real), **KEMET →
Kandril Components**, **Tantalux → Serandi Mining** (perto demais de uma
empresa real de tântalo), e antes disso **Kivu Minerals → Tulivu Cooperative**.

A geografia continua real de propósito: Goma, North Kivu, Masisi, Rubaya,
Avenue du Lac. Um lugar não é uma entidade fazendo afirmação sobre si.

O "M" do banco era letra desenhada à mão, igual ao "K" do operador, então não
dava pra renomear: virou letra renderizada. Agora qualquer inicial funciona sem
redesenhar.

Ressalva que preciso registrar: **não consigo verificar nome nenhum contra
registro de empresas daqui.** Escolhi palavras cunhadas sem significado de
dicionário justamente pra reduzir a chance de colisão, mas é escolha por
plausibilidade, não verificação.

**A Home parou de contradizer a Evaluation.** A Tulivu estava como
"Registration · 38% · 2 documents outstanding" e listada como parada, enquanto a
Evaluation dizia "Ready for review · 100%" e o feed da própria Home dizia que ela
submeteu há 2 dias. Agora a Home diz o mesmo: estágio "Ready for evaluation",
100%, e a linha do card virou "Ready for review · submitted 2 days ago". O
subtítulo do card era "Stalled longer than usual", o que só valia pra duas das
três linhas; virou "Waiting on someone, starting with you". O Serandi também
alinhou: "Registration · 100%", que é o que a Evaluation diz.

**Os "Form 01 a 05" viraram as seções reais.** São quatro, não cinco, porque é
exatamente a metade KYC que este operador enviou; a metade de management systems
ainda está sendo preenchida do lado dele e não chegou aqui. A tabela agora lista
**Identification, Registration, Governance, Scrutiny** com as contagens do
próprio operador ("5 of 7 answered"), e o `DOC 000 000 nnn` saiu, porque era um
identificador que não identificava nada.

O número no topo mudou de leitura junto: era "1 of 5 forms confirmed · 75% of
fields completed", onde os 75% eram a média das porcentagens das cinco linhas.
Quatro seções de tamanhos diferentes não valem um quarto cada. Agora o cálculo é
por respostas, lido das próprias linhas: **"2 of 4 sections confirmed · 88% of
answers given"**, e 88% é 15 de 17, o mesmo número que o operador vê na metade
KYC dele.

**Maio voltou** pro gráfico de Shipments per month. Era lapso mesmo: o gráfico
de volume ao lado roda os doze meses, então a falha lia como mês sem embarque.

**O mapa se resgata sozinho.** O estilo *Faded* importa o Mapbox Standard, e
quando esse import trava nada levanta erro: `style.load` não dispara, o basemap
fica branco, e tudo que pende dele (a área de conflito, as linhas de fluxo)
nunca desenha. Não há o que capturar, então o único sinal confiável é tempo.

Depois de quatro segundos sem `style.load`, o mapa troca pra um estilo clássico
(`light-v11`), que carrega só de tiles e não tem import pra travar. Como
`style.load` dispara no estilo novo, o handler roda e a zona e as linhas voltam
junto. Testado: os sprites do light-v11 são buscados e o mapa renderiza.

O que isso **não** resolve: quando o fallback entra, você perde o seu *Faded*.
A correção de verdade é no Studio, e há dois caminhos. O primeiro é republicar o
Faded como estilo clássico, sem `imports`, o que tira a dependência do Standard
e mantém a sua aparência. O segundo é manter o Standard e aceitar o fallback
como rede. Só você consegue fazer o primeiro, e vale: com ele o mapa deixa de
depender de um serviço que hoje falha de forma silenciosa e intermitente.

---

## 17. Em aberto, pra você decidir

1. **"Meridian Bank" é nome de instituição real** (existem bancos com esse nome
   nos EUA e em outros mercados). Pela sua regra de não amarrar material público
   a fatos inventados sobre entidades reais, vale trocar antes de publicar.
   Sugestões que não colidem com nada que eu encontre: **Banque du Rift**,
   **Kivu Union Bank**, **Sentinel Trust**. "Banque Lisala" (o segundo banco) e
   "Kivu Minerals" eu não encontrei como empresas reais.
2. **"KEMET"** aparece como contraparte e é uma empresa real (componentes
   eletrônicos). Mesma recomendação.
3. **O basemap do Mapbox não está carregando** nas duas telas com mapa. Não é
   o nosso código: o estilo *Faded* importa o Mapbox Standard, e o Standard não
   dispara `style.load` neste navegador agora. Um estilo clássico
   (`mapbox://styles/mapbox/light-v11`) carrega na hora, no mesmo token e na
   mesma página. É intermitente (a Home renderizou mais cedo hoje). Como o
   estilo é escolha sua, não troquei: me diz se quer que eu troque, ou se
   prefere esperar o Standard voltar.
4. **Maio some do gráfico de consignments** da ficha do operador. É o dado como
   está escrito; não sei se é intencional (mês sem embarque) ou lapso.
5. **As duas cores do waffle** nunca foram definidas em texto além da legenda
   (`Rubaya concession` / `Other sites`). Se a leitura pretendida for outra, é
   uma linha de copy.
6. **"CONFLICT ZONE"** no mapa perdeu a sombra a seu pedido; sobre o basemap
   claro o vermelho fica em contraste baixo. Se quiser, dá pra dar um halo claro
   em vez de sombra escura.

7. **A ficha do banco conta 5 "forms"; o formulário do operador tem 9 seções.**
   Hoje as duas leituras convivem porque o banco só recebeu a metade KYC, e o
   Application detail agora diz isso. Mas a tabela "Detailed information
   provided" continua com Form 01 a Form 05, que não mapeiam nas quatro seções
   de KYC. Se quiser, troco os "Form 0N" pelos nomes reais das seções, e aí os
   dois lados passam a falar do mesmo objeto.
8. **`bank-home.html` discorda da Evaluation sobre o Kivu.** A Home lista o Kivu
   em "Needs attention" como "Registration · 38% · 2 documents outstanding",
   enquanto a Evaluation diz "Ready for review · 100%" e o próprio feed da Home
   diz que ele submeteu pra revisão há 2 dias. Um arquivo submetido não está em
   38% nem parado. O Tantalux também: Home diz "Ready for evaluation", Evaluation
   diz "Registering · 100%, complete, not submitted". Não mexi porque virar o
   Kivu de "parado" pra "esperando você" muda a copy do card, e o card com o Kivu
   em primeiro foi pedido seu. Me diz e ajusto.

## 18. Publicado (2026-09-14)

Dez commits foram pro remoto depois que você liberou o token no secret
scanning. Mas o Kota continuou caindo na home, e não era o deploy: havia um
`_redirects` na raiz com duas regras que mandavam `/projects/kota` e
`/projects/kota.html` pra `/` com 302. Elas foram postas lá quando o card era
"Coming soon", porque a página buildava e respondia numa URL digitada mesmo sem
nada linkando pra ela. Removidas, o Kota respondeu 200 na hora.

Fica registrado porque a armadilha se repete: **tirar o "Coming soon" do card
não publica a página**. Quem publica é o `_redirects`.

O mesmo vale ao contrário pro Straatos, que voltou a ser "Coming soon" no card:
a página dele continua respondendo 200 numa URL digitada, porque não tem regra
nenhuma segurando. Diferente do Kota, o `straatos.html` já esteve publicado e
pode estar indexado, então bloquear agora quebra link existente. É decisão sua.

### Ainda em aberto

1. **`projects/assets/kota-cover.jpg` está desatualizado** e agora é o primeiro
   card do site. Mostra "Kivu Minerals" em quatro lugares e "KEMET" no grafo de
   trade relationships. Precisa ser re-exportado da `operator-detail.html`, aba
   Insights, no mesmo enquadramento.
2. **O estilo do Mapbox** (`cmu1pk042001b01qucobg1nxd`) ainda importa o
   Standard e trava; o fallback pro `dark-v11` é o que está no ar. Pra usar o
   estilo dela de verdade, precisa ser criado de um template **Classic**.
3. **Chevron e breadcrumb são redundantes.** A topbar lê `‹ Home › Applications`
   e as duas coisas vão pro mesmo lugar, coladas. Proposta: tirar o "Home" do
   breadcrumb e deixar `‹ Applications`.
4. **`scene-bank.html`** é um render do dashboard num monitor, em HTML, com o
   protótipo vivo dentro do frame. Exporta com Chrome headless:
   `--headless=new --use-angle=swiftshader --enable-unsafe-swiftshader
   --window-size=2400,1400 --virtual-time-budget=60000 --screenshot=x.png`.
   O swiftshader é o que faz o Mapbox renderizar sem GPU. Parado a pedido dela;
   falta encolher o monitor, resolver a silhueta e a altura fixa de 900px que
   corta o último card.
