/* ==========================================================================
   KOTA: the assistant on the remaining screens of the prototype.

   Evaluation (bank), Your applications and the Banque Orimu application
   (operator). Each one answers from what its own screen shows and hands off
   to the screen where the work happens, so Ask Kota is on every page of the
   flow and never says something the page beside it does not.
   ========================================================================== */
(function(){
  var A = window.KotaAssistant;
  if (!A) return;

  function go(url){
    if (window.KOTA && KOTA.go) KOTA.go(url); else location.href = url;
  }
  var page = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');

  /* ---- shared operator answers ---- */
  function questions(){
    return A.steps([
      { t:'Reading Banque Orimu’s comments', m:'2 open, both on Registration, from N. Okonkwo', ms:800 }
    ], 'Reading your application').then(function(){
      return A.bot('<p>Banque Orimu asked for <b>2 answers</b> in Registration:</p><ul class="ka-list">' +
        '<li><span><b>Tax identification number</b>: blank. They ask for the tax certificate.</span></li>' +
        '<li><span><b>VAT registration number</b>: blank. Mandatory for exporters, needed before the next review.</span></li></ul>' +
        '<p>Both are printed on certificates. Attach them and I fill the answers, showing the page each one came from.</p>');
    }).then(function(){
      A.chips([
        { t:'Fill them from my certificates', run:function(){ go('operator-form.html?assist=fill'); } },
        { t:'How is my score built?', ask:'How is my score built?' }
      ]);
    });
  }

  function score(){
    return A.steps([{ t:'Reading their score for you', m:'Documentation, geography, network', ms:800 }], 'Reading your score')
      .then(function(){
        return A.bot('<p>Banque Orimu scores you <b>62 of 100</b>:</p><ul class="ka-list">' +
          '<li><span><b>Documentation, 20 of 30</b>: the part you can move yourself. The two blank answers count here.</span></li>' +
          '<li><span><b>Geography, 26 of 40</b>: where your sites are, read from the map.</span></li>' +
          '<li><span><b>Network, 16 of 30</b>: who you trade with, upstream and downstream.</span></li></ul>');
      }).then(function(){
        A.chips([{ t:'Fill the 2 answers', run:function(){ go('operator-form.html?assist=fill'); } }]);
      });
  }

  var PAGES = {

    /* ---- bank · Evaluation ---- */
    evaluation: {
      context:'Evaluation · Banque Orimu',
      greeting:'<p>You have <b>6 operators</b> here. One is ready for your review and five are still registering. Ask me where to start.</p>',
      placeholder:'Ask about your operators',
      chips:[
        { t:'Who should I review first?', ask:'Who should I review first?' },
        { t:'Who is stuck?', ask:'Who is stuck?' }
      ],
      onAsk:function(t){
        if (/stuck|stall|slow|remind|parad/.test(t)){
          return A.steps([
            { t:'Reading the table', m:'Progress and last movement for all 6', ms:800 },
            { t:'Looking for files that stopped', m:'No movement in a week or more, or complete but not sent', ms:800 }
          ], 'Reading the table').then(function(){
            return A.bot('<p>Three files are waiting on the operator:</p><ul class="ka-list">' +
              '<li><span><b>Mweka village association</b>: 25%, no movement in 2 weeks.</span></li>' +
              '<li><span><b>Matoro</b>: invited, 12%, no movement in 1 week.</span></li>' +
              '<li><span><b>Serandi Mining</b>: 100% filled, not sent yet.</span></li></ul>' +
              '<p>A short reminder that names the next step usually moves them.</p>');
          }).then(function(){
            A.chips([
              { t:'Draft reminders on Home', run:function(){ go('bank-home.html?assist=remind'); } },
              { t:'Who should I review first?', ask:'Who should I review first?' }
            ]);
          });
        }
        return A.steps([
          { t:'Reading the table', m:'1 ready for review, 5 registering', ms:800 }
        ], 'Reading the table').then(function(){
          return A.bot('<p><b>Tulivu Cooperative</b> is the only file ready for review: 100% registered, score <b>62 of 100</b>, sent on 12 Aug 2025.</p>' +
            '<p>Its review has two questions open on Registration, so you can read the rest while Tulivu answers.</p>');
        }).then(function(){
          A.chips([
            { t:'Open Tulivu’s review', run:function(){ go('operator-detail.html'); } },
            { t:'Who is stuck?', ask:'Who is stuck?' }
          ]);
        });
      }
    },

    /* ---- operator · Your applications ---- */
    'operator-applications': {
      context:'Your applications · Tulivu Cooperative',
      greeting:'<p>You have <b>2 applications</b>: Banque Orimu is waiting on 2 answers, and Banque Sefali is a draft at 31%.</p>',
      placeholder:'Ask about your applications',
      chips:[
        { t:'What should I do next?', ask:'What should I do next?' },
        { t:'What is Banque Orimu asking?', ask:'What is Banque Orimu asking?' }
      ],
      onAsk:function(t){
        if (/orimu|asking|question|pergunt/.test(t)) return questions();
        if (/score|62/.test(t)) return score();
        return A.steps([
          { t:'Reading your applications', m:'Banque Orimu in review, Banque Sefali in draft', ms:800 }
        ], 'Reading your applications').then(function(){
          return A.bot('<p>Start with <b>Banque Orimu</b>: they are waiting on you, with 2 questions asked today. ' +
            'Then <b>Banque Sefali</b>, a draft at 31% that has not been sent.</p>' +
            '<p>Both use the same file, so the answers you give Orimu also move Sefali forward.</p>');
        }).then(function(){
          A.chips([
            { t:'Answer Orimu from my certificates', run:function(){ go('operator-form.html?assist=fill'); } },
            { t:'What is Banque Orimu asking?', ask:'What is Banque Orimu asking?' }
          ]);
        });
      }
    },

    /* ---- operator · one application ---- */
    'application-detail': {
      context:'Banque Orimu · Tulivu Cooperative',
      greeting:'<p>This is what Banque Orimu received from you. They left <b>2 questions</b> on Registration.</p>',
      placeholder:'Ask about this application',
      chips:[
        { t:'What are they asking?', ask:'What are they asking?' },
        { t:'Who can see my file?', ask:'Who can see my file?' },
        { t:'How is my score built?', ask:'How is my score built?' }
      ],
      onAsk:function(t){
        if (/score|62/.test(t)) return score();
        if (/who|see|read|access|quem/.test(t)){
          return A.bot('<p>Three readers at Banque Orimu:</p><ul class="ka-list">' +
            '<li><span><b>N. Okonkwo</b>, your reviewer.</span></li>' +
            '<li><span><b>Compliance desk</b>, always.</span></li>' +
            '<li><span><b>North Kivu desk</b>, while the application is open.</span></li></ul>' +
            '<p>They see the same list on their side.</p>').then(function(){
              A.chips([{ t:'What are they asking?', ask:'What are they asking?' }]);
            });
        }
        return questions();
      }
    }
  };

  var P = PAGES[page];
  if (!P) return;

  A.init({
    context:P.context,
    greeting:P.greeting,
    placeholder:P.placeholder,
    chips:P.chips,
    onAsk:function(text){
      var r = P.onAsk(text.toLowerCase());
      return r;
    },
    autoOpen:/[?&]assist=/.test(location.search)
  });
})();
