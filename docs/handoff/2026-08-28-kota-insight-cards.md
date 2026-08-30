# Kota · Problem statement + insight cards (conteúdo pro Figma)

Formato de referência: Problem statement (label, headline grande, subtexto) e cards de insight (label "Insight N", headline com uma palavra em destaque, visual simples, legenda com o dado). Sem números inventados: todo dado abaixo é estrutural e já está no case.

## Problem statement

Label: PROBLEM STATEMENT

Headline (opção A):
Cooperatives and small producers in extractive industries need a way to apply for banking with a record they own.

Headline (opção B, mais curta):
Operators need to be evaluated on their own record, not on a form someone else filled in.

Subtexto:
Applications arrived as handwritten cards filled by a bank agent. The operator never held the pen, the bank could not evaluate what it received, and the answer was a verdict with no path forward.

## Insight cards

### Insight 1 · label INSIGHT 1
Headline: The applicant never held the **pen**.
Visual: uma ficha de papel (silhueta) com uma caneta apontando pra fora dela; ou dois ícones "agent → form", com o operador fora do fluxo.
Legenda: Applications were filled in by a bank agent on the operator's behalf. The person being evaluated was the only one who never touched the form.

### Insight 2 · label INSIGHT 2
Headline: Three actors, three **vocabularies**.
Visual: três círculos (Operator, Bank, Aggregator) ligados por uma linha; a mesma etapa nomeada de forma diferente em cada um.
Legenda: One pipeline serves a commercial bank and a government-mandated aggregator. Same data, different words, different moments.

### Insight 3 · label INSIGHT 3
Headline: One record, two **copies**.
Visual: um documento que se duplica; o original fica com o operador, a cópia vai pro banco (setas).
Legenda: The bank inherits a copy the moment it edits. The operator's record is never mutated, so it can be reused with any institution.

### Insight 4 · label INSIGHT 4
Headline: Detail page and application are **not** the same screen.
Visual: dois retângulos lado a lado com um "≠" entre eles.
Legenda: The question that split the architecture. The domain expert confirmed: different people, different moments in the bank's workflow.

### Insight 5 · label INSIGHT 5
Headline: The brief was **one sentence**.
Visual: uma frase entre aspas, com o resto da tela vazio (espaço em branco intencional).
Legenda: "There will be stages. At each stage, they provide a form and some documents. Then they wait. Then they get an answer." Everything else was design.

### Insight 6 · label INSIGHT 6
Headline: A screen is done when every **state** is.
Visual: grade 4 × 3 de células, algumas preenchidas, algumas vazias (matriz de estados).
Legenda: Empty, loading, partial, error, success, locked. State matrices were a deliverable, so engineering never had to guess.

### Insight 7 · label INSIGHT 7 (opcional, sobre o score)
Headline: An answer with a **path**, not just a verdict.
Visual: gauge semicircular com um marcador e, ao lado, uma lista curta de "what to improve".
Legenda: The operator receives a score and what would change it. A "no" becomes a to-do list instead of a dead end.

## Palavras em destaque (cor de acento)
pen · vocabularies · copies · not · one sentence · state · path

## Observações
- Frases sem travessão.
- Nenhum percentual ou contagem de pessoas: não houve pesquisa com usuários. Se quiser números, os únicos honestos são estruturais (3 atores, 2 instituições, 1 motor, 4 etapas, 2 cópias).
- Ordem sugerida no carrossel: 1, 2, 3, 4, 6, 7 (o 5 funciona melhor como abertura da seção "Brief", que já existe no case).

## Process cards (5 etapas, formato "cartões inclinados")

Research
- Spec analysis
- Regulatory reading (DRC, OECD, EU conflict minerals)
- Domain expert question loop
- Stakeholder map
- Problem statement

Concept design
- Object model (subject, stage, action)
- Two-copy data model, mapped
- Site map (five apps, one grammar)
- User flows (operator application, bank review)
- Benchmarking (KYC and compliance tools)

Ideation
- Design principles
- Functionalities by role
- Interaction grammar (table, hub, stage actions)
- Low-fi wireframes

Solution
- UI design
- Design system (tokens, Untitled UI)
- Interactive prototype
- State matrices
- Engineering handoff

Refining
- Edge cases from engineering
- Walkthroughs with founder and domain expert
- State and copy iteration
- Documentation
- The grammar held while I was away

Nota: sem "User interviews", "User persona" ou "Testing" com usuários. Onde a referência diz isso, o equivalente honesto é question loop, roles from the spec e walkthroughs com o expert.

## Dados concretos com fonte (pra usar nos cards)

Contexto: nenhum número vem de pesquisa própria. Todos são públicos e citáveis; a fonte vai no card ou no rodapé.

