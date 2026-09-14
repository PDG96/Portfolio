# Kota, a Home do banco na identidade nova e o fluxo até a revisão

Data: 2026-09-13
Arquivos: `projects/assets/kota/bank-home.html` (reconstruído),
`projects/assets/kota/bank-home-2026-09-11.html` (a versão anterior, intacta),
`projects/assets/kota/operator-detail.html` (breadcrumb e rail viraram caminho de volta)

## O que aconteceu

Primeiro eu entendi errado e criei uma home paralela (`bank-dashboard.html`). Não era isso:
a home já existia, e o pedido era trazê-la para a identidade nova. Apaguei a paralela e
reconstruí a `bank-home.html`, preservando o conteúdo dela inteiro:

- as quatro contagens com as sparklines (18 applicants, 9 verified, 4 ready, 82% coverage)
- Operators by location, os mesmos seis operadores nas mesmas coordenadas
- Latest updates, os mesmos cinco itens
- a curva cumulativa de doze meses, com os mesmos pontos
- Needs attention, com as mesmas três linhas

O que mudou é o shell, os tokens, os cards e os controles, que agora são os do
`operator-detail.html`. Home é a tela de onde a revisão é aberta, então as duas precisam
se ler como o mesmo produto.

A versão anterior, que usa o sistema compartilhado antigo (tokens.css, components.css,
`zoom:.75`), está guardada em `bank-home-2026-09-11.html`.

## O fio até o operador

Kivu Minerals aparece nos três lugares da home (updates, mapa, stalled) e nos três é o
único acento da tela: o pin que pulsa, o avatar laranja e o único botão primário. Os três
levam para a revisão.

De volta: no `operator-detail.html` os dois primeiros itens do breadcrumb e o ícone Home
da rail levam para a home. Sem isso o fluxo era de mão única.

Os outros itens da rail estão desabilitados nas duas telas, porque só duas seções existem
no protótipo e um ícone apagado é mais honesto do que um que não vai a lugar nenhum.

## O logo do banco

Um globo com meridiano e um ponto laranja no topo: meridiano pelo nome, e o ponto porque o
produto inteiro é sobre onde as coisas ficam. Entra no cabeçalho da home e no pé da rail
das duas telas, no lugar do avatar. A marca do Kivu (o K azul) fica onde ela é o assunto:
no cabeçalho da revisão.

## Verificado no navegador

Clique no Kivu em qualquer um dos três pontos da home abre a revisão; o breadcrumb e o
ícone Home voltam; a rail mostra Home e Evaluation ativos e o resto apagado; o header cola
e expande ao rolar nas duas telas.
