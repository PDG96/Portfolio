/* ==========================================================================
   KOTA: the assistant's engine.

   The panel, the composer and the three things every answer is made of:
   the work it did (steps), what it says (text), and what it proposes (a
   card the person accepts or leaves). Nothing in here knows about a page.
   Each screen hands it a context, a few starting prompts and a function
   that reads what was typed.

   The prototype has no model behind it: each screen scripts its answers
   from the data already on that screen. The timings are there so the work
   reads as work, not to fake latency for its own sake.
   ========================================================================== */
(function(global){

  var I = {
    spark:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c.4 3.9 1.6 6.2 3.3 7.6 1.6 1.3 3.6 1.7 6.2 1.9-2.6.2-4.6.6-6.2 1.9-1.7 1.4-2.9 3.7-3.3 7.6-.4-3.9-1.6-6.2-3.3-7.6C7.1 12.6 5.1 12.2 2.5 12c2.6-.2 4.6-.6 6.2-1.9C10.4 8.7 11.6 6.4 12 2.5Z"/></svg>',
    x:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    clip:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m21.4 11.1-8.5 8.5a5.5 5.5 0 0 1-7.8-7.8l8.5-8.5a3.7 3.7 0 0 1 5.2 5.2l-8.5 8.5a1.8 1.8 0 0 1-2.6-2.6l7.8-7.8"/></svg>',
    send:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    file:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2v6a2 2 0 0 0 2 2h6M15 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5l-3-3Z"/></svg>',
    up:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>',
    check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v4.5M12 16h.01"/></svg>',
    chev:'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
  };

  function el(html){
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstChild;
  }
  function esc(s){
    return String(s).replace(/[&<>"]/g, function(c){
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c];
    });
  }
  function wait(ms){ return new Promise(function(r){ setTimeout(r, ms); }); }
  var reduced = global.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var A = { icons:I, esc:esc, wait:wait, busy:false };
  var cfg, panel, log, box, sendBtn, pendingEl, menu, orbHead, picker;
  var pending = [];

  function orb(cls){ return '<span class="ka-orb ' + (cls || '') + '">' + I.spark + '</span>'; }

  function build(){
    var launch = el('<button class="ka-launch" type="button" aria-label="Open Kota Assistant">' +
      orb() + 'Ask Kota<kbd>⌘J</kbd></button>');
    launch.addEventListener('click', function(){ A.open(); });
    document.body.appendChild(launch);

    panel = el(
      '<aside class="ka-panel" aria-label="Kota Assistant" aria-hidden="true">' +
        '<div class="ka-head">' + orb() +
          '<div><div class="t">Kota Assistant</div>' +
          '<div class="c"><i></i><span>' + esc(cfg.context) + '</span></div></div>' +
          '<button class="ka-x" type="button" aria-label="Close assistant">' + I.x + '</button>' +
        '</div>' +
        '<div class="ka-log" role="log" aria-live="polite"></div>' +
        '<div class="ka-foot">' +
          '<div class="ka-menu" role="menu"></div>' +
          '<div class="ka-pending"></div>' +
          '<div class="ka-box">' +
            '<button class="ka-ib ka-attach" type="button" aria-label="Attach documents"' +
              (cfg.attach ? '' : ' hidden') + '>' + I.clip + '</button>' +
            '<textarea rows="1" placeholder="' + esc(cfg.placeholder || 'Ask about this screen') + '"></textarea>' +
            '<button class="ka-ib ka-ib--send" type="button" aria-label="Send" disabled>' + I.send + '</button>' +
          '</div>' +
          '<div class="ka-fine">Kota proposes. You review every change before it is saved or sent.</div>' +
        '</div>' +
      '</aside>');
    document.body.appendChild(panel);

    log = panel.querySelector('.ka-log');
    box = panel.querySelector('textarea');
    sendBtn = panel.querySelector('.ka-ib--send');
    pendingEl = panel.querySelector('.ka-pending');
    menu = panel.querySelector('.ka-menu');
    orbHead = panel.querySelector('.ka-head .ka-orb');

    panel.querySelector('.ka-x').addEventListener('click', function(){ A.close(); });
    box.addEventListener('input', function(){ grow(); sync(); });
    box.addEventListener('keydown', function(e){
      if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); submit(); }
    });
    sendBtn.addEventListener('click', submit);

    if (cfg.attach){
      picker = el('<input type="file" multiple hidden>');
      document.body.appendChild(picker);
      picker.addEventListener('change', function(){
        [].forEach.call(picker.files || [], function(f){
          pending.push({ n:f.name, s:size(f.size), real:true });
        });
        picker.value = '';
        drawPending();
      });
      panel.querySelector('.ka-attach').addEventListener('click', function(e){
        e.stopPropagation();
        drawMenu();
        menu.classList.toggle('is-on');
      });
      document.addEventListener('click', function(e){
        if (!menu.contains(e.target)) menu.classList.remove('is-on');
      });
    }

    document.addEventListener('keydown', function(e){
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j'){ e.preventDefault(); A.toggle(); }
      if (e.key === 'Escape' && document.body.classList.contains('ka-open') &&
          panel.contains(document.activeElement)) A.close();
    });
    addEventListener('resize', dockCheck);
  }

  function size(b){
    if (b < 1048576) return Math.max(1, Math.round(b / 1024)) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }

  function drawMenu(){
    var docs = cfg.attach.samples || [];
    menu.innerHTML =
      (docs.length ? '<div class="lbl">' + esc(cfg.attach.label || 'Documents') + '</div>' : '') +
      docs.map(function(d, i){
        return '<button type="button" data-i="' + i + '">' + I.file +
          '<span>' + esc(d.n) + '<span class="s">' + esc(d.s) + '</span></span></button>';
      }).join('') +
      (docs.length > 1 ? '<button type="button" data-all>' + I.file +
        '<span>All ' + docs.length + ' documents</span></button>' : '') +
      (cfg.attach.hard ? '<div class="sep"></div><div class="lbl">' + esc(cfg.attach.hardLabel || 'Harder cases') + '</div>' +
        cfg.attach.hard.map(function(d, i){
          return '<button type="button" data-h="' + i + '">' + I.warn +
            '<span>' + esc(d.n) + '<span class="s">' + esc(d.s) + '</span></span></button>';
        }).join('') : '') +
      '<div class="sep"></div>' +
      '<button type="button" data-pc>' + I.up + '<span>Upload from this computer</span></button>';
    [].forEach.call(menu.querySelectorAll('[data-i]'), function(b){
      b.addEventListener('click', function(){ add(docs[+b.getAttribute('data-i')]); });
    });
    [].forEach.call(menu.querySelectorAll('[data-h]'), function(b){
      b.addEventListener('click', function(){ add(cfg.attach.hard[+b.getAttribute('data-h')]); });
    });
    var all = menu.querySelector('[data-all]');
    if (all) all.addEventListener('click', function(){ docs.forEach(add); });
    menu.querySelector('[data-pc]').addEventListener('click', function(){
      menu.classList.remove('is-on'); picker.click();
    });
    function add(d){
      if (!pending.some(function(p){ return p.n === d.n; })) pending.push(d);
      menu.classList.remove('is-on');
      drawPending();
      box.focus();
    }
  }

  function drawPending(){
    pendingEl.innerHTML = pending.map(function(p, i){
      return '<span class="ka-file">' + I.file + '<span>' + esc(p.n) + '</span>' +
        '<button type="button" aria-label="Remove ' + esc(p.n) + '" data-rm="' + i + '">' + I.x + '</button></span>';
    }).join('');
    [].forEach.call(pendingEl.querySelectorAll('[data-rm]'), function(b){
      b.addEventListener('click', function(){ pending.splice(+b.getAttribute('data-rm'), 1); drawPending(); });
    });
    sync();
  }

  function grow(){ box.style.height = 'auto'; box.style.height = Math.min(box.scrollHeight, 160) + 'px'; }
  function sync(){ sendBtn.disabled = A.busy || (!box.value.trim() && !pending.length); }

  function submit(){
    if (sendBtn.disabled) return;
    var text = box.value.trim(), files = pending.slice();
    box.value = ''; pending = []; drawPending(); grow();
    A.ask(text, files);
  }

  function dockCheck(){
    /* Dock only when the page keeps its full width beside the panel. */
    var need = (cfg.minPage || 1440) + 400;
    document.body.classList.toggle('ka-dock', innerWidth >= need);
  }

  function scroll(){ log.scrollTop = log.scrollHeight; }

  /* ---- public ---- */
  A.init = function(c){
    cfg = c;
    build();
    dockCheck();
    A.intro();
    if (cfg.autoOpen) A.open();
  };

  A.intro = function(){
    A.bot(cfg.greeting, { instant:true });
    if (cfg.chips) A.chips(cfg.chips);
  };

  A.open = function(){
    document.body.classList.add('ka-open');
    panel.setAttribute('aria-hidden', 'false');
    setTimeout(function(){ box.focus(); dispatchEvent(new Event('resize')); }, 240);
  };
  A.close = function(){
    document.body.classList.remove('ka-open');
    panel.setAttribute('aria-hidden', 'true');
    setTimeout(function(){ dispatchEvent(new Event('resize')); }, 240);
  };
  A.toggle = function(){ document.body.classList.contains('ka-open') ? A.close() : A.open(); };

  /* What the person sent, then hand it to the screen. */
  A.ask = function(text, files){
    A.open();
    A.me(text, files);
    A.busy = true; sync();
    orbHead.classList.add('is-busy');
    Promise.resolve(cfg.onAsk(text, files || [], A)).then(done, function(err){
      console.error(err); done();
    });
    function done(){ A.busy = false; sync(); orbHead.classList.remove('is-busy'); }
  };

  A.me = function(text, files){
    var m = el('<div class="ka-msg ka-msg--me"></div>');
    if (files && files.length){
      m.appendChild(el('<div class="ka-files">' + files.map(function(f){
        return '<span class="ka-file">' + I.file + '<span>' + esc(f.n) + '</span></span>';
      }).join('') + '</div>'));
    }
    if (text) m.appendChild(el('<div class="ka-bubble">' + esc(text) + '</div>'));
    log.appendChild(m); scroll();
  };

  /* A bot turn. Text arrives a few words at a time; html is trusted, it is
     written by the screen, never by the person. */
  A.bot = function(html, o){
    o = o || {};
    var m = el('<div class="ka-msg ka-msg--bot">' +
      (o.who === false ? '' : '<div class="ka-who">' + orb() + 'Kota</div>') +
      '<div class="ka-text"></div></div>');
    log.appendChild(m);
    var t = m.querySelector('.ka-text');
    if (o.instant || reduced){ t.innerHTML = html; scroll(); return Promise.resolve(m); }
    return reveal(t, html).then(function(){ return m; });
  };

  function reveal(t, html){
    /* Word by word over the text nodes, so links and bold survive. */
    t.innerHTML = html;
    var nodes = [], walk = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) nodes.push(walk.currentNode);
    var full = nodes.map(function(n){ return n.nodeValue; });
    nodes.forEach(function(n){ n.nodeValue = ''; });
    var ni = 0, words = full[0] ? full[0].split(/(\s+)/) : [], wi = 0;
    return new Promise(function(res){
      (function tick(){
        for (var k = 0; k < 3; k++){
          while (ni < nodes.length && wi >= words.length){
            ni++; wi = 0; words = ni < nodes.length ? full[ni].split(/(\s+)/) : [];
          }
          if (ni >= nodes.length){ scroll(); return res(); }
          nodes[ni].nodeValue += words[wi++];
        }
        scroll();
        setTimeout(tick, 28);
      })();
    });
  };

  A.typing = function(){
    var m = el('<div class="ka-msg ka-msg--bot"><div class="ka-who">' + orb() + 'Kota</div>' +
      '<span class="ka-typing"><i></i><i></i><i></i></span></div>');
    log.appendChild(m); scroll();
    return { done:function(){ m.remove(); } };
  };

  /* The work, step by step. Each step: { t:'what', m:'detail', ms:900 }. */
  A.steps = function(list, label){
    var box = el('<details class="ka-steps" open><summary>' +
      '<span class="ka-spin"></span><span class="sl">' + esc(label || 'Working') + '</span>' + I.chev +
      '</summary><ol>' + list.map(function(s){
        return '<li class="is-wait"><span class="s"></span><span>' + esc(s.t) +
          (s.m ? '<span class="m">' + esc(s.m) + '</span>' : '') + '</span></li>';
      }).join('') + '</ol></details>');
    var wrap = el('<div class="ka-msg ka-msg--bot"><div class="ka-who">' + orb() + 'Kota</div></div>');
    wrap.appendChild(box);
    log.appendChild(wrap); scroll();
    var lis = box.querySelectorAll('li'), t0 = Date.now();
    var chain = Promise.resolve();
    list.forEach(function(s, i){
      chain = chain.then(function(){
        lis[i].classList.remove('is-wait');
        lis[i].querySelector('.s').innerHTML = '<span class="ka-spin"></span>';
        scroll();
        return wait(reduced ? 80 : (s.ms || 800));
      }).then(function(){
        lis[i].querySelector('.s').innerHTML = s.warn ? '<span style="color:var(--ka-warn);display:grid">' + I.warn + '</span>' : I.check;
      });
    });
    return chain.then(function(){
      var secs = Math.max(1, Math.round((Date.now() - t0) / 1000));
      box.querySelector('summary .ka-spin').outerHTML = '<span class="s" style="display:grid;color:var(--ka-good)">' + I.check + '</span>';
      box.querySelector('.sl').textContent = list.length + ' steps · ' + secs + 's';
      box.open = false;
      return wrap;
    });
  };

  /* A card the person acts on. Returns the element; the screen wires it. */
  A.card = function(html){
    var c = el('<div class="ka-msg ka-msg--bot">' + html + '</div>');
    log.appendChild(c); scroll();
    return c.firstChild;
  };

  /* Starting points and next steps. Each chip is { t:'label', ask:'text' }
     (sent as if typed) or { t:'label', run:fn }. */
  A.chips = function(list){
    var c = el('<div class="ka-msg ka-msg--bot"><div class="ka-chips"></div></div>');
    var row = c.firstChild;
    list.forEach(function(ch){
      var b = el('<button class="ka-chip" type="button">' + I.spark + esc(ch.t) + '</button>');
      b.addEventListener('click', function(){
        if (A.busy) return;
        c.remove();
        if (ch.run) ch.run(A); else A.ask(ch.ask || ch.t, ch.files || []);
      });
      row.appendChild(b);
    });
    log.appendChild(c); scroll();
    return c;
  };

  A.prefill = function(text, files){
    A.open();
    box.value = text || '';
    if (files){ files.forEach(function(f){ if (!pending.some(function(p){ return p.n === f.n; })) pending.push(f); }); drawPending(); }
    grow(); sync();
    setTimeout(function(){ box.focus(); box.setSelectionRange(box.value.length, box.value.length); }, 260);
  };

  A.openAttach = function(){
    A.open();
    if (!cfg.attach) return;
    setTimeout(function(){ drawMenu(); menu.classList.add('is-on'); }, 260);
  };

  /* The mark an assistant-written thing carries on the page. */
  A.mark = function(text, badge){
    return '<span class="ka-mark">' + I.spark + esc(text) +
      (badge ? '<span class="ka-badge ka-badge--check">' + esc(badge) + '</span>' : '') + '</span>';
  };

  A.glow = function(node){
    if (!node) return;
    node.classList.remove('ka-glow'); void node.offsetWidth; node.classList.add('ka-glow');
    node.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block:'center' });
  };

  global.KotaAssistant = A;
})(window);
