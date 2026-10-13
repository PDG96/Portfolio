/* ==========================================================================
   KOTA — moving between screens.

   The prototype is eight separate documents, so every navigation was a white
   blink and a hard cut: the old screen vanished, the browser painted, the new
   one appeared already scrolled to the top. Between two screens of the same
   product that reads as two products.

   What this does is small on purpose. A cover in the app's own ground colour
   fades in over the outgoing page, the navigation happens behind it, and the
   incoming page fades it back out. No slide, no scale: this is a file being
   opened from a list, not a card flying across the screen, and a 140ms veil
   is enough to make the cut feel like a step.

   It is loaded before the page's own script on every screen, and it takes
   over both kinds of navigation the prototype uses: plain <a href> links, and
   the JS that sets location.href from a row, a pin popup or the seat menu.
   Those call KOTA.go(), which is defined here.

   Everything degrades: if this file fails to load, KOTA.go falls back to a
   direct assignment at the call site, links are still links, and the cover
   is never painted because it is created by this script and nothing else.
   ========================================================================== */
(function () {
  var OUT = 140;      // long enough to register, short enough not to be waited on
  var IN  = 240;

  var css = document.createElement('style');
  css.textContent =
    '.kota-veil{position:fixed;inset:0;z-index:900;background:#151617;opacity:0;' +
      'pointer-events:none;transition:opacity ' + OUT + 'ms ease}' +
    '.kota-veil.is-on{opacity:1}' +
    '@media (prefers-reduced-motion: no-preference){' +
      /* Leaving: the screen is set down rather than switched off. A small
         lift and a dim, under the veil, so the cut has a direction. */
      '.kota-out .app{animation:kota-leave ' + OUT + 'ms ease both}' +
      '@keyframes kota-leave{to{opacity:.55;transform:translateY(-6px)}}' +
      /* Arriving: the frame settles first, then the cards land in reading
         order. A page that appears whole reads as a document being replaced;
         a page that assembles reads as an app moving. */
      '.kota-in{animation:kota-rise ' + IN + 'ms cubic-bezier(.2,.7,.3,1) both}' +
      '@keyframes kota-rise{from{opacity:0;transform:translateY(8px)}' +
                           'to{opacity:1;transform:none}}' +
      '.kota-in .canvas > *{animation:kota-card 300ms cubic-bezier(.2,.7,.3,1) both;' +
        'animation-delay:calc(70ms + var(--n, 0) * 48ms)}' +
      '@keyframes kota-card{from{opacity:0;transform:translateY(12px)}' +
                           'to{opacity:1;transform:none}}}';
  document.head.appendChild(css);

  var veil = document.createElement('div');
  veil.className = 'kota-veil is-on';
  veil.setAttribute('aria-hidden', 'true');

  function ready(fn){
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.body.appendChild(veil);
    /* Two frames: one for the veil to exist at full opacity, one for the
       transition to have something to run from. The timer is not a nicety:
       requestAnimationFrame does not fire in a background tab, and without it
       a screen opened in one stays behind the veil until it is looked at. */
    function lift(){ veil.classList.remove('is-on'); }
    requestAnimationFrame(function () { requestAnimationFrame(lift); });
    setTimeout(lift, 80);
    var app = document.querySelector('.app') || document.querySelector('.wrap');
    if (app) {
      /* The stagger is index order, which is reading order, which is the order
         the page was written in. A card holding a map is left out: animating a
         transformed ancestor over a WebGL canvas makes it judder for no gain. */
      var cards = app.querySelectorAll('.canvas > *'), last = 0;
      [].forEach.call(cards, function (el, i) {
        if (el.querySelector('.map, #opmap')) return;
        el.style.setProperty('--n', i);
        last = i;
      });
      app.classList.add('kota-in');
      /* Held only as long as the longest card needs, then taken off so nothing
         on the page is left inside an animation it has finished. */
      setTimeout(function () {
        app.classList.remove('kota-in');
        [].forEach.call(cards, function (el) { el.style.removeProperty('--n'); });
      }, IN + 70 + last * 48 + 300);
    }
  });

  var leaving = false;

  function go(url) {
    if (!url || leaving) return;
    leaving = true;
    document.documentElement.classList.add('kota-out');
    veil.classList.add('is-on');
    setTimeout(function () { window.location.href = url; }, OUT);
    /* If the page is still here a beat later the navigation was blocked or
       the target is slow; either way the veil should not stay up forever. */
    setTimeout(function () {
      leaving = false;
      veil.classList.remove('is-on');
      document.documentElement.classList.remove('kota-out');
    }, 2500);
  }

  /* Links keep working as links: no handler on each one, just the document
     catching the ones that stay inside the prototype. */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey ||
        e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
    var href = a.getAttribute('href');
    if (!href || href.charAt(0) === '#' || /^[a-z]+:/i.test(href)) return;
    e.preventDefault();
    go(href);
  });

  /* Coming back with the browser's arrow restores the page from cache with
     the veil still up, if it was mid-fade when it left. */
  addEventListener('pageshow', function (e) {
    if (e.persisted) {
      leaving = false;
      veil.classList.remove('is-on');
      document.documentElement.classList.remove('kota-out');
    }
  });

  window.KOTA = window.KOTA || {};
  window.KOTA.go = go;
})();
