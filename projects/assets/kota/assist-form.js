/* ==========================================================================
   KOTA: the assistant on the operator's form.

   The job here is the one the form is worst at: the answers already exist,
   printed on certificates the cooperative keeps in a drawer. The assistant
   reads them, says which answer it found where, and fills only what the
   operator accepts, either from the panel or beside each field.

   It also says plainly what it could not do. A blurred photo and a
   certificate under another name are the two failures a cooperative will
   actually hit, and each one ends in a next step, never in a dead end.
   ========================================================================== */
(function(){
  var F = window.KotaForm, A = window.KotaAssistant;
  if (!F || !A) return;
  var esc = A.esc, wait = A.wait;

  var DOCS = [
    { n:'Tax certificate · DGI North Kivu.pdf', s:'PDF · 1 page · 310 KB', k:'tax' },
    { n:'VAT registration · Tulivu Cooperative.pdf', s:'PDF · 2 pages · 420 KB', k:'vat' },
    { n:'Policy review minutes · Mar 2025.pdf', s:'PDF · 6 pages · 1.1 MB', k:'policy' }
  ];
  var HARD = [
    { n:'VAT certificate · phone photo.jpg', s:'JPG · 2 pages · 2.4 MB', k:'blurry' },
    { n:'Tax certificate · 2019.pdf', s:'PDF · 1 page · 290 KB', k:'mismatch' }
  ];

  /* What each document holds, by the label of the question it answers. The
     values are prototype data, like every other answer in this file. */
  var FOUND = [
    { doc:'tax', sec:'registration', label:'Tax identification number', value:'A1402921T',
      src:'Tax certificate · p.1', why:'Printed under "Numéro d’identification fiscale"' },
    { doc:'vat', sec:'registration', label:'VAT registration number', value:'CD-TVA-14-0921',
      src:'VAT registration · p.1', why:'Matches the registration number on your file' },
    { doc:'policy', sec:'policy', label:'Is the policy aligned with the OECD Due Diligence Guidance?', pick:1,
      src:'Policy review minutes · p.2', why:'"The board confirms the policy follows Annex II of the OECD Guidance"' },
    { doc:'policy', sec:'policy', label:'Date the policy was last reviewed', value:'14 Mar 2025',
      src:'Policy review minutes · p.1', why:'Date of the meeting that approved the review' },
    { doc:'policy', sec:'structure', label:'Does the team receive training on the policy?', pick:1,
      src:'Policy review minutes · p.4', why:'Minutes record a training session for buyers and site agents' },
    { doc:'policy', sec:'structure', label:'Role in the organisation', value:'Due diligence officer',
      src:'Policy review minutes · p.3', why:'A. Byamungu signs as due diligence lead; the exact title is inferred', check:true }
  ];

  function secIndex(id){
    for (var i = 0; i < F.sections.length; i++) if (F.sections[i].id === id) return i;
    return -1;
  }
  function fieldOf(item){
    var s = F.sections[secIndex(item.sec)];
    for (var i = 0; i < s.fields.length; i++) if (s.fields[i].label === item.label) return s.fields[i];
    return null;
  }
  function byLabel(label){
    for (var i = 0; i < FOUND.length; i++) if (FOUND[i].label === label) return FOUND[i];
    return null;
  }
  function shown(item){ return item.pick != null ? ['No','Yes'][item.pick] : item.value; }
  function docFor(k){
    return DOCS.concat(HARD).filter(function(d){ return d.k === k; })[0];
  }

  function missing(){
    var out = [];
    F.sections.forEach(function(s, i){
      var left = s.fields.filter(function(f){ return !F.isAnswered(f); });
      if (left.length) out.push({ i:i, s:s, left:left });
    });
    return out;
  }

  /* ---- writing, and taking it back ---- */
  var history = [];   /* one entry per fill: the fields as they were before */

  function write(items){
    var before = items.map(function(x){
      var f = fieldOf(x);
      return { f:f, value:f.value, picked:f.picked, ai:f.ai, touched:f.touched, suggest:f.suggest };
    });
    items.forEach(function(x){
      var f = fieldOf(x);
      if (x.pick != null) f.picked = x.pick; else f.value = x.value;
      f.touched = true;
      f.suggest = null;
      f.ai = { src:x.src, check:!!x.check };
    });
    history.push(before);
  }

  function undo(){
    var last = history.pop();
    if (!last) return A.bot('Nothing to undo.');
    last.forEach(function(b){
      b.f.value = b.value; b.f.picked = b.picked; b.f.ai = b.ai; b.f.touched = b.touched; b.f.suggest = b.suggest;
    });
    F.refresh();
    var n = last.length;
    return A.bot('Undone. ' + (n > 1 ? 'The ' + n + ' answers are back to how they were' : 'The answer is back to how it was') +
      ' before I filled ' + (n > 1 ? 'them' : 'it') + '.', { who:false });
  }

  function glowMarked(){
    setTimeout(function(){
      [].forEach.call(document.querySelectorAll('#fields .field'), function(node){
        if (node.querySelector('.ka-mark,.ka-sugg')) A.glow(node);
      });
    }, 60);
  }

  /* ---- beside each field ----
     Called by the form every time it draws a section. */
  window.KotaFormHook = function(root, sec){
    [].forEach.call(root.querySelectorAll('.field'), function(node){
      var f = sec.fields[+node.getAttribute('data-f')];
      var anchor = node.querySelector('.finput,.choice,.locked');
      if (!anchor) return;

      if (f.suggest){
        var x = f.suggest;
        var box = document.createElement('div');
        box.className = 'ka-sugg';
        box.innerHTML = '<span class="ka-orb">' + A.icons.spark + '</span>' +
          '<div><span class="v">' + esc(shown(x)) + '</span>' +
          (x.check ? '<span class="ka-badge ka-badge--check">Check this</span>' : '') +
          '<span class="m">Suggested from ' + esc(x.src) + ' · ' + esc(x.why) + '</span></div>' +
          '<div class="b"><button class="ka-btn" type="button" data-no>Dismiss</button>' +
          '<button class="ka-btn ka-btn--go" type="button" data-ok>Accept</button></div>';
        anchor.insertAdjacentElement('afterend', box);
        box.querySelector('[data-ok]').addEventListener('click', function(){
          write([x]); F.refresh(); afterInline();
        });
        box.querySelector('[data-no]').addEventListener('click', function(){
          f.suggest = null; F.refresh(); afterInline();
        });
        return;
      }

      /* Before anything is read: point at the document that holds the answer. */
      var known = byLabel(f.label);
      if (known && !F.isAnswered(f) && !f.ai){
        var d = docFor(known.doc);
        var hint = document.createElement('div');
        hint.className = 'ka-hint';
        hint.innerHTML = A.icons.spark + '<span>This is on your ' + esc(d.n.split(' · ')[0].toLowerCase()) + '.</span>' +
          '<button type="button">Let Kota read it</button>';
        anchor.insertAdjacentElement('afterend', hint);
        hint.querySelector('button').addEventListener('click', function(){
          A.prefill('Fill my file from this document', [d]);
        });
      }
    });
  };

  var inlineLeft = 0;
  function afterInline(){
    var left = FOUND.filter(function(x){ var f = fieldOf(x); return f && f.suggest; }).length;
    if (left === 0 && inlineLeft > 0){
      inlineLeft = 0;
      A.bot('All suggestions on the form are handled. Anything you accepted keeps its source until you edit it.', { who:false })
        .then(function(){ A.chips([{ t:'Undo the last one', run:function(){ undo(); } },
                                  { t:'What is still missing?', ask:'What is still missing?' }]); });
    }
  }

  /* ---- reading documents ---- */
  function read(files){
    var keys = files.map(function(f){ return f.k; }).filter(Boolean);
    var real = files.filter(function(f){ return f.real; });

    if (!keys.length){
      return A.bot('I can see <b>' + esc(real[0].n) + '</b>, but this prototype only reads the sample ' +
        'documents Tulivu keeps on file. Pick one from the paperclip menu to see the extraction.')
        .then(function(){ A.chips([{ t:'Use the sample documents', run:function(){ A.prefill('Fill my file from these documents', DOCS); } }]); });
    }

    var items = FOUND.filter(function(x){
      if (keys.indexOf(x.doc) < 0) return false;
      var f = fieldOf(x);
      return f && !F.isAnswered(f);
    });
    var problems = [];
    if (keys.indexOf('blurry') > -1) problems.push('blurry');
    if (keys.indexOf('mismatch') > -1) problems.push('mismatch');

    var steps = [];
    files.filter(function(f){ return f.k; }).forEach(function(f){
      if (f.k === 'blurry') steps.push({ t:'Reading ' + f.n, m:'Page 1 read. Page 2 is too blurred to read.', ms:1100, warn:true });
      else if (f.k === 'mismatch') steps.push({ t:'Reading ' + f.n.replace(/\.pdf$/,''), m:'Issued to "Tulivu Mining Cooperative"', ms:1000, warn:true });
      else steps.push({ t:'Reading ' + f.n.replace(/\.pdf$/,''), m:f.s, ms:900 });
    });
    steps.push({ t:'Matching what I found to the 41 questions in your file', m:'Banque Orimu’s two open questions first', ms:1000 });
    if (keys.some(function(k){ return /tax|vat|mismatch|blurry/.test(k); }))
      steps.push({ t:'Checking the name on each certificate against the registry', m:'Registry: Tulivu Cooperative SARL', ms:800 });
    steps.push({ t:'Leaving alone anything you already answered', ms:500 });

    return A.steps(steps, 'Reading ' + keys.length + ' document' + (keys.length > 1 ? 's' : ''))
      .then(function(){
        if (!items.length && !problems.length){
          return A.bot('Everything these documents cover is already answered in your file. Nothing to change.');
        }
        var chain = Promise.resolve();
        if (items.length){
          var asks = items.filter(function(x){ return fieldOf(x).ask; }).length;
          chain = chain.then(function(){
            return A.bot('I found <b>' + items.length + ' answer' + (items.length > 1 ? 's' : '') + '</b>' +
              (asks ? ', including ' + (asks === 2 ? 'both questions' : 'one of the questions') + ' Banque Orimu is waiting on' : '') +
              '. Fill them from here, or review each one on the form.');
          }).then(function(){ propose(items); });
        }
        if (problems.length){
          chain = chain.then(function(){
            return A.bot(items.length ? 'And ' + (problems.length > 1 ? 'two things' : 'one thing') + ' I couldn’t do:'
                                      : 'I couldn’t fill anything from ' + (problems.length > 1 ? 'these' : 'this') + ', and here is why:');
          }).then(function(){ report(problems); });
        }
        return chain;
      });
  }

  /* ---- what went wrong, with a way forward each ---- */
  function report(problems){
    var P = {
      blurry:{ t:'Page 2 of the VAT photo is too blurred to read',
        m:'The VAT number is printed on that page. I didn’t guess it from page 1.',
        acts:[{ t:'Upload a clearer photo', go:true, run:function(){ A.prefill('Here is a clearer copy', [DOCS[1]]); } },
              { t:'Type it myself', run:function(){ jump('VAT registration number'); } }] },
      mismatch:{ t:'The name on the tax certificate doesn’t match your record',
        m:'It is issued to "Tulivu Mining Cooperative" in 2019. Your registry record says "Tulivu Cooperative SARL", so I didn’t fill the tax number from it.',
        acts:[{ t:'Attach the current certificate', go:true, run:function(){ A.prefill('Here is the current certificate', [DOCS[0]]); } },
              { t:'Use it anyway', run:function(){
                  var x = { doc:'mismatch', sec:'registration', label:'Tax identification number', value:'A1402921T',
                            src:'Tax certificate 2019 · p.1', why:'Issued under a former name', check:true };
                  if (F.isAnswered(fieldOf(x))) return A.bot('Your tax number already has an answer, so I left it.', { who:false });
                  write([x]); F.go(secIndex('registration')); glowMarked();
                  A.bot('Filled from the 2019 certificate and marked <b>Check this</b>, so Banque Orimu sees it came from a document under a former name.', { who:false })
                    .then(function(){ A.chips([{ t:'Undo', run:function(){ undo(); } }]); });
                } }] }
    };
    var card = A.card('<div class="ka-card"><div class="cb" style="padding-top:12px">' + problems.map(function(k, i){
      var p = P[k];
      return '<div class="ka-problem">' + A.icons.warn + '<div><div class="pt">' + esc(p.t) + '</div>' +
        '<div class="pm">' + esc(p.m) + '</div><div class="pb">' + p.acts.map(function(a, j){
          return '<button class="ka-btn' + (a.go ? ' ka-btn--go' : '') + '" type="button" data-p="' + i + '" data-a="' + j + '">' + esc(a.t) + '</button>';
        }).join('') + '</div></div></div>';
    }).join('') + '</div></div>');
    [].forEach.call(card.querySelectorAll('[data-p]'), function(b){
      b.addEventListener('click', function(){
        if (A.busy) return;
        var row = b.closest('.ka-problem');
        [].forEach.call(row.querySelectorAll('button'), function(x){ x.disabled = true; });
        P[problems[+b.getAttribute('data-p')]].acts[+b.getAttribute('data-a')].run();
      });
    });
  }

  function jump(label){
    for (var i = 0; i < F.sections.length; i++){
      var s = F.sections[i];
      for (var j = 0; j < s.fields.length; j++){
        if (s.fields[j].label === label){
          F.go(i);
          var at = j;
          setTimeout(function(){
            var node = document.querySelector('#fields .field[data-f="' + at + '"]');
            A.glow(node);
            var inp = node && node.querySelector('input'); if (inp) inp.focus({ preventScroll:true });
          }, 60);
          return;
        }
      }
    }
  }

  function propose(items){
    var card = A.card(
      '<div class="ka-card">' +
        '<div class="ch"><div><div class="tt">Answers found</div>' +
        '<div class="ts">Nothing is written to your file until you accept</div></div></div>' +
        '<div class="cb">' + items.map(function(x, i){
          var f = fieldOf(x), s = F.sections[secIndex(x.sec)];
          return '<label class="ka-row"><input type="checkbox" checked data-i="' + i + '">' +
            '<span><span class="w">' + esc(s.t) + '</span>' +
            '<span class="q">' + esc(x.label) + '</span>' +
            '<span class="a">' + esc(shown(x)) + '</span>' +
            '<span class="src">' + A.icons.file + esc(x.src) + ' · ' + esc(x.why) + '</span>' +
            '<span class="bd">' +
              (f.ask ? '<span class="ka-badge ka-badge--ask">Closes a bank question</span>' : '') +
              (x.check ? '<span class="ka-badge ka-badge--check">Check this</span>' : '') +
            '</span></span></label>';
        }).join('') + '</div>' +
        '<div class="cf"><span class="note" data-n></span>' +
          '<button class="ka-btn" type="button" data-inline>Review on the form</button>' +
          '<button class="ka-btn ka-btn--go" type="button" data-go></button></div>' +
      '</div>');

    var boxes = card.querySelectorAll('input[type=checkbox]'), go = card.querySelector('[data-go]');
    function chosen(){ return items.filter(function(x, i){ return boxes[i].checked; }); }
    function count(){
      var n = chosen().length;
      [].forEach.call(boxes, function(b){ b.closest('.ka-row').classList.toggle('is-off', !b.checked); });
      go.textContent = n ? 'Fill ' + n : 'Fill';
      go.disabled = !n;
      card.querySelector('[data-inline]').disabled = !n;
      card.querySelector('[data-n]').textContent = n + ' of ' + items.length + ' selected';
    }
    [].forEach.call(boxes, function(b){ b.addEventListener('change', count); });
    count();

    function lock(){
      card.classList.add('is-done');
      [].forEach.call(boxes, function(b){ b.disabled = true; });
    }
    go.addEventListener('click', function(){ var c = chosen(); lock(); apply(c); });
    card.querySelector('[data-inline]').addEventListener('click', function(){
      var c = chosen(); lock();
      c.forEach(function(x){ fieldOf(x).suggest = x; });
      inlineLeft = c.length;
      var first = Math.min.apply(null, c.map(function(x){ return secIndex(x.sec); }));
      F.go(first);
      glowMarked();
      var secs = c.map(function(x){ return F.sections[secIndex(x.sec)].t; })
        .filter(function(v, i, a){ return a.indexOf(v) === i; });
      A.bot('I put ' + c.length + ' suggestion' + (c.length > 1 ? 's' : '') + ' on the form, in ' + secs.join(', ') +
        '. Accept or dismiss each one where it sits.', { who:false });
    });
  }

  function apply(chosen){
    var first = -1, closed = 0, check = 0;
    chosen.forEach(function(x){
      if (fieldOf(x).ask) closed++;
      if (x.check) check++;
      var si = secIndex(x.sec);
      if (first < 0 || si < first) first = si;
    });
    write(chosen);
    F.go(first);
    glowMarked();

    var left = missing().reduce(function(a, m){ return a + m.left.length; }, 0);
    return wait(500).then(function(){
      return A.bot('Filled <b>' + chosen.length + ' answer' + (chosen.length > 1 ? 's' : '') + '</b>. ' +
        (closed ? (closed === 2 ? 'Both of Banque Orimu’s questions now have an answer. ' : 'One of Banque Orimu’s questions now has an answer. ') : '') +
        (check ? 'The role in Internal structure is marked <b>Check this</b>: the title is my reading of the minutes. ' : '') +
        'Each answer shows the page it came from until you edit it. ' +
        left + ' answer' + (left === 1 ? '' : 's') + ' still need you.');
    }).then(function(){
      A.chips([
        { t:'Undo', run:function(){ undo(); } },
        { t:'What is still missing?', ask:'What is still missing?' },
        { t:'Review and send to Banque Orimu', ask:'Send my updates to Banque Orimu' }
      ]);
    });
  }

  /* ---- what is left, read off the form itself ---- */
  function whatsLeft(){
    var m = missing();
    if (!m.length) return A.bot('Nothing. Every question in your file has an answer.');
    var total = m.reduce(function(a, x){ return a + x.left.length; }, 0);
    return A.steps([{ t:'Going through all ' + F.sections.length + ' sections', ms:700 }], 'Checking your file')
      .then(function(){
        return A.bot('<p><b>' + total + ' answer' + (total > 1 ? 's' : '') + '</b> left, in ' + m.length +
          ' section' + (m.length > 1 ? 's' : '') + ':</p><ul class="ka-list">' +
          m.map(function(x){
            return '<li><span><button class="ka-link" type="button" data-go="' + x.i + '">' + esc(x.s.t) + '</button>: ' +
              esc(x.left.map(function(f){ return f.label.replace(/\?$/, ''); }).join('; ')) + '</span></li>';
          }).join('') + '</ul>');
      })
      .then(function(msg){
        [].forEach.call(msg.querySelectorAll('[data-go]'), function(b){
          b.addEventListener('click', function(){ F.go(+b.getAttribute('data-go')); });
        });
        A.chips([{ t:'Fill from my documents', run:function(){ A.prefill('Fill my file from these documents', DOCS); } }]);
      });
  }

  /* ---- reading what was typed ---- */
  function onAsk(text, files){
    var t = (text || '').toLowerCase();
    if (files.length) return read(files);
    if (/^undo|desfaz/.test(t)) return undo();
    if (/missing|left|remain|still|falta/.test(t)) return whatsLeft();
    if (/send|submit|envia/.test(t)){
      var open = F.sections.reduce(function(a, s){ return a + s.asked; }, 0);
      return A.bot((open ? 'Banque Orimu still has ' + open + ' open question' + (open > 1 ? 's' : '') + '. You can send now and answer them after. '
                         : 'Both questions from Banque Orimu are answered. ') +
        'Opening the summary of what goes, so you can check it before it leaves.')
        .then(function(){ return wait(500); }).then(function(){ F.openSend(); });
    }
    if (/fill|document|certificate|attach|upload|preench|anex/.test(t)){
      return A.bot('Attach the documents and I’ll find the answers in them. The three Tulivu keeps on file are ready to pick.')
        .then(function(){ A.openAttach(); });
    }
    if (/vat|tax|tin|imposto/.test(t)){
      return A.bot('Banque Orimu asked for both on <b>Registration</b>. A VAT number is mandatory for exporters, and the tax number confirms the section. ' +
        'Both are printed on certificates: attach them and I’ll fill the two answers.')
        .then(function(){ A.chips([{ t:'Attach the tax and VAT certificates', run:function(){ A.prefill('Fill my file from these documents', DOCS.slice(0, 2)); } }]); });
    }
    return A.bot('In this prototype I can fill your file from documents, list what is still missing, and get your updates ready to send.')
      .then(function(){ A.chips(START); });
  }

  var START = [
    { t:'Fill my file from documents', run:function(a){ a.prefill('Fill my file from these documents', DOCS); } },
    { t:'Try a blurred photo and an old certificate', run:function(a){ a.prefill('Fill my file from these documents', HARD); } },
    { t:'What is still missing?', ask:'What is still missing?' }
  ];

  A.init({
    context:'Reading your file · Tulivu Cooperative',
    greeting:'<p>Hi. Banque Orimu is waiting on <b>2 answers</b> in Registration, your tax and VAT numbers.</p>' +
             '<p>Attach the certificates and I’ll fill them for you, with the page each answer came from.</p>',
    placeholder:'Ask, or attach documents to fill your file',
    attach:{ label:'Documents Tulivu keeps on file', samples:DOCS, hardLabel:'Harder cases', hard:HARD },
    chips:START,
    onAsk:onAsk,
    autoOpen:/[?&]assist=/.test(location.search)
  });

  /* The hints need the assistant ready, so the first section is drawn again. */
  F.refresh();

  if (/[?&]assist=fill/.test(location.search)) A.prefill('Fill my file from these documents', DOCS.slice(0, 2));
})();