1. 39% dos adultos na RDC têm conta (banco ou mobile money) em 2024; era 27% em 2022 e 4% em 2011. Fonte: World Bank Global Findex, indicador FX.OWN.TOTL.ZS (api.worldbank.org, país COD).
2. 58% na África Subsaariana em 2024 (34% em 2014). Fonte: Global Findex 2025, World Bank.
3. Cerca de 10 milhões de pessoas vivem da mineração artesanal na RDC; o setor responde por 10 a 20% da produção mineral do país. Fonte: World Bank, citado pela Mongabay (out/2024).
4. 150 a 200 mil mineradores artesanais trabalham cobalto na RDC, com mais de 1 milhão de dependentes diretos. Fonte: Mining Technology (2021).
5. RDC = 78% da produção global de cobalto em 2024. Fonte: Fastmarkets.
6. Desde 2010 o Código de Mineração exige que o minerador artesanal seja membro de uma cooperativa e opere numa ZEA (zona de exploração artesanal). Fonte: Justice & Paix / A-MLA sobre o Código de 2002 alterado pela Lei 18/001 de 2018.
7. Regulamento UE 2017/821 (minerais de conflito, 3TG) em vigor desde 1 jan 2021: due diligence obrigatória pra importadores. Fonte: Comissão Europeia, DG Trade.
8. OECD Due Diligence Guidance (3ª ed., 2016): framework de 5 passos. Fonte: OECD.
9. Gap de financiamento de PMEs na África Subsaariana: USD 331 bi; 44 milhões de MPMEs formais, 51% sem o crédito de que precisam. Fonte: IFC / SME Finance Forum (mai/2018).

Do próprio projeto (checar publicabilidade com o Ben antes de usar): "15 lifecycle workflows e 16 telas" está na spec; telas feitas em 2024, retomadas em 2026.

## Cards prontos (2026-08-28)
Três cards de dados gerados em SVG + PNG @2x, em ~/Desktop/kota-insight-cards/: 1 conta bancária 39% vs 58% (donut), 2 cooperativa por lei (zona + pontos), 3 regulação UE desde 2021 (timeline + chips 3TG). 660×760, Inter, laranja KOTA #E25E25, fonte citada no rodapé de cada card.

## Line → radar (template Jitter "morph line to radar chart")
Fonte única: World Bank Global Findex 2025 (dados 2024), API source 28, países COD e SSA (Sub-Saharan Africa excl. high income). % de adultos 15+.

Linha (DRC, adultos com conta): 2011 3.7 · 2014 17.5 · 2017 25.8 · 2022 27.4 · 2024 39.2

Radar 2024, DRC vs Sub-Saharan Africa (6 eixos):
- Any account: 39.2 vs 58.2
- Mobile money account: 35.1 vs 40.0
- Saved at a bank: 8.5 vs 19.7
- Borrowed from a bank: 5.0 vs 6.8
- Owns a debit card: 5.3 vs 22.2
- Wages paid into an account: 6.6 vs 13.1

Leitura: a conta chegou (via mobile money), o banco não. Tudo que passa por um banco formal fica em um dígito na RDC.
Headline sugerida: "The account arrived. The bank didn't." Sub: "Mobile money took the DRC from 4% to 39% of adults with an account in 13 years. Saving, borrowing or getting paid through a bank is still under 10%."
Série ids: account.t.d, mobileaccount.t.d, fin17a, fin22a, fin2.t.d, fin32.acc.

## CORREÇÃO (2026-08-28, noite): dados de pessoa física não servem
O Findex mede adultos, não organizações. O usuário do KOTA é o operator (cooperativa, pequeno produtor), pessoa física é exceção. Os cards 1 (39%) e o par linha → radar ficam como contexto de país no máximo; não usar como dado do usuário. Substituir por dados de FIRMA:

World Bank Enterprise Surveys, DRC 2024 (colunas: DRC todas / pequenas / SSA):
- Firms with a checking or savings account: 51.0% (pequenas 47.4%) vs 85.7% SSA
- Firms with a bank loan or line of credit: 8.7% vs 22.1% SSA (API IC.FRM.BNKL.ZS)
- Firms using banks to finance investment: 7.6% (pequenas 3.6%) vs 19.6% SSA
- Investment financed internally: 84.2%; financed by banks: 2.6%
- Firms naming access to finance as the biggest obstacle: 35.3% (pequenas 37.1%) vs 29.0% SSA
Fonte: enterprisesurveys.org, Country Profile Congo, Dem. Rep. 2024.

MSME finance gap DRC: USD 9.3 bi, 26% do PIB; 90% das firmas são MPMEs. Fonte: World Bank / IFC MSME Finance Gap (2017), citado em AFI, "Increasing Women's Financial Inclusion, DRC" (2024).

Cooperativas (qualitativo, Sida/IPIS 2021 "DRC mining overview and mapping"): ser membro de cooperativa exige a carteira de minerador artesanal, que poucos têm ou não conseguem os papéis pra tirar; formalização obriga a se organizar em cooperativa.

Linha → radar refeito com dados de firma (DRC vs SSA, 2024):
- Has a bank account: 51 vs 86
- Has a bank loan or credit line: 8.7 vs 22
- Uses banks to finance investment: 7.6 vs 19.6
- Investment financed by banks: 2.6 vs 9.3
- Uses supplier or customer credit: 10.1 vs 26.0
- Access to finance is the biggest obstacle: 35 vs 29 (eixo invertido: maior é pior)
Linha possível: só há um ponto no tempo (2024) pra RDC nesses indicadores; a linha do morph pode ser o tamanho da firma (small 47 → medium 68 → large 81 com conta), que é honesta e conta a história "quanto menor, mais fora".
