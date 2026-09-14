# Handoff: hint interativo no globo do Straatos

Data: 2026-09-02 · Quem: Claude (sessao com a Pietra)

- Pedido dela (print): o globo 3D do straatos.html nao tinha o hint "Interactive · click and scroll inside" que os embeds do Kota tem.
- Portado o componente do kota.html: CSS (.embed-hint, seletores parent-agnosticos via .is-hinting), markup dentro de .globe-embed, JS (IntersectionObserver; persiste ate o primeiro clique/tap, mesmo comportamento definido por ela no Kota), chaves hint_live EN/PT nos dicionarios.
- O JS cobre .globe-embed e .embed-frame que TENHAM .embed-hint no markup; os outros embeds do straatos seguem sem hint (nao pedido). Pra estender, e so adicionar o div .embed-hint no frame.
- Umami Cloud instalado (2026-09-02) em index + 5 pages de projects/ com data-domains=pietragottardo.com; embeds de iframe ficam sem, pra nao dobrar pageview.
- Fix de CLS do hero (2026-09-02): fallback 'TWKLausanne Fallback' (Arial + size-adjust 100.39% / ascent 90.76% / descent 19.94%, medido com fontTools) adicionada em lausanne.css e nos stacks --font das 6 paginas; preload de 300/300Italic/400 no head de cada uma. CLAUDE.md corrigida (dizia Urbanist/Google Fonts).
