/**
 * <score-gauge>
 *
 * Horizontal score gauge: rounded gradient track, a draggable-looking
 * marker pinned at the score position, and the value label on the right.
 * Auto-mounts on any element marked
 *   <div data-chart="score-gauge" data-src="path/to/data.json"></div>
 *
 * Data contract, see ./data.json:
 *   { value: 90, min: 0, max: 100, suffix: "%",
 *     gradient: ["#E2574A","#F0A864","#C8CF63","#6FCC8C"],
 *     marker: { items: ["Watchlist 01", "Watchlist 02"] } }
 *
 * The gradient fill sweeps in from the left on mount; hovering the marker
 * opens a small tooltip listing `marker.items` (the same visual contract
 * as ChartTooltip, rendered as plain DOM so no chart lib is needed).
 */

(function () {
  function ensureStyles() {
    if (document.getElementById('score-gauge-styles')) return;
    const style = document.createElement('style');
    style.id = 'score-gauge-styles';
    style.textContent = `
      [data-chart="score-gauge"] {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
      }
      .sg-track {
        position: relative;
        flex: 1;
        height: 8px;
        border-radius: 999px;
        background: rgba(20,20,20,0.08);
        overflow: visible;
      }
      .sg-fill {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        transform-origin: left center;
        transform: scaleX(0);
        transition: transform 1.1s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .sg-marker {
        position: absolute;
        top: 50%;
        width: 14px;
        height: 14px;
        border-radius: 50%;
        background: #ffffff;
        border: 2px solid rgba(20,20,20,0.45);
        box-shadow: 0 1px 4px rgba(0,0,0,0.25);
        transform: translate(-50%, -50%) scale(0);
        transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1) 0.9s;
        cursor: pointer;
        z-index: 2;
      }
      .sg-marker:hover { border-color: #141414; }
      .sg-value {
        font-size: 13px;
        font-weight: 600;
        color: #141414;
        flex: none;
      }
      .sg-tip {
        position: absolute;
        top: calc(100% + 10px);
        left: 50%;
        transform: translateX(-50%);
        background: #ffffff;
        border: 1px solid rgba(20,20,20,0.10);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        padding: 8px 12px;
        font-size: 11px;
        color: rgba(20,20,20,0.75);
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s;
        z-index: 5;
      }
      .sg-tip ul { margin: 0; padding: 0 0 0 14px; }
      .sg-tip li { line-height: 1.6; }
      .sg-marker:hover .sg-tip,
      .sg-marker:focus .sg-tip { opacity: 1; }
    `;
    document.head.appendChild(style);
  }

  async function mount(el) {
    const src = el.dataset.src;
    if (!src) { console.warn('[score-gauge] missing data-src on', el); return; }
    try {
      const d = await fetch(src, { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + src);
        return r.json();
      });
      const min = d.min ?? 0, max = d.max ?? 100;
      const pct = Math.max(0, Math.min(1, (d.value - min) / (max - min)));
      const stops = (d.gradient || ['#E2574A', '#F0A864', '#C8CF63', '#6FCC8C']).join(', ');
      const items = (d.marker && d.marker.items) || [];

      el.innerHTML = `
        <div class="sg-track">
          <div class="sg-fill" style="background: linear-gradient(90deg, ${stops});"></div>
          <button class="sg-marker" style="left: ${pct * 100}%;" aria-label="Score marker">
            ${items.length ? `<span class="sg-tip"><ul>${items.map(i => `<li>${i}</li>`).join('')}</ul></span>` : ''}
          </button>
        </div>
        <span class="sg-value">${d.value}${d.suffix ?? '%'}</span>
      `;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.querySelector('.sg-fill').style.transform = 'scaleX(1)';
        el.querySelector('.sg-marker').style.transform = 'translate(-50%, -50%) scale(1)';
      }));
      el.dispatchEvent(new CustomEvent('score-gauge:ready'));
    } catch (err) {
      console.error('[score-gauge] mount failed', err);
    }
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="score-gauge"]:not([data-mounted])');
    if (!targets.length) return;
    ensureStyles();

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
    }, { rootMargin: '160px' });
    targets.forEach((el) => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
