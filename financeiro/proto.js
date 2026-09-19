/* finapp: comportamentos genéricos do protótipo. Carregar depois de shell.js.
   - toast(msg, {undo})           feedback de qualquer ação
   - openSheet({title, body, primary, secondary})  sheet construído na hora
   - [data-open="id"] / [data-close] abrem e fecham sheets já no HTML
   - [role="tab"] dentro de .seg/.tabs alternam aria-selected e disparam "tabchange"
   - [data-toast="msg"] em qualquer botão mostra feedback
   - [data-go="url"] navega
   - querystring ?conta=&categoria=&etiqueta= é lida por quem quiser (Proto.query) */
window.Proto = (function () {
  var P = {};

  // ---------- Toast ----------
  var toastEl = null, toastTimer = null;
  P.toast = function (msg, opts) {
    opts = opts || {};
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.innerHTML = '<span>' + msg + '</span>' + (opts.undo ? ' <button type="button">Desfazer</button>' : '');
    toastEl.hidden = false;
    if (opts.undo) toastEl.querySelector('button').addEventListener('click', function () { toastEl.hidden = true; opts.undo(); });
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.hidden = true; }, opts.ms || 5000);
  };

  // ---------- Sheets ----------
  var lastOpener = null;
  function bindClose(overlay, onClose) {
    function close() { overlay.hidden = true; if (onClose) onClose(); if (lastOpener) lastOpener.focus(); }
    overlay.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    overlay._close = close;
  }
  P.open = function (id) {
    var o = document.getElementById(id); if (!o) return;
    lastOpener = document.activeElement; o.hidden = false;
    var f = o.querySelector('input, select, textarea, button:not([data-close])'); if (f) f.focus();
  };
  P.close = function (id) { var o = document.getElementById(id); if (o && o._close) o._close(); };
  P.openSheet = function (cfg) {
    var old = document.getElementById('proto-sheet'); if (old) old.remove();
    var o = document.createElement('div');
    o.className = 'overlay'; o.id = 'proto-sheet'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); o.setAttribute('aria-labelledby', 'proto-sheet-title');
    o.innerHTML = '<div class="sheet"><div class="sheet-header"><h2 id="proto-sheet-title"></h2><button class="btn btn-tertiary btn-icon btn-sm" type="button" data-close aria-label="Fechar"><svg class="icon"><use href="#i-x"/></svg></button></div>'
      + '<form class="sheet-body" id="proto-sheet-form"></form>'
      + '<div class="sheet-footer"><button class="btn btn-secondary" type="button" data-close>' + (cfg.secondary || 'Cancelar') + '</button>'
      + (cfg.primary ? '<button class="btn btn-primary" type="submit" form="proto-sheet-form">' + cfg.primary + '</button>' : '') + '</div></div>';
    o.querySelector('h2').textContent = cfg.title;
    o.querySelector('form').innerHTML = cfg.body || '';
    document.body.appendChild(o);
    bindClose(o, cfg.onClose);
    o.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); if (cfg.onSubmit) cfg.onSubmit(o.querySelector('form')); o._close(); });
    lastOpener = document.activeElement;
    var f = o.querySelector('input, select, textarea'); if (f) f.focus(); else o.querySelector('[data-close]').focus();
    return o;
  };
  document.querySelectorAll('.overlay[id]').forEach(function (o) { bindClose(o); });
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-open]'); if (b) { e.preventDefault(); P.open(b.dataset.open); return; }
    var t = e.target.closest('[data-toast]'); if (t) { e.preventDefault(); P.toast(t.dataset.toast); return; }
    var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); location.href = g.dataset.go; }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.overlay:not([hidden])').forEach(function (o) { if (o._close) o._close(); });
  });

  // ---------- Tabs / segmented ----------
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    list.querySelectorAll('[role="tab"]').forEach(function (t) {
      t.addEventListener('click', function () {
        list.querySelectorAll('[role="tab"]').forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        t.setAttribute('aria-selected', 'true');
        list.dispatchEvent(new CustomEvent('tabchange', { detail: { tab: t, value: t.dataset.value || t.textContent.trim() } }));
      });
    });
  });

  // ---------- Chips simples (aria-pressed) sem data-toggle/data-menu ----------
  document.querySelectorAll('.chip[aria-pressed]:not([data-toggle]):not([data-menu])').forEach(function (c) {
    c.addEventListener('click', function () { c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') !== 'true'); });
  });

  // ---------- Query string ----------
  P.query = {};
  location.search.replace(/^\?/, '').split('&').forEach(function (kv) { if (!kv) return; var p = kv.split('='); P.query[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ''); });

  // ---------- Formatação ----------
  P.brl = function (v, sign) {
    var a = Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (sign ? (v < 0 ? '− ' : '+ ') : (v < 0 ? '− ' : '')) + 'R$ ' + a;
  };
  P.parse = function (s) { return Number(String(s).replace(/[^\d,-]/g, '').replace(',', '.')) || 0; };

  // ---------- Sino: alertas ----------
  document.querySelectorAll('[aria-label^="Alertas"]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.preventDefault();
      P.openSheet({ title: 'Alertas', secondary: 'Fechar', body:
        '<div class="list" style="margin:0 calc(-1 * var(--space-24))">'
        + '<a class="row" href="01-inicio.html"><div class="ic"><svg class="icon"><use href="#i-clock"/></svg></div><div class="t"><strong>Luz vence amanhã</strong><span>R$ 168,40 · dia 20</span></div></a>'
        + '<a class="row" href="04-compromissos.html"><div class="ic"><svg class="icon"><use href="#i-alert"/></svg></div><div class="t"><strong>Conta principal não cobre os próximos 7 dias</strong><span>R$ 987,62 a vencer · saldo R$ 772,99</span></div></a>'
        + '<a class="row" href="04-compromissos.html#receber"><div class="ic"><svg class="icon"><use href="#i-arrow-down-right"/></svg></div><div class="t"><strong>Parcela a receber atrasada</strong><span>Venda do carro · R$ 1.950,00</span></div></a>'
        + '</div><label class="check"><input type="checkbox" checked> Avisar 3 dias antes de cada vencimento</label>' });
    });
  });

  if (P.query.toast) setTimeout(function () { P.toast(P.query.toast); }, 200);

  return P;
})();
