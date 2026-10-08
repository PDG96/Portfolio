/* ==========================================================================
   KOTA: the assistant on the bank's home dashboard.

   The dashboard answers "what is moving?". The assistant answers the next
   question, "so what do I do?", from the same numbers the cards show: it
   ranks what needs the reviewer, draws a chart nobody built yet, and drafts
   the reminders the Needs attention card asks for. Nothing lands on the
   dashboard or reaches an operator until the reviewer accepts it.
   ========================================================================== */
(function(){
  var A = window.KotaAssistant;
  if (!A) return;
  var esc = A.esc;

  function go(url){
    if (window.KOTA && KOTA.go) KOTA.go(url); else location.href = url;
  }

  /* The same book the map, the feed and Needs attention are drawn from. */
  var BOOK = [
    { name:'Tulivu Cooperative',        stage:'Ready',        pct:100 },
    { name:'Serandi Mining',            stage:'Registration', pct:100 },
    { name:'Riverbend cooperative',     stage:'Registration', pct:72 },
    { name:'Amani Bethem',              stage:'Registration', pct:55 },
    { name:'Mweka village association', stage:'Registration', pct:25 },
    { name:'Matoro',                    stage:'Invited',      pct:12 }
  ];
  var STAGES = [
    { k:'Invited',      label:'Invited',              color:'#AEB5BF' },
    { k:'Registration', label:'In registration',      color:'#85A5FF' },
    { k:'Ready',        label:'Ready for evaluation', color:'#E8723F' }
  ];
  STAGES.forEach(function(s){ s.n = BOOK.filter(function(b){ return b.stage === s.k; }).length; });

  var NUDGE = {
    mweka:{ name:'Mweka village association', av:'MW', why:'25% of registration, no progress in 2 weeks',
      text:'Hello, your registration with Banque Orimu is 25% done and has not moved in two weeks. ' +
           'You can pick up where you left off, and attach your certificates so Kota fills what it can for you to check.\n\nN. Okonkwo, Banque Orimu' },
    matoro:{ name:'Matoro', av:'MT', why:'invited a week ago, 12% of registration',
      text:'Hello, you were invited to register with Banque Orimu a week ago and your file is 12% done. ' +
           'Attach your certificates and Kota fills what it can for you to check.\n\nN. Okonkwo, Banque Orimu' }
  };

  /* ---- charts ---- */
  function stageDonut(size){
    var r = 15.9155, at = 0, total = BOOK.length;
    var arcs = STAGES.map(function(s){
      var len = s.n / total * 100, gap = 1.2;
      var a = '<circle cx="21" cy="21" r="' + r + '" fill="none" stroke="' + s.color + '" stroke-width="5" pathLength="100"' +
        ' stroke-dasharray="' + Math.max(0, len - gap) + ' ' + (100 - len + gap) + '" stroke-dashoffset="' + (-at) + '" transform="rotate(-90 21 21)"><title>' +
        esc(s.label) + ' · ' + s.n + '</title></circle>';
      at += len;
      return a;
    }).join('');
    return '<svg viewBox="0 0 42 42" width="' + size + '" height="' + size + '" role="img" aria-label="Six applicants by stage">' + arcs +
      '<text x="21" y="22.5" text-anchor="middle" font-size="8" font-weight="600" fill="#F6F6F6" font-family="Inter,sans-serif">' + total + '</text>' +
      '<text x="21" y="28.5" text-anchor="middle" font-size="3.2" fill="#898B8D" font-family="Inter,sans-serif">applicants</text></svg>';
  }

  function ring(b, size){
    var r = 15.9155, col = b.pct === 100 ? (b.stage === 'Ready' ? '#E8723F' : '#32D583') : b.pct < 30 ? '#FDB022' : '#85A5FF';
    return '<div class="kb-ring"><svg viewBox="0 0 42 42" width="' + size + '" height="' + size + '" role="img" aria-label="' + esc(b.name) + ' ' + b.pct + '%">' +
      '<circle cx="21" cy="21" r="' + r + '" fill="none" stroke="#2E3033" stroke-width="4"/>' +
      '<circle cx="21" cy="21" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="4" pathLength="100" stroke-linecap="round"' +
        ' stroke-dasharray="' + b.pct + ' ' + (100 - b.pct) + '" transform="rotate(-90 21 21)"/>' +
      '<text x="21" y="24" text-anchor="middle" font-size="9" font-weight="600" fill="#F6F6F6" font-family="Inter,sans-serif">' + b.pct + '%</text></svg>' +
      '<b>' + esc(b.name) + '</b><span>' + esc(b.stage === 'Ready' ? 'Ready for evaluation' : b.stage === 'Invited' ? 'Invited' : b.pct === 100 ? 'Forms done, not submitted' : 'In registration') + '</span></div>';
  }

  function chartBody(big){
    return '<div class="kb-chart' + (big ? ' kb-chart--big' : '') + '">' +
      '<div class="kb-d">' + stageDonut(big ? 168 : 104) +
        '<div class="kb-key">' + STAGES.map(function(s){
          return '<span><i style="background:' + s.color + '"></i>' + esc(s.label) + ' · ' + s.n + '</span>';
        }).join('') + '</div></div>' +
      '<div class="kb-rings">' + BOOK.map(function(b){ return ring(b, big ? 76 : 52); }).join('') + '</div>' +
    '</div>';
  }

  var css = document.createElement('style');
  css.textContent =
    '.kb-chart{display:grid;grid-template-columns:auto minmax(0,1fr);gap:32px;align-items:center}' +
    '.ka-card .kb-chart{grid-template-columns:minmax(0,1fr);gap:16px}' +
    '.kb-d{display:flex;align-items:center;gap:20px}' +
    '.kb-key{display:flex;flex-direction:column;gap:6px;font-size:12px;color:#898B8D}' +
    '.kb-key span{display:flex;align-items:center;gap:6px;white-space:nowrap}.kb-key i{width:10px;height:10px;border-radius:3px}' +
    '.kb-rings{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px 10px}' +
    '.kb-chart--big .kb-rings{grid-template-columns:repeat(6,minmax(0,1fr));gap:16px}' +
    '.kb-ring{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px;min-width:0}' +
    '.kb-ring b{font-size:12px;font-weight:600;color:#F6F6F6;line-height:16px;margin-top:4px}' +
    '.kb-ring span{font-size:11px;color:#898B8D;line-height:15px}' +
    '.kb-gen{grid-column:1/3}' +
    '.kb-gen .head .ka-mark{margin-top:6px}' +
    '.kb-gen .kb-rm{height:32px;padding:0 12px;border-radius:8px;border:1px solid #2B2C2D;background:#202122;color:#F6F6F6;font:inherit;font-size:13px;font-weight:500;cursor:pointer}' +
    '.kb-gen .kb-rm:hover{background:#2E3033}' +
    '.kb-n{display:grid;grid-template-columns:18px 1fr;gap:10px;padding:10px;border-radius:8px;background:var(--ka-ground)}' +
    '.kb-n input[type=checkbox]{margin:2px 0 0;accent-color:var(--ka-accent);width:15px;height:15px}' +
    '.kb-n .nt{font-size:13.5px;font-weight:600;color:var(--ka-ink)}.kb-n .nw{font-size:12px;color:var(--ka-muted);margin-top:2px}' +
    '.kb-n textarea{width:100%;box-sizing:border-box;margin-top:8px;min-height:112px;resize:vertical;border-radius:6px;border:1px solid #3A3C3E;background:#2A2B2D;color:var(--ka-ink);font:inherit;font-size:12.5px;line-height:18px;padding:8px}' +
    '.kb-n.is-off{opacity:.5}' +
    '.kb-sent{font-size:12px;color:#6CE9A6;white-space:nowrap}';
  document.head.appendChild(css);

  function addToPage(){
    var canvas = document.querySelector('.canvas');
    if (!canvas) return;
    var old = canvas.querySelector('.kb-gen');
    if (old) old.remove();
    var block = document.createElement('section');
    block.className = 'block kb-gen';
    block.innerHTML =
      '<div class="head"><div><h2>Where each applicant stands</h2><div class="sub">Stage and registration progress, all six applicants</div>' +
        A.mark('Made with Kota Assistant from On the ground and Needs attention') + '</div>' +
        '<button class="kb-rm" type="button">Remove</button></div>' +
      chartBody(true);
    canvas.appendChild(block);
    block.querySelector('.kb-rm').addEventListener('click', function(){ block.remove(); });
    block.scrollIntoView({ behavior:'smooth', block:'center' });
    setTimeout(function(){ A.glow(block); }, 300);
  }

  function chart(){
    return A.steps([
      { t:'Reading On the ground', m:BOOK.length + ' applicants across North Kivu, South Kivu and Maniema', ms:900 },
      { t:'Reading each registration', m:'From 12% (Matoro) to 100% (Tulivu, Serandi)', ms:900 },
      { t:'Choosing the chart', m:'Stages as a donut, each applicant as a progress ring', ms:800 }
    ], 'Building a chart').then(function(){
      return A.bot('<b>1 of 6</b> applicants is ready for evaluation. Four are in registration, and one of them, <b>Serandi Mining</b>, has finished its forms without submitting. ' +
        'Matoro and Mweka are the two furthest behind.');
    }).then(function(){
      var card = A.card('<div class="ka-card"><div class="ch"><div><div class="tt">Where each applicant stands</div>' +
        '<div class="ts">Preview · from On the ground and Needs attention</div></div></div>' +
        '<div class="cb">' + chartBody(false) + '</div>' +
        '<div class="cf"><span class="note">Only you see it until you add it</span>' +
        '<button class="ka-btn ka-btn--go" type="button" data-add>Add to dashboard</button></div></div>');
      card.querySelector('[data-add]').addEventListener('click', function(){
        card.classList.add('is-done');
        addToPage();
        A.bot('Added to the bottom of your dashboard. You can remove it from the card.', { who:false }).then(function(){
          A.chips([
            { t:'Nudge Serandi to submit', ask:'Draft a reminder for Serandi Mining' },
            { t:'Draft reminders for Mweka and Matoro', ask:'Draft reminders for Mweka and Matoro' }
          ]);
        });
      });
    });
  }

  /* ---- what needs the reviewer, read off the cards ---- */
  function today(){
    return A.steps([
      { t:'Reading Needs attention', m:'3 applicants waiting', ms:800 },
      { t:'Reading Latest updates', m:'Tulivu uploaded 2 documents yesterday', ms:800 },
      { t:'Ranking by who is waiting on you', m:'Your decision first, then stalled registrations', ms:700 }
    ], 'Reading your dashboard').then(function(){
      return A.bot('<p>Three things, in this order:</p><ul class="ka-list">' +
        '<li><span><b>Tulivu Cooperative is waiting on you.</b> Submitted 2 days ago; your two questions went out today.</span></li>' +
        '<li><span><b>Mweka village association</b> has been at 25% for 2 weeks.</span></li>' +
        '<li><span><b>Matoro</b> was invited a week ago and is at 12%.</span></li></ul>' +
        '<p>Both registrations are waiting on the operator, so a reminder is the next step.</p>');
    }).then(function(){
      A.chips([
        { t:'Open Tulivu’s review', run:function(){ go('operator-detail.html'); } },
        { t:'Draft reminders for Mweka and Matoro', ask:'Draft reminders for Mweka and Matoro' }
      ]);
    });
  }

  /* ---- reminders, drafted for the reviewer to send ---- */
  NUDGE.serandi = { name:'Serandi Mining', av:'SM', why:'forms complete, not submitted for 4 days',
    text:'Hello, all of your registration forms with Banque Orimu are complete. ' +
         'The last step is to press Submit for review on your file, and we start the evaluation from there.\n\nN. Okonkwo, Banque Orimu' };

  NUDGE.tulivu = { name:'Tulivu Cooperative', av:'TC', why:'2 questions open on Registration since today',
    text:'Hello, we left two questions on your registration: your tax identification number and your VAT registration number. ' +
         'Both are printed on your certificates, so attaching them is the quickest way to answer.\n\nN. Okonkwo, Banque Orimu' };

  function rowFor(name){
    var rows = document.querySelectorAll('#watch .row');
    for (var i = 0; i < rows.length; i++) if (rows[i].textContent.indexOf(name) > -1) return rows[i];
    return null;
  }

  function markSent(n){
    var row = rowFor(n.name);
    if (row){
      var btn = row.querySelector('.nudge:not([data-open])');
      if (btn){ var s = document.createElement('span'); s.className = 'kb-sent'; s.textContent = 'Reminder sent · just now'; btn.replaceWith(s); }
      A.glow(row);
    }
    var feed = document.getElementById('feed');
    if (feed){
      var el = document.createElement('div');
      el.className = 'e';
      el.style.cursor = 'default';
      el.innerHTML = '<span class="dot"></span><div><div class="t">You sent a reminder to ' + esc(n.name) + '</div>' +
        '<div class="m">Reminder · just now · drafted with Kota</div></div>';
      feed.insertBefore(el, feed.firstChild);
      A.glow(el);
    }
  }

  function remind(keys){
    var list = keys.map(function(k){ return NUDGE[k]; });
    return A.steps([
      { t:'Reading where each one stopped', m:list.map(function(n){ return n.name + ', ' + n.why; }).join(' · '), ms:900 },
      { t:'Writing to the next step', m:'Each message names what to do next, in a sentence', ms:800 }
    ], 'Drafting').then(function(){
      return A.bot(list.length > 1 ? 'Here are two short reminders. Each one says where they stopped and what to do next. Edit anything before sending.'
                                   : 'Here is a short reminder that says where they stopped and what to do next. Edit anything before sending.');
    }).then(function(){
      var card = A.card('<div class="ka-card"><div class="ch"><div><div class="tt">' + (list.length > 1 ? list.length + ' reminders' : 'Reminder') + '</div>' +
        '<div class="ts">From Needs attention · signed N. Okonkwo</div></div></div>' +
        '<div class="cb" style="display:flex;flex-direction:column;gap:8px">' + list.map(function(n, i){
          return '<label class="kb-n" data-i="' + i + '"><input type="checkbox" checked><div><div class="nt">' + esc(n.name) + '</div>' +
            '<div class="nw">' + esc(n.why) + '</div><textarea>' + esc(n.text) + '</textarea></div></label>';
        }).join('') + '</div>' +
        '<div class="cf"><span class="note">Nothing is sent until you press send</span>' +
        '<button class="ka-btn ka-btn--go" type="button" data-send>Send ' + (list.length > 1 ? list.length + ' reminders' : 'reminder') + '</button></div></div>');
      var send = card.querySelector('[data-send]');
      function count(){
        var n = card.querySelectorAll('.kb-n input:checked').length;
        send.disabled = !n;
        send.textContent = n > 1 ? 'Send ' + n + ' reminders' : 'Send reminder';
      }
      [].forEach.call(card.querySelectorAll('.kb-n input'), function(c){
        c.addEventListener('change', function(){ c.closest('.kb-n').classList.toggle('is-off', !c.checked); count(); });
      });
      send.addEventListener('click', function(){
        var sent = [];
        [].forEach.call(card.querySelectorAll('.kb-n'), function(el){
          if (el.querySelector('input').checked) sent.push(list[+el.getAttribute('data-i')]);
        });
        if (!sent.length) return;
        card.classList.add('is-done');
        sent.forEach(markSent);
        A.bot('Sent to ' + sent.map(function(n){ return esc(n.name); }).join(' and ') + '. It shows in Latest updates, and Needs attention marks it so nobody sends it twice.', { who:false })
          .then(function(){ A.chips([{ t:'Chart where each applicant stands', ask:'Add a chart of where each applicant stands' }]); });
      });
    });
  }

  /* The card's own Send reminder buttons hand the job to the assistant. */
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('#watch .nudge:not([data-open])');
    if (!b) return;
    e.stopPropagation();
    var row = b.closest('.row'), t = row ? row.textContent : '';
    var k = /Mweka/.test(t) ? 'mweka' : /Matoro/.test(t) ? 'matoro' : /Tulivu/.test(t) ? 'tulivu' : null;
    if (!k) return;
    A.open();
    A.ask('Draft a reminder for ' + NUDGE[k].name);
  }, true);

  /* The dock narrows the page; the curve redraws on resize, so tell it. */
  new MutationObserver(function(){ window.dispatchEvent(new Event('resize')); })
    .observe(document.body, { attributes:true, attributeFilter:['class'] });

  function onAsk(text){
    var t = text.toLowerCase();
    if (/chart|graph|grafico|gráfico|stand|stage|progress|visual/.test(t)) return chart();
    if (/remind|nudge|lembrete|cobrar/.test(t)){
      var keys = [];
      if (/mweka/.test(t)) keys.push('mweka');
      if (/matoro/.test(t)) keys.push('matoro');
      if (/serandi/.test(t)) keys.push('serandi');
      if (/tulivu/.test(t)) keys.push('tulivu');
      return remind(keys.length ? keys : ['mweka', 'matoro']);
    }
    if (/tulivu|review|decision|open/.test(t) && !/today|need|first/.test(t)){
      return A.bot('Tulivu’s file is ready for your decision. Taking you there.')
        .then(function(){ return A.wait(700); }).then(function(){ go('operator-detail.html'); });
    }
    if (/need|today|first|priorit|attention|what now|hoje|o que/.test(t)) return today();
    return A.bot('On this dashboard I can rank what needs you, chart where each applicant stands, and draft reminders for the ones who stalled.')
      .then(function(){ A.chips(START); });
  }

  var START = [
    { t:'What needs me today?', ask:'What needs me today?' },
    { t:'Chart where each applicant stands', ask:'Add a chart of where each applicant stands' },
    { t:'Draft reminders for stalled applicants', ask:'Draft reminders for Mweka and Matoro' }
  ];

  A.init({
    context:'Your applicants · Banque Orimu',
    greeting:'<p>Hi. You have <b>6 applicants</b>: one is ready for your decision and two have stalled. Ask me what to do first.</p>',
    placeholder:'Ask about your applicants',
    chips:START,
    onAsk:onAsk,
    autoOpen:/[?&]assist=/.test(location.search)
  });

  /* Arriving from Evaluation's "Draft reminders on Home". */
  if (/[?&]assist=remind/.test(location.search)) setTimeout(function(){ A.ask('Draft reminders for Mweka and Matoro'); }, 700);
})();
