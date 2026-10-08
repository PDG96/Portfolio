/* ==========================================================================
   KOTA: the assistant on the operator's home.

   Home is where the operator asks "what now?". The assistant answers from
   the same numbers the cards show and hands off to the screen where the
   work is, already set up to do it.
   ========================================================================== */
(function(){
  var A = window.KotaAssistant;
  if (!A) return;

  function go(url){
    if (window.KOTA && KOTA.go) KOTA.go(url); else location.href = url;
  }

  function blocking(){
    return A.steps([
      { t:'Reading your applications', m:'Banque Orimu in review, Banque Sefali in draft', ms:800 },
      { t:'Reading the open questions', m:'2 from N. Okonkwo, both on Registration', ms:800 }
    ], 'Checking your file').then(function(){
      return A.bot('<p>Banque Orimu’s review is waiting on <b>2 answers</b> in Registration: your <b>tax identification number</b> and your <b>VAT registration number</b>.</p>' +
        '<p>Both are printed on certificates you already have. Attach them and I’ll fill the answers, showing the page each one came from.</p>');
    }).then(function(){
      A.chips([
        { t:'Fill them from my certificates', run:function(){ go('operator-form.html?assist=fill'); } },
        { t:'How is my score built?', ask:'How is my score built?' }
      ]);
    });
  }

  function score(){
    return A.steps([{ t:'Reading How you score', m:'Documentation, geography, network', ms:800 }], 'Reading your score')
      .then(function(){
        return A.bot('<p>Your score is <b>62 of 100</b>, built from three parts:</p><ul class="ka-list">' +
          '<li><span><b>Documentation, 20 of 30</b>: the part you can move yourself. The two blank answers count here.</span></li>' +
          '<li><span><b>Geography, 26 of 40</b>: where your sites are, read from the map.</span></li>' +
          '<li><span><b>Network, 16 of 30</b>: who you trade with, upstream and downstream.</span></li></ul>');
      }).then(function(){
        A.chips([{ t:'What is holding up my review?', ask:'What is holding up my review?' }]);
      });
  }

  function onAsk(text){
    var t = text.toLowerCase();
    if (/score|62|built|pontua/.test(t)) return score();
    if (/hold|block|wait|review|next|what now|why|missing|falta/.test(t)) return blocking();
    if (/fill|document|certificate|vat|tax/.test(t)){
      return A.bot('That happens on Your information. Taking you there with the certificates ready to read.')
        .then(function(){ return A.wait(700); }).then(function(){ go('operator-form.html?assist=fill'); });
    }
    return A.bot('In this prototype I can tell you what is holding up a review, explain your score, and fill your file from documents.')
      .then(function(){ A.chips(START); });
  }

  var START = [
    { t:'What is holding up my review?', ask:'What is holding up my review?' },
    { t:'How is my score built?', ask:'How is my score built?' }
  ];

  A.init({
    context:'Your file · Tulivu Cooperative',
    greeting:'<p>Hi. Your file is with <b>Banque Orimu</b> and they left <b>2 questions</b>. Ask me what’s next.</p>',
    placeholder:'Ask about your file or your applications',
    chips:START,
    onAsk:onAsk
  });
})();
