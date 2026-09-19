/* finapp: shell compartilhado (sidebar desktop + tab bar mobile + sprite de ícones).
   Uso: <body data-page="inicio"> e <script src="shell.js"></script> no fim do body. */
(function () {
  var page = document.body.dataset.page || "inicio";

  var sprite = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">'
    + '<symbol id="i-home" viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></symbol>'
    + '<symbol id="i-list" viewBox="0 0 24 24"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></symbol>'
    + '<symbol id="i-calendar" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></symbol>'
    + '<symbol id="i-target" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></symbol>'
    + '<symbol id="i-chart" viewBox="0 0 24 24"><path d="M3 20h18M6 16l4-5 4 3 5-7"/></symbol>'
    + '<symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>'
    + '<symbol id="i-bank" viewBox="0 0 24 24"><path d="M3 9.5 12 4l9 5.5M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18"/></symbol>'
    + '<symbol id="i-tag" viewBox="0 0 24 24"><path d="M20 12 12 20l-9-9V3h8zM7 7h.01"/></symbol>'
    + '<symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4"/></symbol>'
    + '<symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 16V4M6 10l6-6 6 6M4 20h16"/></symbol>'
    + '<symbol id="i-settings" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></symbol>'
    + '<symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></symbol>'
    + '<symbol id="i-chevron-left" viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"/></symbol>'
    + '<symbol id="i-chevron-right" viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></symbol>'
    + '<symbol id="i-chevron-down" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></symbol>'
    + '<symbol id="i-arrow-right" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>'
    + '<symbol id="i-arrow-up-right" viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9"/></symbol>'
    + '<symbol id="i-arrow-down-right" viewBox="0 0 24 24"><path d="M7 7l10 10M17 8v9H8"/></symbol>'
    + '<symbol id="i-check" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></symbol>'
    + '<symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></symbol>'
    + '<symbol id="i-cart" viewBox="0 0 24 24"><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/><path d="M2 3h3l2.5 12h11L21 7H6"/></symbol>'
    + '<symbol id="i-zap" viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z"/></symbol>'
    + '<symbol id="i-drop" viewBox="0 0 24 24"><path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12z"/></symbol>'
    + '<symbol id="i-wifi" viewBox="0 0 24 24"><path d="M2 9a16 16 0 0 1 20 0M5.5 12.5a11 11 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 20h.01"/></symbol>'
    + '<symbol id="i-car" viewBox="0 0 24 24"><path d="M3 13l2-5a2 2 0 0 1 2-1h10a2 2 0 0 1 2 1l2 5v5a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H6v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM3 13h18M7 16h.01M17 16h.01"/></symbol>'
    + '<symbol id="i-pill" viewBox="0 0 24 24"><path d="m10.5 20.5 10-10a4.95 4.95 0 0 0-7-7l-10 10a4.95 4.95 0 0 0 7 7zM8.5 8.5l7 7"/></symbol>'
    + '<symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></symbol>'
    + '<symbol id="i-card" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></symbol>'
    + '<symbol id="i-receipt" viewBox="0 0 24 24"><path d="M5 3h14v18l-2.5-1.5L14 21l-2-1.5L10 21l-2.5-1.5L5 21zM8 8h8M8 12h8M8 16h5"/></symbol>'
    + '<symbol id="i-swap" viewBox="0 0 24 24"><path d="M4 7h13l-3-3M20 17H7l3 3"/></symbol>'
    + '<symbol id="i-wallet" viewBox="0 0 24 24"><path d="M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v2H5a2 2 0 0 0 0 4h16v6a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2z"/><path d="M16 13h.01"/></symbol>'
    + '<symbol id="i-fork" viewBox="0 0 24 24"><path d="M7 3v6a3 3 0 0 0 6 0V3M10 12v9M17 3c-2 1-3 3-3 6v3h3V3z"/></symbol>'
    + '<symbol id="i-house" viewBox="0 0 24 24"><path d="M4 11 12 4l8 7v9H4z"/></symbol>'
    + '<symbol id="i-gift" viewBox="0 0 24 24"><path d="M3 9h18v4H3zM5 13v8h14v-8M12 9v12M12 9c-2 0-4-1-4-3a2 2 0 0 1 4 0zm0 0c2 0 4-1 4-3a2 2 0 0 0-4 0z"/></symbol>'
    + '<symbol id="i-more" viewBox="0 0 24 24"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></symbol>'
    + '<symbol id="i-sparkle" viewBox="0 0 24 24"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/></symbol>'
    + '<symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 9v4M12 17h.01M10.3 3.9 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/></symbol>'
    + '<symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>'
    + '<symbol id="i-link" viewBox="0 0 24 24"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></symbol>'
    + '<symbol id="i-filter" viewBox="0 0 24 24"><path d="M3 5h18l-7 8v6l-4-2v-4z"/></symbol>'
    + '<symbol id="i-inbox" viewBox="0 0 24 24"><path d="M3 13h5l2 3h4l2-3h5M5 4h14l2 9v7H3v-7z"/></symbol>'
    + '<symbol id="i-edit" viewBox="0 0 24 24"><path d="M4 20h4l11-11-4-4L4 16z"/></symbol>'
    + '<symbol id="i-backspace" viewBox="0 0 24 24"><path d="M9 5h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-6-7zM12 10l4 4M16 10l-4 4"/></symbol>'
    + '<symbol id="i-more-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></symbol>'
    + '<symbol id="i-trash" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></symbol>'
    + '</svg>';

  var nav = [
    ["inicio", "Início", "i-home", "01-inicio.html"],
    ["movimentacoes", "Movimentações", "i-list", "03-movimentacoes.html"],
    ["compromissos", "Compromissos", "i-calendar", "04-compromissos.html"],
    ["planejamento", "Planejamento", "i-target", "05-planejamento.html"],
    ["patrimonio", "Patrimônio", "i-chart", "07-patrimonio.html"]
  ];
  var secondary = [
    ["contas", "Contas e conexões", "i-bank", "07-patrimonio.html#contas"],
    ["importar", "Importar e conciliar", "i-upload", "06-importar-conciliar.html"],
    ["categorias", "Categorias e regras", "i-tag", "#categorias"],
    ["alertas", "Alertas", "i-bell", "#alertas"]
  ];

  function icon(id, cls) { return '<svg class="icon ' + (cls || "") + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function extra(n) {
    if (n[3] === "#alertas") return ' aria-label="Alertas"';
    if (n[3] === "#categorias") return ' data-toast="Categorias e regras: tela da v2. As regras já aparecem no detalhe de cada lançamento."';
    if (n[3] === "#") return ' data-toast="Configurações: tela da v2."';
    return "";
  }
  function item(n) {
    var cur = n[0] === page ? ' aria-current="page"' : "";
    return '<a class="nav-item" href="' + n[3] + '"' + cur + extra(n) + '>' + icon(n[2]) + '<span>' + n[1] + '</span></a>';
  }

  var sidebar = '<aside class="sidebar"><a class="brand" href="01-inicio.html"><span class="mark">' + icon("i-wallet", "sm") + '</span><span>finapp</span></a>'
    + '<nav aria-label="Principal" class="nav-section"><div class="nav-label">Navegação</div>' + nav.map(item).join("") + '</nav>'
    + '<nav aria-label="Secundária" class="nav-section"><div class="nav-label">Dados</div>' + secondary.map(item).join("") + '</nav>'
    + '<div class="spacer"></div>'
    + '<nav aria-label="Conta" class="nav-section"><a class="nav-item" href="#" data-toast="Configurações: tela da v2.">' + icon("i-settings") + '<span>Configurações</span></a></nav>'
    + '<div class="account"><div class="avatar" aria-hidden="true">MG</div><div><div class="type-14-semibold">Minha conta</div><div class="muted type-12-medium">Plano pessoal</div></div></div>'
    + '</aside>';

  // Mobile: 4 destinos + "Novo" no centro. Planejamento, Patrimônio e Dados ficam em "Mais".
  var morePages = ["planejamento", "patrimonio", "contas", "importar", "categorias", "alertas"];
  function tab(n) {
    var cur = n[0] === page ? ' aria-current="page"' : "";
    return '<a href="' + n[3] + '"' + cur + '>' + icon(n[2]) + '<span>' + n[1] + '</span></a>';
  }
  var novoCur = page === "novo" ? ' aria-current="page"' : "";
  var maisCur = morePages.indexOf(page) > -1 ? ' aria-current="page"' : "";
  var tabbar = '<nav class="tabbar" aria-label="Principal">'
    + tab(nav[0]) + tab(nav[1])
    + '<a class="tab-new" href="02-novo-lancamento.html"' + novoCur + '><span class="tab-new-btn">' + icon("i-plus") + '</span><span>Novo</span></a>'
    + tab(nav[2])
    + '<button type="button" class="tab-more" data-open-more' + maisCur + '>' + icon("i-more-grid") + '<span>Mais</span></button>'
    + '</nav>';

  var moreItems = [nav[3], nav[4]].concat(secondary).concat([["config", "Configurações", "i-settings", "#"]]);
  var moreSheet = '<div class="overlay more-overlay" id="more-sheet" hidden role="dialog" aria-modal="true" aria-labelledby="more-title"><div class="sheet">'
    + '<div class="sheet-header"><h2 id="more-title">Mais</h2><button class="btn btn-tertiary btn-icon btn-sm" type="button" data-close-more aria-label="Fechar">' + icon("i-x") + '</button></div>'
    + '<div class="list more-list">' + moreItems.map(function (n) {
        var cur = n[0] === page ? ' aria-current="page"' : "";
        return '<a class="row" href="' + n[3] + '"' + cur + extra(n) + '><div class="ic">' + icon(n[2]) + '</div><div class="t"><strong>' + n[1] + '</strong></div><div class="v">' + icon("i-chevron-right", "sm") + '</div></a>';
      }).join("") + '</div></div></div>';

  var shell = document.querySelector(".shell");
  document.body.insertAdjacentHTML("afterbegin", sprite);
  if (shell) {
    shell.insertAdjacentHTML("afterbegin", sidebar);
    document.body.insertAdjacentHTML("beforeend", tabbar);
    document.body.insertAdjacentHTML("beforeend", moreSheet);
    var more = document.getElementById("more-sheet");
    var opener = null;
    function openMore() { opener = document.activeElement; more.hidden = false; more.querySelector(".row").focus(); }
    function closeMore() { more.hidden = true; if (opener) opener.focus(); }
    document.querySelectorAll("[data-open-more]").forEach(function (b) { b.addEventListener("click", openMore); });
    more.querySelectorAll("[data-close-more]").forEach(function (b) { b.addEventListener("click", closeMore); });
    more.addEventListener("click", function (e) { if (e.target === more) closeMore(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !more.hidden) closeMore(); });
  }

  // Navegação de mês: todos os .month-nav da tela andam juntos (mock: só o rótulo muda)
  var MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  var labels = document.querySelectorAll(".month-nav .label");
  if (labels.length) {
    var cur = { m: 8, y: 2026 };
    var parts = labels[0].textContent.trim().split(" ");
    if (parts.length === 2 && MESES.indexOf(parts[0]) > -1) { cur.m = MESES.indexOf(parts[0]); cur.y = Number(parts[1]); }
    var main = document.querySelector(".main");
    var note = document.createElement("div");
    note.className = "month-note";
    note.setAttribute("role", "status");
    note.hidden = true;
    if (main) main.insertBefore(note, main.querySelector(".topbar") ? main.querySelector(".topbar").nextSibling : main.firstChild);
    function paint() {
      var txt = MESES[cur.m] + " " + cur.y;
      labels.forEach(function (l) { l.textContent = txt; });
      var isCur = cur.m === 8 && cur.y === 2026;
      document.body.classList.toggle("month-is-current", isCur);
      note.hidden = isCur;
      note.innerHTML = '<strong>' + txt + ' ainda não tem dados.</strong> Este é um mockup: só setembro de 2026 tem dados fictícios. Os números abaixo continuam sendo os de setembro.';
    }
    document.querySelectorAll(".month-nav button").forEach(function (b) {
      var dir = /anterior/i.test(b.getAttribute("aria-label") || "") ? -1 : 1;
      b.addEventListener("click", function () {
        cur.m += dir; if (cur.m < 0) { cur.m = 11; cur.y--; } if (cur.m > 11) { cur.m = 0; cur.y++; }
        paint();
      });
    });
    paint();
  }
})();
