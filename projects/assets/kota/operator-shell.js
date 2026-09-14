/* ==========================================================================
   KOTA — the operator side's shell.

   The rail, the seat switcher, the notification bell, the tooltip and the
   sticky header are the same object on every operator screen, so they are
   written once here instead of four times in four files. The bank screens
   keep theirs inline because they were built first; if this holds up, they
   should move here too.

   Nothing in this file knows about a page's content. It takes one argument —
   which rail item is the current one — and wires the chrome around it.
   ========================================================================== */
(function(global){

  var ICON = {
    overview: '<path d="M9 21V13.6C9 13.0399 9 12.7599 9.10899 12.546C9.20487 12.3578 9.35785 12.2049 9.54601 12.109C9.75992 12 10.0399 12 10.6 12H13.4C13.9601 12 14.2401 12 14.454 12.109C14.6422 12.2049 14.7951 12.3578 14.891 12.546C15 12.7599 15 13.0399 15 13.6V21M11.0177 2.764L4.23539 8.03912C3.78202 8.39175 3.55534 8.56806 3.39203 8.78886C3.24737 8.98444 3.1396 9.20478 3.07403 9.43905C3 9.70352 3 9.9907 3 10.5651V17.8C3 18.9201 3 19.4801 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4801 21 18.9201 21 17.8V10.5651C21 9.9907 21 9.70352 20.926 9.43905C20.8604 9.20478 20.7526 8.98444 20.608 8.78886C20.4447 8.56806 20.218 8.39175 19.7646 8.03913L12.9823 2.764C12.631 2.49075 12.4553 2.35412 12.2613 2.3016C12.0902 2.25526 11.9098 2.25526 11.7387 2.3016C11.5447 2.35412 11.369 2.49075 11.0177 2.764Z"/>',
    form:     '<path d="M14 11H8M10 15H8M16 7H8M20 6.8V17.2C20 18.8802 20 19.7202 19.673 20.362C19.3854 20.9265 18.9265 21.3854 18.362 21.673C17.7202 22 16.8802 22 15.2 22H8.8C7.11984 22 6.27976 22 5.63803 21.673C5.07354 21.3854 4.6146 20.9265 4.32698 20.362C4 19.7202 4 18.8802 4 17.2V6.8C4 5.11984 4 4.27976 4.32698 3.63803C4.6146 3.07354 5.07354 2.6146 5.63803 2.32698C6.27976 2 7.11984 2 8.8 2H15.2C16.8802 2 17.7202 2 18.362 2.32698C18.9265 2.6146 19.3854 3.07354 19.673 3.63803C20 4.27976 20 5.11984 20 6.8Z"/>',
    apps:     '<path d="M20.5 7.27783L12 12.0001M12 12.0001L3.49997 7.27783M12 12.0001L12 21.5001M21 16.0586V7.94153C21 7.59889 21 7.42757 20.9495 7.27477C20.9049 7.13959 20.8318 7.01551 20.7354 6.91082C20.6263 6.79248 20.4766 6.70928 20.177 6.54288L12.777 2.43177C12.4934 2.27421 12.3516 2.19543 12.2015 2.16454C12.0685 2.13721 11.9315 2.13721 11.7986 2.16454C11.6484 2.19543 11.5066 2.27421 11.223 2.43177L3.82297 6.54288C3.52345 6.70928 3.37369 6.79248 3.26463 6.91082C3.16816 7.01551 3.09515 7.13959 3.05048 7.27477C3 7.42757 3 7.59889 3 7.94153V16.0586C3 16.4013 3 16.5726 3.05048 16.7254C3.09515 16.8606 3.16816 16.9847 3.26463 17.0893C3.37369 17.2077 3.52345 17.2909 3.82297 17.4573L11.223 21.5684C11.5066 21.726 11.6484 21.8047 11.7986 21.8356C11.9315 21.863 12.0685 21.863 12.2015 21.8356C12.3516 21.8047 12.4934 21.726 12.777 21.5684L20.177 17.4573C20.4766 17.2909 20.6263 17.2077 20.7354 17.0893C20.8318 16.9847 20.9049 16.8606 20.9495 16.7254C21 16.5726 21 16.4013 21 16.0586Z"/>',
    docs:     '<path d="M13 2v6a2 2 0 0 0 2 2h6M15 2H8a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5l-3-3Z"/>',
    sites:    '<path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    bell:     '<path d="M9.35 21a3.5 3.5 0 0 0 5.3 0M18 8a6 6 0 1 0-12 0c0 3.09-.78 5.21-1.65 6.61-.73 1.18-1.1 1.77-1.09 1.94.02.18.06.25.21.36.13.09.73.09 1.93.09h13.2c1.2 0 1.8 0 1.93-.1.15-.1.19-.17.2-.35.02-.17-.35-.76-1.08-1.94C18.78 13.21 18 11.09 18 8Z"/>',
    gear:     '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/>'
  };

  var KIVU_MARK =
    '<svg viewBox="0 0 38 38" fill="none" aria-hidden="true">' +
      '<defs>' +
        '<linearGradient id="rk1" x1="12.7" y1="11.8" x2="25.2" y2="34.9" gradientUnits="userSpaceOnUse">' +
          '<stop stop-color="#12268B" stop-opacity="0.7"/><stop offset="1" stop-color="#0D34F6" stop-opacity="0.7"/>' +
        '</linearGradient>' +
        '<linearGradient id="rk2" x1="19.6" y1="11.8" x2="32.1" y2="34.9" gradientUnits="userSpaceOnUse">' +
          '<stop offset="0.58" stop-color="#0D34F6" stop-opacity="0.7"/><stop offset="1" stop-color="#0E06A8" stop-opacity="0.7"/>' +
        '</linearGradient>' +
      '</defs>' +
      '<rect x="0.4" y="0.4" width="37.3" height="37.3" rx="18.6" fill="#EEEFF0" stroke="#2B2C2D" stroke-width="0.7"/>' +
      '<g transform="translate(5.5 8.25) scale(0.7988) translate(-7.0972 -10.5518)">' +
        '<circle cx="20.5455" cy="24.0001" r="13.4483" fill="url(#rk1)"/>' +
        '<circle cx="27.4542" cy="24.0001" r="13.4483" fill="url(#rk2)"/>' +
        '<path d="M21.5589 28.6603C21.4631 28.6603 21.3847 28.6298 21.3237 28.5688C21.2627 28.5078 21.2322 28.4294 21.2322 28.3336V19.8389C21.2322 19.7431 21.2627 19.6647 21.3237 19.6037C21.3847 19.5427 21.4631 19.5122 21.5589 19.5122H22.9442C23.0401 19.5122 23.1185 19.5427 23.1795 19.6037C23.2404 19.6647 23.2709 19.7431 23.2709 19.8389V22.8186L25.9631 19.7605C25.9979 19.7082 26.0546 19.656 26.133 19.6037C26.2201 19.5427 26.3334 19.5122 26.4728 19.5122H28.0541C28.1325 19.5122 28.1978 19.5427 28.2501 19.6037C28.3024 19.656 28.3285 19.7169 28.3285 19.7866C28.3285 19.8476 28.3111 19.8999 28.2762 19.9435L24.9176 23.8902L28.5245 28.229C28.5594 28.2639 28.5768 28.3161 28.5768 28.3858C28.5768 28.4555 28.5507 28.5209 28.4984 28.5819C28.4461 28.6341 28.3808 28.6603 28.3024 28.6603H26.6688C26.512 28.6603 26.3943 28.6254 26.3159 28.5557C26.2375 28.486 26.1853 28.4381 26.1591 28.412L23.2709 25.0664V28.3336C23.2709 28.4294 23.2404 28.5078 23.1795 28.5688C23.1185 28.6298 23.0401 28.6603 22.9442 28.6603H21.5589Z" fill="#F9FAFB"/>' +
      '</g>' +
    '</svg>';

  /* The two questions the reviewer left are the operator's notifications:
     there is no second feed, it is the same record read as an inbox. */
  var NOTES = [
    { t:'Banque Orimu asked about your tax identification number', m:'Today · N. Okonkwo', href:'operator-form.html' },
    { t:'Banque Orimu asked about your VAT registration number',   m:'Today · N. Okonkwo', href:'operator-form.html' },
    { t:'Your file was sent to Banque Orimu',                      m:'10 Aug 2025', href:'operator-applications.html', old:true }
  ];

  function svg(path){
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
           'stroke-linecap="round" stroke-linejoin="round">' + path + '</svg>';
  }

  function item(o){
    return '<button class="nav' + (o.active ? ' active' : '') + '" type="button"' +
      ' aria-label="' + o.label + '" data-tip="' + o.label + '"' +
      (o.off ? ' data-tip-off disabled' : '') +
      (o.active ? ' aria-current="page"' : '') +
      (o.href ? ' data-href="' + o.href + '"' : '') +
      (o.id ? ' id="' + o.id + '"' : '') + '>' +
      svg(ICON[o.icon]) + (o.badge ? '<span class="badge"></span>' : '') + '</button>';
  }

  global.buildOperatorRail = function(current){
    var rail = document.getElementById('rail');
    if (!rail) return;

    rail.innerHTML =
      '<div class="navgroup">' +
        item({ icon:'overview', label:'Home',              href:'operator-home.html',         active:current === 'overview' }) +
        item({ icon:'form',     label:'Your information',  href:'operator-form.html',         active:current === 'form' }) +
        item({ icon:'apps',     label:'Applications',      href:'operator-applications.html', active:current === 'applications' }) +
        item({ icon:'docs',     label:'Documents',         off:true }) +
        item({ icon:'sites',    label:'Sites',             off:true }) +
      '</div>' +
      '<div class="spacer"></div>' +
      item({ icon:'bell', label:'Notifications', id:'bellBtn', badge:true }) +
      item({ icon:'gear', label:'Settings', off:true }) +
      '<button class="me" id="seatBtn" type="button" aria-label="Change seat" ' +
        'data-tip="You are the operator">' + KIVU_MARK + '</button>';

    [].forEach.call(rail.querySelectorAll('[data-href]'), function(b){
      b.addEventListener('click', function(){ KOTA.go(b.getAttribute('data-href')); });
    });

    wireBell();
    wireSeat();
    wireTip();
    wireSticky();
  };

  function wireBell(){
    var btn = document.getElementById('bellBtn');
    if (!btn) return;
    var pop = document.createElement('div');
    pop.className = 'notifpop';
    pop.id = 'notifpop';
    pop.setAttribute('role', 'menu');
    pop.innerHTML = '<div class="lbl">Notifications</div>' +
      NOTES.map(function(n){
        return '<button type="button" data-href="' + n.href + '" role="menuitem" class="' +
          (n.old ? 'old' : '') + '"><span class="dot"></span><span><b>' + n.t + '</b>' +
          '<span class="m">' + n.m + '</span></span></button>';
      }).join('');
    document.body.appendChild(pop);

    btn.addEventListener('click', function(e){
      e.stopPropagation();
      pop.classList.toggle('is-on');
      var seat = document.getElementById('seatpop');
      if (seat) seat.classList.remove('is-on');
    });
    [].forEach.call(pop.querySelectorAll('[data-href]'), function(b){
      b.addEventListener('click', function(){ KOTA.go(b.getAttribute('data-href')); });
    });
    document.addEventListener('click', function(e){
      if (!pop.contains(e.target)) pop.classList.remove('is-on');
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') pop.classList.remove('is-on');
    });
  }

  function wireSeat(){
    var pop = document.getElementById('seatpop'), btn = document.getElementById('seatBtn');
    if (!pop || !btn) return;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      pop.classList.toggle('is-on');
      var n = document.getElementById('notifpop');
      if (n) n.classList.remove('is-on');
    });
    document.addEventListener('click', function(e){
      if (!pop.contains(e.target)) pop.classList.remove('is-on');
    });
    [].forEach.call(pop.querySelectorAll('[data-seat]'), function(b){
      b.addEventListener('click', function(){
        var seat = b.getAttribute('data-seat');
        try { if (seat !== 'start') localStorage.setItem('kota-seat', seat); } catch (err) {}
        KOTA.go(seat === 'bank' ? 'bank-home.html'
              : seat === 'start' ? 'start.html' : 'operator-home.html');
      });
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') pop.classList.remove('is-on');
    });
  }

  function wireTip(){
    var tip = document.getElementById('ctip');
    if (!tip) return;
    document.addEventListener('mouseover', function(e){
      var el = e.target.closest && e.target.closest('[data-tip]');
      if (!el) return;
      var r = el.getBoundingClientRect(), rail = el.closest('.rail');
      tip.innerHTML = el.getAttribute('data-tip') +
        (el.hasAttribute('data-tip-off') ? '<span class="tip-off">Disabled</span>' : '');
      tip.classList.toggle('ctip--right', !!rail);
      tip.style.left = rail ? (r.right + 10) + 'px' : (r.left + r.width / 2) + 'px';
      tip.style.top  = rail ? (r.top + r.height / 2) + 'px' : (r.top - 8) + 'px';
      tip.classList.add('is-on');
    });
    document.addEventListener('mouseout', function(e){
      if (e.target.closest && e.target.closest('[data-tip]')) tip.classList.remove('is-on');
    });
  }

  function wireSticky(){
    var head = document.getElementById('stickyhead');
    if (!head) return;
    function onScroll(){ head.classList.toggle('is-stuck', window.scrollY > 2); }
    window.addEventListener('scroll', onScroll, { passive:true });
    onScroll();
  }

})(window);
