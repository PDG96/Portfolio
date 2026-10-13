/* ==========================================================================
   KOTA: the assistant on the bank's review of an operator.

   Two jobs a reviewer does by hand today. One: asking a new question of the
   data, which means waiting for someone to build a chart. Two: asking the
   operator for more, which means writing a form. The assistant does both
   from a sentence, using only what is already on this screen, and nothing
   lands on the page or goes to Tulivu until the reviewer accepts it.
   ========================================================================== */
(function(){
  var A = window.KotaAssistant, R = window.KotaReview || {};
  if (!A) return;
  var esc = A.esc, wait = A.wait;

  /* The same series the Insights cards are drawn from. */
  var SHIP = [
    { m:'Jan', total:3,  flagged:1 }, { m:'Feb', total:10, flagged:5 }, { m:'Mar', total:7, flagged:4 },
    { m:'Apr', total:6,  flagged:3 }, { m:'May', total:8,  flagged:3 }, { m:'Jun', total:9, flagged:1 },
    { m:'Jul', total:5,  flagged:2 }
  ];
  var VOL = [
    { m:'Jan', v:4.6 }, { m:'Feb', v:5.9 }, { m:'Mar', v:5.6 }, { m:'Apr', v:5.9 },
    { m:'May', v:5.9 }, { m:'Jun', v:5.7 }, { m:'Jul', v:5.9 }, { m:'Aug', v:5.9 },
    { m:'Sep', v:6.3 }, { m:'Oct', v:6.5 }, { m:'Nov', v:7.2 }, { m:'Dec', v:6.7 }
  ];
  var FLAG = '#D9743F', OTHER = '#AEB5BF';

  var shipTotal = SHIP.reduce(function(a, d){ return a + d.total; }, 0);
  var shipFlag  = SHIP.reduce(function(a, d){ return a + d.flagged; }, 0);
  var shipPct   = Math.round(shipFlag / shipTotal * 100);
  var volSum    = VOL.reduce(function(a, d){ return a + d.v; }, 0);
  var volAvg    = volSum / VOL.length;
  var volPeak   = VOL.reduce(function(a, d){ return d.v > a.v ? d : a; });

  /* ---- charts ---- */
  function donut(pct, size){
    var r = 15.9155;
    return '<svg viewBox="0 0 42 42" width="' + size + '" height="' + size + '" role="img" aria-label="' + pct + '% from Rubaya">' +
      '<circle cx="21" cy="21" r="' + r + '" fill="none" stroke="' + OTHER + '" stroke-opacity=".35" stroke-width="5"/>' +
      '<circle cx="21" cy="21" r="' + r + '" fill="none" stroke="' + FLAG + '" stroke-width="5" pathLength="100"' +
        ' stroke-dasharray="' + pct + ' ' + (100 - pct) + '" transform="rotate(-90 21 21)" stroke-linecap="butt"/>' +
      '<text x="21" y="22.5" text-anchor="middle" font-size="8" font-weight="600" fill="#F6F6F6" font-family="Inter,sans-serif">' + pct + '%</text>' +
      '<text x="21" y="28.5" text-anchor="middle" font-size="3.2" fill="#898B8D" font-family="Inter,sans-serif">from Rubaya</text>' +
      '</svg>';
  }

  /* One line chart for both questions: points, an area under them, gridlines
     and an optional reference line (the average). */
  function line(pts, o){
    var W = o.w || 640, H = o.h || 220, L = 36, B = 26, T = 10, Rr = 12;
    var max = o.max, min = o.min || 0;
    var x = function(i){ return L + i * (W - L - Rr) / (pts.length - 1); };
    var y = function(v){ return T + (1 - (v - min) / (max - min)) * (H - T - B); };
    var g = '', i;
    for (i = 0; i <= 4; i++){
      var v = min + (max - min) * i / 4;
      g += '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#2B2C2D"/>' +
           '<text x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end" font-size="11" fill="#898B8D">' + o.tick(v) + '</text>';
    }
    var d = pts.map(function(p, i){ return (i ? 'L' : 'M') + x(i) + ' ' + y(p.v); }).join(' ');
    var area = d + ' L' + x(pts.length - 1) + ' ' + y(min) + ' L' + x(0) + ' ' + y(min) + ' Z';
    var id = 'kag' + Math.random().toString(36).slice(2, 7);
    var ref = o.ref == null ? '' :
      '<line x1="' + L + '" x2="' + (W - Rr) + '" y1="' + y(o.ref) + '" y2="' + y(o.ref) + '" stroke="#F6F6F6" stroke-opacity=".5" stroke-dasharray="4 4"/>' +
      '<text x="' + (W - Rr) + '" y="' + (y(o.ref) - 6) + '" text-anchor="end" font-size="11" fill="#D3D4D4">' + esc(o.refLabel) + '</text>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" style="display:block;overflow:visible" font-family="Inter,sans-serif" role="img" aria-label="' + esc(o.label) + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.color + '" stop-opacity=".35"/><stop offset="1" stop-color="' + o.color + '" stop-opacity="0"/></linearGradient></defs>' +
      g + ref +
      '<path d="' + area + '" fill="url(#' + id + ')"/>' +
      '<path d="' + d + '" fill="none" stroke="' + o.color + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      pts.map(function(p, i){
        return '<circle cx="' + x(i) + '" cy="' + y(p.v) + '" r="4" fill="#1D1D1E" stroke="' + o.color + '" stroke-width="2"><title>' + esc(p.tip) + '</title></circle>' +
          (o.labels ? '<text x="' + x(i) + '" y="' + (y(p.v) - 10) + '" text-anchor="middle" font-size="11" font-weight="600" fill="#F6F6F6">' + o.tick(p.v) + '</text>' : '') +
          '<text x="' + x(i) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11" fill="#898B8D">' + p.m + '</text>';
      }).join('') +
      '</svg>';
  }

  var CHARTS = {
    rubaya: {
      title:'Share of consignments from Rubaya',
      sub:'Monthly share inside the conflict-affected concession, Jan to Jul',
      from:'Shipments per month',
      steps:[
        { t:'Reading Shipments per month', m:SHIP.length + ' months · ' + shipTotal + ' consignments', ms:900 },
        { t:'Splitting each month by site', m:shipFlag + ' from the Rubaya concession, ' + (shipTotal - shipFlag) + ' from other sites', ms:900 },
        { t:'Choosing the chart', m:'A share over time reads best as a line; the total as a donut', ms:800 }
      ],
      say:function(){
        var hi = SHIP.reduce(function(a, d){ return d.flagged / d.total > a.flagged / a.total ? d : a; });
        return '<b>' + shipPct + '%</b> of Tulivu’s consignments came from the Rubaya concession (' + shipFlag + ' of ' + shipTotal + '). ' +
          'The share peaked in ' + hi.m + ' at ' + Math.round(hi.flagged / hi.total * 100) + '% and dropped to 11% in Jun before rising again.';
      },
      body:function(big, lw){
        var pts = SHIP.map(function(d){
          var p = Math.round(d.flagged / d.total * 100);
          return { m:d.m, v:p, tip:d.m + ' · ' + d.flagged + ' of ' + d.total + ' from Rubaya' };
        });
        return '<div class="ka-chart">' +
          '<div class="ka-chart-d">' + donut(shipPct, big ? 168 : 96) +
            '<div class="ka-key"><span><i style="background:' + FLAG + '"></i>Rubaya concession · ' + shipFlag + '</span>' +
            '<span><i style="background:' + OTHER + '"></i>Other sites · ' + (shipTotal - shipFlag) + '</span></div></div>' +
          '<div class="ka-chart-l">' + line(pts, { max:100, color:FLAG, labels:big, w:lw, h:big ? 230 : 110,
            tick:function(v){ return Math.round(v) + '%'; }, label:'Share from Rubaya per month' }) + '</div>' +
        '</div>';
      }
    },
    volume: {
      title:'Declared volume against the year’s average',
      sub:'Monthly declared output in tonnes, Jan to Dec',
      from:'Declared volume',
      steps:[
        { t:'Reading Declared volume', m:VOL.length + ' months · ' + volSum.toFixed(1) + ' t in total', ms:900 },
        { t:'Working out the average and the peak', m:'Average ' + volAvg.toFixed(1) + ' t · peak ' + volPeak.v + ' t in ' + volPeak.m, ms:900 },
        { t:'Choosing the chart', m:'A trend against its average reads best as a line', ms:700 }
      ],
      say:function(){
        var up = Math.round((VOL[VOL.length - 1].v / VOL[0].v - 1) * 100);
        return 'Declared output grew <b>' + up + '%</b> from Jan to Dec, averaging ' + volAvg.toFixed(1) + ' t a month. ' +
          'Every month from Sep onward sits above the average, with the peak in ' + volPeak.m + ' at ' + volPeak.v + ' t.';
      },
      body:function(big, lw){
        var pts = VOL.map(function(d){ return { m:d.m, v:d.v, tip:d.m + ' · ' + d.v.toFixed(1) + ' t' }; });
        return '<div class="ka-chart ka-chart--solo"><div class="ka-chart-l">' +
          line(pts, { max:8, min:4, color:'#85A5FF', labels:big, w:lw, h:big ? 230 : 140, ref:volAvg,
            refLabel:'Average ' + volAvg.toFixed(1) + ' t', tick:function(v){ return v.toFixed(1); },
            label:'Declared volume per month' }) +
          '</div></div>';
      }
    }
  };

  /* Styles for the generated card: the page's own block, plus the two halves. */
  var css = document.createElement('style');
  css.textContent =
    '.ka-chart{display:grid;grid-template-columns:auto minmax(0,1fr);gap:28px;align-items:center}' +
    '.ka-chart--solo{grid-template-columns:minmax(0,1fr)}' +
    '.ka-chart-d{display:flex;flex-direction:column;align-items:center;gap:12px}' +
    '.ka-key{display:flex;flex-direction:column;gap:6px;font-size:12px;color:#898B8D}' +
    '.ka-key span{display:flex;align-items:center;gap:6px}.ka-key i{width:10px;height:10px;border-radius:3px}' +
    '.ka-card .ka-chart{grid-template-columns:minmax(0,1fr);gap:14px}.ka-card .ka-chart-d{flex-direction:row;gap:16px}' +
    '.ka-gen{grid-column:1/3}' +
    '.ka-gen .head .ka-mark{margin-top:6px}' +
    '.ka-gen .acts{display:flex;gap:8px}' +
    '.ka-q{display:grid;grid-template-columns:18px 1fr;gap:10px;padding:10px;border-radius:8px;background:var(--ka-ground)}' +
    '.ka-q input[type=checkbox]{margin:2px 0 0;accent-color:var(--ka-accent);width:15px;height:15px}' +
    '.ka-q .qt{font-size:13.5px;color:var(--ka-ink);line-height:19px}' +
    '.ka-q .qm{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px}' +
    '.ka-q select{height:26px;border-radius:6px;border:1px solid #3A3C3E;background:#2A2B2D;color:var(--ka-ink);font:inherit;font-size:12px;padding:0 6px}' +
    '.ka-q .rq{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--ka-muted)}' +
    '.ka-q .rq input{accent-color:var(--ka-accent)}' +
    '.ka-q .note{display:block;margin-top:6px;font-size:11.5px;color:var(--ka-muted)}' +
    '.ka-q.is-off{opacity:.5}';
  document.head.appendChild(css);

  /* SVG text must not stretch with the card: draw once to measure the
     column the line gets, then draw again at exactly that width. */
  function fit(host, key, big){
    var c = CHARTS[key];
    host.innerHTML = c.body(big, 300);
    var col = host.querySelector('.ka-chart-l');
    var w = Math.max(180, Math.floor(col.clientWidth) - 4);
    host.innerHTML = c.body(big, w);
  }

  function addToPage(key){
    var c = CHARTS[key];
    var canvas = document.querySelector('#pane-insights .canvas');
    if (!canvas) return null;
    if (R.showTab) R.showTab('insights');
    var old = canvas.querySelector('.ka-gen[data-k="' + key + '"]');
    if (old) old.remove();
    var block = document.createElement('section');
    block.className = 'block ka-gen';
    block.setAttribute('data-k', key);
    block.innerHTML =
      '<div class="head"><div><h2>' + esc(c.title) + '</h2><div class="sub">' + esc(c.sub) + '</div>' +
        A.mark('Made with Kota Assistant from ' + c.from) + '</div>' +
        '<div class="acts"><button class="btn btn--ghost" type="button" data-rm style="height:32px;padding:0 12px;border-radius:8px;border:1px solid #2B2C2D;background:#202122;color:#F6F6F6;font:inherit;font-size:13px;font-weight:500;cursor:pointer">Remove</button></div></div>' +
      '<div class="ka-host"></div>';
    canvas.appendChild(block);
    fit(block.querySelector('.ka-host'), key, true);
    block.querySelector('[data-rm]').addEventListener('click', function(){ block.remove(); });
    setTimeout(function(){ A.glow(block); }, 40);
    return block;
  }

  function chart(key){
    var c = CHARTS[key];
    return A.steps(c.steps, 'Building a chart').then(function(){
      return A.bot(c.say());
    }).then(function(){
      var card = A.card('<div class="ka-card"><div class="ch"><div><div class="tt">' + esc(c.title) + '</div>' +
        '<div class="ts">Preview · from ' + esc(c.from) + '</div></div></div>' +
        '<div class="cb"><div class="ka-host"></div></div>' +
        '<div class="cf"><span class="note">Only you see it until you add it</span>' +
        '<button class="ka-btn" type="button" data-other>' + (key === 'rubaya' ? 'Volume instead' : 'Rubaya instead') + '</button>' +
        '<button class="ka-btn ka-btn--go" type="button" data-add>Add to Insights</button></div></div>');
      fit(card.querySelector('.ka-host'), key, false);
      card.querySelector('[data-add]').addEventListener('click', function(){
        card.classList.add('is-done');
        addToPage(key);
        A.bot('Added to Insights, under the charts it was built from. It updates with the same data and you can remove it from the card.', { who:false })
          .then(function(){ A.chips(key === 'rubaya'
            ? [{ t:'Ask Tulivu about the Rubaya share', ask:'Draft follow-up questions for Tulivu about Rubaya' },
               { t:'Summarise the risk', ask:'Summarise the risk on this file' }]
            : [{ t:'Show the Rubaya share too', ask:'Add a chart of the share from Rubaya' },
               { t:'Draft follow-up questions', ask:'Draft follow-up questions for Tulivu' }]); });
      });
      card.querySelector('[data-other]').addEventListener('click', function(){
        if (A.busy) return;
        card.classList.add('is-done');
        A.ask(key === 'rubaya' ? 'Show declared volume against its average' : 'Show the share from Rubaya');
      });
    });
  }

  /* ---- summary, read off the cards on this screen ---- */
  function summary(){
    return A.steps([
      { t:'Reading the risk score', m:'62 of 100 · documentation 20/30, geography 26/40, network 16/30', ms:900 },
      { t:'Reading the open comments', m:'2 on Registration', ms:700 },
      { t:'Reading shipments and sites', m:shipTotal + ' consignments, ' + shipFlag + ' from Rubaya', ms:800 }
    ], 'Reading the file').then(function(){
      return A.bot(
        '<p>Tulivu scores <b>62 of 100</b>. Three things drive it:</p><ul class="ka-list">' +
        '<li><span><b>Network, 16 of 30</b>, the weakest part: counterparties in flagged jurisdictions.</span></li>' +
        '<li><span><b>Geography, 26 of 40</b>: ' + shipPct + '% of consignments (' + shipFlag + ' of ' + shipTotal + ') came from the Rubaya concession, inside a conflict-affected area.</span></li>' +
        '<li><span><b>Documentation, 20 of 30</b>: the tax and VAT numbers are still blank, and both have a question open.</span></li>' +
        '</ul><p>Documentation is the part Tulivu can move fastest.</p>');
    }).then(function(){
      A.chips([
        { t:'Chart the Rubaya share', ask:'Add a chart of the share from Rubaya' },
        { t:'Draft follow-up questions', ask:'Draft follow-up questions for Tulivu' }
      ]);
    });
  }

  /* ---- a form, from what the reviewer types ---- */
  var EXAMPLE = 'Upload the lot register for the last 12 months\n' +
    'Are records kept for at least five years?\n' +
    'How many consignments left the Rubaya concession each month?\n' +
    'When did a third-party auditor last visit the site?\n' +
    'Do you have a supply chain policy?';

  /* What Tulivu's file already holds, so a question is never asked twice. */
  var KNOWN = [
    { re:/five years|5 years|kept for|retain/i, where:'Chain of custody', state:'open', note:'Already in their file, not answered yet. Kota points Tulivu to that question.' },
    { re:/lot register|lot record/i, where:'Chain of custody', state:'open', note:'Already in their file, nothing attached yet. Kota points Tulivu to that field.' },
    { re:/screen/i, where:'Supplier engagement', state:'open', note:'Already in their file, not answered yet.' },
    { re:/supply chain policy|have a policy/i, where:'Supply chain policy', state:'have', note:'Answered Yes, with the policy attached (2024). Left out so Tulivu is not asked twice.' }
  ];

  var TYPES = ['Yes / No', 'File upload', 'Date', 'Number', 'Short answer', 'Long answer'];
  function typeOf(q){
    if (/upload|attach|send us|copy of|certificate|register|report|evidence|proof/i.test(q)) return 'File upload';
    if (/^when\b|date/i.test(q)) return 'Date';
    if (/how many|how much|number of|volume|tonnes|quantity/i.test(q)) return 'Number';
    if (/^(is|are|do|does|did|has|have|can|will|was|were)\b/i.test(q)) return 'Yes / No';
    if (/describe|explain|why|how do/i.test(q)) return 'Long answer';
    return 'Short answer';
  }
  function tidy(q){
    q = q.replace(/^[\s\-•*\d.)]+/, '').trim();
    /* "Also ask them to describe..." is an instruction to me; the question is what follows. */
    q = q.replace(/^(and |also |please )*(ask (them|tulivu)( to| about| whether| if)?|add (a question )?(about|asking)?)\s*/i, '').trim();
    if (!q) return '';
    q = q.charAt(0).toUpperCase() + q.slice(1);
    if (!/[?.]$/.test(q)) q += /^(is|are|do|does|did|has|have|can|will|was|were|how|what|when|where|who|which|why)\b/i.test(q) ? '?' : '';
    return q;
  }

  var draft = null;   /* { title, qs:[{q,type,req,on,known}] } while one is open */
  var mode = null;

  function parse(text){
    return text.split(/\n|;|(?<=\?)\s+/).map(tidy).filter(function(q){ return q.length > 6; });
  }

  function titleFor(qs){
    var all = qs.map(function(x){ return x.q; }).join(' ');
    if (/lot|record|custody|consignment/i.test(all)) return 'Follow-up: chain of custody';
    if (/supplier/i.test(all)) return 'Follow-up: suppliers';
    if (/audit|visit/i.test(all)) return 'Follow-up: site oversight';
    return 'Follow-up questions';
  }

  function build(text){
    var qs = parse(text);
    if (!qs.length){
      return A.bot('I couldn’t find a question in that. Write them one per line, the way you would ask Tulivu.');
    }
    var fresh = qs.map(function(q){
      var k = null;
      KNOWN.forEach(function(x){ if (!k && x.re.test(q)) k = x; });
      return { q:q, type:typeOf(q), req:true, on:!(k && k.state === 'have'), known:k };
    });
    draft = draft && !draft.sent ? { title:draft.title, qs:draft.qs.concat(fresh) } : { qs:fresh };
    draft.title = titleFor(draft.qs);

    var have = fresh.filter(function(x){ return x.known && x.known.state === 'have'; }).length;
    var open = fresh.filter(function(x){ return x.known && x.known.state === 'open'; }).length;
    return A.steps([
      { t:'Reading ' + fresh.length + ' question' + (fresh.length > 1 ? 's' : ''), ms:700 },
      { t:'Choosing an answer type for each', m:'Yes / No, file, date, number or text', ms:900 },
      { t:'Checking Tulivu’s file for questions already asked', m:'41 questions across 9 sections', ms:1000 }
    ], 'Drafting the form').then(function(){
      return A.bot('Here is the form. ' +
        (have ? have + (have > 1 ? ' questions are' : ' question is') + ' already answered in Tulivu’s file, so I left ' + (have > 1 ? 'them' : 'it') + ' out. ' : '') +
        (open ? open + ' already exist' + (open > 1 ? '' : 's') + ' in their file unanswered: Tulivu will answer them there, so the file stays one record. ' : '') +
        'Change any type, or tell me what to add.');
    }).then(function(){ draw(); });
  }

  var cardEl = null;
  function draw(){
    if (cardEl) cardEl.closest('.ka-msg').remove();
    cardEl = A.card('<div class="ka-card"><div class="ch"><div><div class="tt">' + esc(draft.title) + '</div>' +
      '<div class="ts">For Tulivu Cooperative · each answer lands in their file</div></div></div>' +
      '<div class="cb">' + draft.qs.map(function(x, i){
        return '<div class="ka-q' + (x.on ? '' : ' is-off') + '"><input type="checkbox" data-on="' + i + '"' + (x.on ? ' checked' : '') + ' aria-label="Include this question">' +
          '<div><div class="qt">' + esc(x.q) + '</div><div class="qm">' +
          '<select data-type="' + i + '" aria-label="Answer type">' + TYPES.map(function(t){
            return '<option' + (t === x.type ? ' selected' : '') + '>' + t + '</option>'; }).join('') + '</select>' +
          '<label class="rq"><input type="checkbox" data-req="' + i + '"' + (x.req ? ' checked' : '') + '>Required</label>' +
          (x.known ? '<span class="ka-badge ' + (x.known.state === 'have' ? 'ka-badge--ok">Already answered' : 'ka-badge--have">In their file') + '</span>' : '') +
          '</div>' + (x.known ? '<span class="note">' + esc(x.known.where) + ' · ' + esc(x.known.note) + '</span>' : '') +
          '</div></div>';
      }).join('') + '</div>' +
      '<div class="cf"><span class="note" data-n></span>' +
      '<button class="ka-btn ka-btn--go" type="button" data-send></button></div></div>');

    function count(){
      var n = draft.qs.filter(function(x){ return x.on; }).length;
      cardEl.querySelector('[data-n]').textContent = n + ' of ' + draft.qs.length + ' included';
      var b = cardEl.querySelector('[data-send]');
      b.textContent = 'Send ' + n + ' to Tulivu'; b.disabled = !n;
    }
    [].forEach.call(cardEl.querySelectorAll('[data-on]'), function(b){
      b.addEventListener('change', function(){
        var x = draft.qs[+b.getAttribute('data-on')]; x.on = b.checked;
        b.closest('.ka-q').classList.toggle('is-off', !b.checked); count();
      });
    });
    [].forEach.call(cardEl.querySelectorAll('[data-type]'), function(s){
      s.addEventListener('change', function(){ draft.qs[+s.getAttribute('data-type')].type = s.value; });
    });
    [].forEach.call(cardEl.querySelectorAll('[data-req]'), function(c){
      c.addEventListener('change', function(){ draft.qs[+c.getAttribute('data-req')].req = c.checked; });
    });
    cardEl.querySelector('[data-send]').addEventListener('click', confirmSend);
    count();
  }

  function confirmSend(){
    var qs = draft.qs.filter(function(x){ return x.on; });
    var foot = cardEl.querySelector('.cf');
    foot.innerHTML = '<span class="note">Send ' + qs.length + ' question' + (qs.length > 1 ? 's' : '') +
      ' to Tulivu Cooperative? They are notified and answer in their file.</span>' +
      '<button class="ka-btn" type="button" data-no>Keep editing</button>' +
      '<button class="ka-btn ka-btn--go" type="button" data-yes>Send</button>';
    foot.querySelector('[data-no]').addEventListener('click', draw);
    foot.querySelector('[data-yes]').addEventListener('click', function(){
      draft.sent = true;
      cardEl.classList.add('is-done');
      [].forEach.call(cardEl.querySelectorAll('input,select'), function(i){ i.disabled = true; });
      var today = new Date().toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
      qs.forEach(function(x){
        if (R.addComment) R.addComment(draft.title + '|' + x.q.replace(/\?$/, ''),
          { who:'You · ' + today + ' · ' + x.type + (x.req ? ', required' : ''), txt:'Sent with Kota Assistant. Waiting on Tulivu.' });
      });
      mode = null;
      A.bot('Sent. Tulivu sees ' + qs.length + ' new question' + (qs.length > 1 ? 's' : '') +
        ' on their file, and they are listed in your Open comments until answered.', { who:false })
        .then(function(){ A.chips([{ t:'Show me in Open comments', run:function(){
          if (R.showTab) R.showTab('detailed');
          setTimeout(function(){ A.glow(document.querySelector('.comments-card')); }, 60);
        } }]); });
    });
  }

  function startForm(text){
    mode = 'form';
    var rest = text.replace(/^.*?(questions?|form)( for tulivu)?( about [^\n:]*)?[:\n]?/i, '').trim();
    if (rest && parse(rest).length) return build(rest);
    var about = /rubaya/i.test(text);
    return A.bot('Write the questions the way you would ask Tulivu, one per line. I’ll pick the answer type for each and check their file so nothing is asked twice.')
      .then(function(){
        A.chips([{ t:'Use an example', run:function(){
          A.prefill(about
            ? 'How many consignments left the Rubaya concession each month?\nUpload the lot register for the last 12 months\nWhen did a third-party auditor last visit the site?\nAre records kept for at least five years?'
            : EXAMPLE);
        } }]);
      });
  }


  /* ---- the decision, suggested ----
     The assistant never decides. It reads the same cards the reviewer reads,
     says which of the three buttons the evidence points to and why, and
     drafts the message that goes with it. The reviewer still presses the
     button, in the same dialog as always. */
  var REASONS = [
    { t:'Two answers Tulivu can fix today', m:'Tax and VAT numbers are blank, and both carry your comment',
      go:function(){ if (R.showTab) R.showTab('detailed'); return document.querySelector('.comments-card'); } },
    { t:shipPct + '% of consignments from the Rubaya concession', m:shipFlag + ' of ' + shipTotal + ' this year, inside a conflict-affected area',
      go:function(){ if (R.showTab) R.showTab('insights'); return document.querySelector('.block.ship'); } },
    { t:'Nothing found that rules the file out', m:'No dispute or litigation declared, not on a watchlist, score 62 of 100',
      go:function(){ if (R.showTab) R.showTab('insights'); return document.querySelector('.block.score'); } }
  ];
  var NOTE = 'Hello Tulivu team,\n\n' +
    'Before we can confirm your file, please:\n' +
    '1. Add your tax identification number and VAT registration number in Registration. Both have a comment on the field.\n' +
    '2. Attach the lot register for the last 12 months. ' + shipPct + '% of this year’s consignments came from the Rubaya concession, and the register lets us follow each lot.\n\n' +
    'Once these are in, we will continue the review.\n\nBanque Orimu';

  css.textContent +=
    '.ka-brief{margin-top:var(--gutter,24px);background:linear-gradient(180deg,rgba(232,114,63,.08),rgba(232,114,63,0) 70%),var(--block,#1D1D1E);' +
      'border:1px solid #3A2A22;border-radius:var(--radius,8px);padding:20px 24px;display:grid;grid-template-columns:auto 1fr auto;gap:16px 18px;align-items:start}' +
    '.ka-brief .ka-orb{width:36px;height:36px}' +
    '.ka-brief .bt{display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:16px;font-weight:600;color:#F6F6F6}' +
    '.ka-brief .bs{font-size:13px;color:#898B8D;margin-top:2px}' +
    '.ka-brief .rs{grid-column:2/4;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}' +
    '.ka-brief .r{display:flex;flex-direction:column;gap:4px;padding:12px 14px;border-radius:8px;background:#151617;border:1px solid #2B2C2D;text-align:left;font:inherit;color:inherit;cursor:pointer}' +
    '.ka-brief .r:hover{border-color:#4A4C50}' +
    '.ka-brief .r b{font-size:13.5px;font-weight:600;color:#F6F6F6}.ka-brief .r span{font-size:12.5px;color:#898B8D}' +
    '.ka-brief .r i{font-style:normal;font-size:12px;color:#FF9C6E;margin-top:4px}' +
    '.ka-brief .acts{display:flex;gap:8px;align-items:center}' +
    '.ka-brief .fine{grid-column:2/4;font-size:12px;color:#6B6E74}' +
    '.ka-brief .x{width:32px;height:32px;border:0;border-radius:8px;background:transparent;color:#898B8D;display:grid;place-items:center;cursor:pointer}' +
    '.ka-brief .x:hover{background:#2E3033;color:#F6F6F6}.ka-brief .x svg{width:16px;height:16px}' +
    '.ka-sk{height:12px;border-radius:6px;background:linear-gradient(90deg,#232425 0,#2E3033 50%,#232425 100%);background-size:200% 100%;animation:ka-sh 1.2s linear infinite}' +
    '@keyframes ka-sh{to{background-position:-200% 0}}' +
    '.ka-inmodal{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border-radius:8px;background:rgba(232,114,63,.08);border:1px solid #3A2A22;font-size:12.5px;line-height:1.45;color:#D3D4D4}' +
    '.ka-inmodal .ka-orb{width:20px;height:20px;margin-top:1px}' +
    '.ka-inmodal button{border:0;background:none;padding:0;color:#FF9C6E;font:inherit;cursor:pointer;text-decoration:underline;text-underline-offset:2px}' +
    '.ka-draft{float:right;border:0;background:none;padding:0;color:#FF9C6E;font:inherit;font-size:12.5px;font-weight:500;cursor:pointer;display:inline-flex;align-items:center;gap:5px}' +
    '.ka-draft svg{width:13px;height:13px}';

  function orbHtml(){ return '<span class="ka-orb">' + A.icons.spark + '</span>'; }

  function draftRequest(){
    if (!R.openDecision) return;
    var btn = document.querySelector('[data-decision="request"]');
    R.openDecision('request', btn);
    var note = document.getElementById('reqNote');
    if (note){ note.value = NOTE; note.style.minHeight = '220px'; }
    var body = document.querySelector('#mRequest .cm-body');
    var old = body.querySelector('.ka-inmodal'); if (old) old.remove();
    var b = document.createElement('div');
    b.className = 'ka-inmodal';
    b.innerHTML = orbHtml() + '<div>Kota drafted this message from your 2 open comments and the shipments data. ' +
      'Edit it freely; nothing goes until you press Send request. <button type="button">Clear it</button></div>';
    body.insertBefore(b, body.firstChild);
    b.querySelector('button').addEventListener('click', function(){ note.value = ''; b.remove(); note.focus(); });
  }

  /* The same draft, on demand, from inside the dialog itself. */
  (function(){
    var lab = document.querySelector('#mRequest label[for="reqNote"]');
    if (!lab) return;
    var d = document.createElement('button');
    d.type = 'button'; d.className = 'ka-draft';
    d.innerHTML = A.icons.spark + 'Draft with Kota';
    d.addEventListener('click', function(){
      var note = document.getElementById('reqNote');
      note.value = ''; note.style.minHeight = '220px';
      var i = 0, txt = NOTE;
      (function tick(){ note.value = txt.slice(0, i += 6); if (i < txt.length) setTimeout(tick, 16); })();
    });
    lab.appendChild(d);
  })();

  function brief(){
    var pane = document.getElementById('pane-insights');
    if (!pane) return;
    var el = document.createElement('section');
    el.className = 'ka-brief';
    el.setAttribute('aria-label', 'Kota’s read of this file');
    el.innerHTML = orbHtml() + '<div><div class="bt">Kota is reading this file</div>' +
      '<div class="ka-sk" style="width:260px;margin-top:10px"></div></div><span></span>' +
      '<div class="rs"><div class="ka-sk" style="height:64px"></div><div class="ka-sk" style="height:64px"></div><div class="ka-sk" style="height:64px"></div></div>';
    pane.insertBefore(el, pane.firstChild);
    setTimeout(function(){
      el.innerHTML = orbHtml() +
        '<div><div class="bt">Kota suggests: Request updates<span class="pill"><span class="dot"></span>Not approve, not decline</span></div>' +
        '<div class="bs">The file is close. What is missing is something Tulivu can send, and nothing on this page rules it out.</div></div>' +
        '<div class="acts"><button class="ka-btn" type="button" data-why>Why not approve?</button>' +
        '<button class="ka-btn ka-btn--go" type="button" data-draft>Draft the request</button>' +
        '<button class="x" type="button" aria-label="Dismiss" data-x>' + A.icons.x + '</button></div>' +
        '<div class="rs">' + REASONS.map(function(r, i){
          return '<button class="r" type="button" data-r="' + i + '"><b>' + esc(r.t) + '</b><span>' + esc(r.m) + '</span><i>Show me</i></button>';
        }).join('') + '</div>' +
        '<div class="fine">A suggestion read from the cards on this page. The decision and the message are yours.</div>';
      el.querySelector('[data-draft]').addEventListener('click', draftRequest);
      el.querySelector('[data-why]').addEventListener('click', function(){ A.ask('Why request updates and not approve?'); });
      el.querySelector('[data-x]').addEventListener('click', function(){ el.remove(); });
      [].forEach.call(el.querySelectorAll('[data-r]'), function(b){
        b.addEventListener('click', function(){
          var target = REASONS[+b.getAttribute('data-r')].go();
          setTimeout(function(){ A.glow(target); }, 60);
        });
      });
    }, 1800);
  }
  // brief(); removed 2026-10-08: Pietra preferred the decision suggestion in chat only

  function decide(text){
    var why = /why|not approve|instead/i.test(text);
    return A.steps([
      { t:'Reading the risk score', m:'62 of 100', ms:700 },
      { t:'Reading your open comments', m:'2 on Registration, both on blank answers', ms:700 },
      { t:'Reading shipments and sites', m:shipPct + '% from Rubaya', ms:700 },
      { t:'Checking scrutiny answers', m:'No dispute declared, not on a watchlist', ms:600 }
    ], 'Weighing the decision').then(function(){
      return A.bot(why
        ? '<p><b>Approve</b> would confirm a file with two required answers blank, the same two you asked about. <b>Decline</b> would need something that rules Tulivu out, and nothing here does: no dispute declared, no watchlist match.</p>' +
          '<p><b>Request updates</b> keeps the review open and sends back exactly what is missing. I’d add the lot register, since ' + shipPct + '% of consignments came from Rubaya.</p>'
        : '<p>I’d <b>request updates</b>. The two blank answers are fixable today, the Rubaya share is worth a lot register, and nothing on the page rules the file out.</p>' +
          '<p>I drafted the message. It opens in the usual dialog, so you can edit it before it goes.</p>');
    }).then(function(){
      A.chips([{ t:'Open the drafted request', run:function(){ draftRequest(); } },
               { t:'Draft follow-up questions instead', ask:'Draft follow-up questions for Tulivu' }]);
    });
  }

  function onAsk(text){
    var t = text.toLowerCase();
    if (mode === 'form' && !/chart|graph|summar/.test(t)) return build(text);
    if (/approve|decline|decision|decide|should i|aprova/.test(t)) return decide(text);
    if (/question|form|follow|request|ask tulivu|pergunta|formul/.test(t)) return startForm(text);
    if (/summar|risk|score|resum|why/.test(t)) return summary();
    if (/volume|tonn|output|average/.test(t)) return chart('volume');
    if (/rubaya|share|site|concession|conflict/.test(t)) return chart('rubaya');
    if (/chart|graph|plot|visual|show|compare|trend|gr[aá]fico/.test(t)){
      return A.bot('I can chart two things from this file today. Which one?').then(function(){
        A.chips([{ t:'Share of consignments from Rubaya', ask:'Show the share from Rubaya' },
                 { t:'Declared volume against its average', ask:'Show declared volume against its average' }]);
      });
    }
    return A.bot('In this prototype I can add a chart to Insights, summarise the risk, and turn your questions into a form for Tulivu.')
      .then(function(){ A.chips(START); });
  }

  var START = [
    { t:'Add a chart of the share from Rubaya', ask:'Add a chart of the share from Rubaya' },
    { t:'Draft follow-up questions for Tulivu', ask:'Draft follow-up questions for Tulivu' },
    { t:'Should I approve Tulivu?', ask:'Should I approve Tulivu?' },
    { t:'Summarise the risk', ask:'Summarise the risk on this file' }
  ];

  A.init({
    context:'Reviewing Tulivu Cooperative · Banque Orimu',
    greeting:'<p>I’m reading Tulivu’s file with you: the score, the map, the shipments and the two questions you left.</p>' +
             '<p>Ask for a chart, a summary, or a form to send them.</p>',
    placeholder:'Ask for a chart, a summary or a form',
    chips:START,
    onAsk:onAsk,
    autoOpen:/[?&]assist=/.test(location.search)
  });
})();
