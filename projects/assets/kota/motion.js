/* ==========================================================================
   KOTA — when the data arrives.

   motion.css says how a chart draws itself. This says when: the moment the
   card it lives in reaches the screen, and not before. A chart eight screens
   down that animated on load has finished long before anyone scrolls to it,
   which is the same as never having animated.

   Two steps, and the order is the safety:

   1. Arm. Every card holding a mark is marked .m-armed, which is what puts
      its bars at zero and its lines undrawn. Nothing is armed unless this
      file runs, so a chart whose script failed renders finished rather than
      blank. The failure mode is "no animation", never "no chart".

   2. Play. An IntersectionObserver adds .m-on when the card is a fifth on
      screen, then stops watching it. It plays once, per visit, per card.

   The card is found by walking up from each mark, so nothing has to be
   labelled twice: put an .m-bar in a new chart and the card it sits in is
   picked up with it.
   ========================================================================== */
(function () {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var MARKS = '.m-bar,.m-fill,.m-draw,.m-area,.m-dot,.m-cell,.m-arc,.m-val';

  function arm() {
    var cards = [];
    [].forEach.call(document.querySelectorAll(MARKS), function (el) {
      /* The card, not the chart: a gauge and the numbers beside it belong to
         one reading and should arrive together. */
      var card = el.closest('.block, .kpi, .card, figure');
      if (!card || cards.indexOf(card) > -1) return;
      cards.push(card);
    });
    if (!cards.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('m-on');
        io.unobserve(e.target);
      });
    }, { threshold: 0.2 });

    cards.forEach(function (card) {
      card.classList.add('m-armed');
      io.observe(card);
    });

    /* A card can be taller than the window, so a fifth of it may never be on
       screen at once. The fallback plays anything still waiting after the
       page has settled, rather than leaving a chart at zero forever. */
    setTimeout(function () {
      cards.forEach(function (card) {
        var r = card.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) card.classList.add('m-on');
      });
    }, 1200);
  }

  /* Charts here are written by script, so the marks do not exist at
     DOMContentLoaded. One frame after load is enough, and the observer picks
     up anything drawn later on the next tab switch because arm() runs again. */
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () { requestAnimationFrame(arm); setTimeout(arm, 250); });

  /* Tabs swap whole panes in and out; a pane that was hidden when arm() ran
     has marks nobody is watching. */
  document.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.segb')) setTimeout(arm, 60);
  });

  window.KOTA = window.KOTA || {};
  window.KOTA.arm = arm;
})();
