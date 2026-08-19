/**
 * <indicator-stack>
 *
 * Vertical list of KPI cards: round thumbnail · label + animated number ·
 * delta chip. Auto-mounts on any element marked
 *   <div data-chart="indicator-stack" data-src="path/to/data.json"></div>
 *
 * Data contract, see ./data.json. Each item supports:
 *   label, value, unit (optional), image, delta { value, direction }
 *   and per-item number formatting: valueDecimals, thousandsSeparator,
 *   decimalSeparator.
 *
 * Motion:
 *   - Cards cascade in from the bottom with a soft stagger
 *   - Numbers count up from zero to their final value, easeOutCubic
 *   - Delta chips slide in from the right after the number settles
 */

(function () {
  function ensureStyles() {
    if (document.getElementById('indicator-stack-styles')) return;
    const style = document.createElement('style');
    style.id = 'indicator-stack-styles';
    style.textContent = `
      [data-chart="indicator-stack"] {
        display: flex;
        flex-direction: column;
        /* --is-gap can be overridden by the host context (e.g. the bento
           overrides it so the cards align with the surrounding tile gaps). */
        gap: var(--is-gap, 12px);
      }
      /* When the indicator-stack has a fixed parent height (e.g. inside the
         bento tile), the 3 cards stretch to fill it equally. In contexts
         without a fixed height (the standalone preview), flex: 1 stays
         no-op because there is no spare space to distribute. */
      [data-chart="indicator-stack"] > .is-card {
        flex: 1 1 0;
        min-height: 0;
      }
      [data-chart="indicator-stack"] {
        --is-thumb-size: 56px;
        --is-card-padding-y: 14px;
        --is-card-padding-x: 16px;
        --is-label-size: 13px;
        --is-value-size: 22px;
      }
      .is-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: var(--is-card-padding-y) var(--is-card-padding-x);
        background: #ffffff;
        border: 1px solid rgba(20, 20, 20, 0.08);
        border-radius: 12px;
        opacity: 0;
        transform: translateY(14px);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        transition:
          opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
          transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
          border-color 0.3s ease,
          box-shadow 0.3s ease;
      }
      .is-card.is-revealed {
        opacity: 1;
        transform: translateY(0);
      }
      /* Per-card hover, each indicator reacts on its own */
      .is-card.is-revealed:hover {
        transform: translateY(-3px);
        border-color: rgba(20, 20, 20, 0.18);
        box-shadow: 0 10px 24px -12px rgba(0, 0, 0, 0.12);
        cursor: default;
      }
      .is-thumb {
        position: relative;
        width: var(--is-thumb-size);
        height: var(--is-thumb-size);
        flex: none;
        border-radius: 50%;
        background: #f5f5f5;
        transform: scale(0.92);
        transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .is-card.is-revealed .is-thumb { transform: scale(1); }

      /* Continuously rotating ring, a soft sweep of teals that keeps the
         KPI feeling alive after the entrance animation finishes. */
      .is-thumb::before {
        content: '';
        position: absolute;
        inset: -2.5px;
        border-radius: 50%;
        background: conic-gradient(
          from 0deg,
          rgba(32, 169, 171, 0)    0%,
          rgba(32, 169, 171, 0.85) 22%,
          rgba(87, 202, 203, 0.55) 45%,
          rgba(162, 233, 233, 0.7) 65%,
          rgba(197, 251, 251, 0.5) 80%,
          rgba(32, 169, 171, 0)    100%
        );
        animation: is-thumb-ring 8s linear infinite;
        pointer-events: none;
        z-index: 0;
      }
      .is-thumb img {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }
      @keyframes is-thumb-ring {
        to { transform: rotate(360deg); }
      }

      @media (prefers-reduced-motion: reduce) {
        .is-thumb::before { animation: none; }
      }
      .is-text {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .is-label {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-size: var(--is-label-size);
        font-weight: 500;
        color: rgba(20, 20, 20, 0.55);
        letter-spacing: -0.005em;
        line-height: 1.2;
      }
      .is-value {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-size: var(--is-value-size);
        font-weight: 600;
        color: #141414;
        letter-spacing: -0.015em;
        line-height: 1.15;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .is-unit {
        font-size: 13px;
        font-weight: 500;
        color: rgba(20, 20, 20, 0.55);
        margin-left: 4px;
      }
      .is-delta {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 999px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-size: 12px;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
        flex: none;
        opacity: 0;
        transform: translateX(8px);
        transition:
          opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
          transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        transition-delay: 0.35s;
      }
      .is-card.is-revealed .is-delta {
        opacity: 1;
        transform: translateX(0);
      }
      .is-delta--up   { background: #E4FCFD; color: #1B989B; }
      .is-delta--down { background: #FCE4E4; color: #C7232C; }
      .is-delta svg  { width: 12px; height: 12px; }

      @media (prefers-reduced-motion: reduce) {
        .is-card, .is-thumb, .is-delta {
          transition: none;
        }
        .is-card { opacity: 1; transform: none; }
        .is-thumb { transform: scale(1); }
        .is-delta { opacity: 1; transform: none; }
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Format a number with optional decimals + thousands/decimal separators.
  function formatNumber(value, opts) {
    const decimals = typeof opts.valueDecimals === 'number' ? opts.valueDecimals : 0;
    const thousands = opts.thousandsSeparator || '';
    const decimal   = opts.decimalSeparator || '.';
    const fixed     = Number(value).toFixed(decimals);
    const [intRaw, decRaw] = fixed.split('.');
    const intStr = thousands ? intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) : intRaw;
    return decRaw !== undefined ? `${intStr}${decimal}${decRaw}` : intStr;
  }

  // easeOutQuint, very strong deceleration. Lands the number tightly so
  // the last visible jump happens earlier in time and the counter doesn't
  // visually stall at the end.
  function easeOutQuint(t) { return 1 - Math.pow(1 - t, 5); }

  // Animate the number from 0 to `to`, formatting every frame.
  function countUp(el, to, opts, duration = 650) {
    const start = performance.now();
    function tick(now) {
      // Clamped to [0, 1]: `now` should never come in before `start`, but a
      // backgrounded/throttled tab (common for an iframe scrolled off, or
      // paused while hidden) can hand rAF a timestamp that doesn't line up
      // with when this closure captured `start`. An unclamped negative t
      // sends easeOutQuint to a huge negative number, which is exactly the
      // "-813,057,706..." garbage this was producing instead of the real
      // value, so guard both ends regardless of what causes the skew.
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const current = to * easeOutQuint(t);
      el.firstChild.nodeValue = formatNumber(current, opts);
      if (t < 1) requestAnimationFrame(tick);
      else el.firstChild.nodeValue = formatNumber(to, opts);
    }
    el.firstChild.nodeValue = formatNumber(0, opts);
    requestAnimationFrame(tick);
    /* Same guard as vertical-gauge: rAF is suspended in a background tab, so
       an indicator revealed there would stay frozen on 0 and read as a real
       figure. Timers keep running, so this lands the true value regardless. */
    setTimeout(() => { el.firstChild.nodeValue = formatNumber(to, opts); }, duration + 250);
  }

  function arrowSvg(direction) {
    if (direction === 'down') {
      return `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2v8M3 7l3 3 3-3"/></svg>`;
    }
    return `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 10V2M3 5l3-3 3 3"/></svg>`;
  }

  function buildCard(item) {
    const numberOpts = {
      valueDecimals: item.valueDecimals,
      thousandsSeparator: item.thousandsSeparator,
      decimalSeparator: item.decimalSeparator,
    };
    const initialDisplay = formatNumber(0, numberOpts);
    const unitHtml = item.unit ? `<span class="is-unit">${escapeHtml(item.unit)}</span>` : '';
    const delta = item.delta || null;
    const deltaHtml = delta
      ? `<span class="is-delta is-delta--${delta.direction === 'down' ? 'down' : 'up'}">
           ${arrowSvg(delta.direction)}
           ${formatNumber(delta.value, { thousandsSeparator: item.thousandsSeparator })}
         </span>`
      : '';
    const imgHtml = item.image
      ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy">`
      : '';

    const card = document.createElement('div');
    card.className = 'is-card';
    card.innerHTML = `
      <div class="is-thumb">${imgHtml}</div>
      <div class="is-text">
        <div class="is-label">${escapeHtml(item.label || '')}</div>
        <div class="is-value"><span class="is-number">${initialDisplay}</span>${unitHtml}</div>
      </div>
      ${deltaHtml}
    `;
    card._numberEl = card.querySelector('.is-number');
    card._numberOpts = numberOpts;
    card._targetValue = item.value;
    return card;
  }

  async function mount(el) {
    ensureStyles();
    const src = el.dataset.src;
    if (!src) {
      console.warn('[indicator-stack] missing data-src on', el);
      return;
    }

    let payload;
    try {
      const r = await fetch(src, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      payload = await r.json();
    } catch (err) {
      console.error('[indicator-stack] fetch failed', err);
      el.innerHTML = `<div style="padding:1rem;font-family:monospace;font-size:12px;color:#C7232C;">Failed to load data. ${escapeHtml(String(err.message || err))}</div>`;
      return;
    }

    const items = Array.isArray(payload.items) ? payload.items : [];
    el.innerHTML = '';
    const cards = items.map(buildCard);
    cards.forEach((c) => el.appendChild(c));

    // Stagger reveal, then kick off each card's counter once it lands.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    cards.forEach((card, i) => {
      const delay = reduce ? 0 : i * 140;
      setTimeout(() => {
        card.classList.add('is-revealed');
        // Number counter starts shortly after the card itself starts
        // revealing so the motion reads as one event.
        const counterStart = reduce ? 0 : 220;
        setTimeout(() => {
          if (typeof card._targetValue === 'number') {
            countUp(card._numberEl, card._targetValue, card._numberOpts, reduce ? 0 : 650);
          } else {
            card._numberEl.textContent = String(card._targetValue);
          }
        }, counterStart);
      }, delay);
    });

    el.dispatchEvent(new CustomEvent('indicator-stack:ready', { detail: { items } }));
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="indicator-stack"]:not([data-mounted])');
    if (!targets.length) return;

    if (window !== window.top) {
      const mountAll = () => targets.forEach((el) => {
        if (el.dataset.mounted) return;
        el.dataset.mounted = '1';
        mount(el);
      });
      const onMessage = (ev) => {
        if (ev && ev.data && ev.data.type === 'bento:visible') {
          mountAll();
          window.removeEventListener('message', onMessage);
        }
      };
      window.addEventListener('message', onMessage);
      setTimeout(mountAll, 5000);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      targets.forEach((el) => { el.dataset.mounted = '1'; mount(el); });
      return;
    }

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        io.unobserve(e.target);
        e.target.dataset.mounted = '1';
        mount(e.target);
      }
    }, { rootMargin: '120px' });

    targets.forEach((el) => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Exposed for tooling / previews that want to re-run the reveal (the
  // gallery "Replay" button uses this). Removes mount markers + clears
  // children, then mounts again immediately.
  window.IndicatorStack = {
    remount(el) {
      delete el.dataset.mounted;
      el.innerHTML = '';
      mount(el);
    },
    remountAll() {
      document.querySelectorAll('[data-chart="indicator-stack"]').forEach((el) => this.remount(el));
    },
  };
})();
