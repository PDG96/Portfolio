/**
 * <ring-chart>
 *
 * One component, two modes, configured entirely by the JSON payload:
 *
 *   mode: "rings"  — concentric progress rings (the double-donut pattern:
 *                    e.g. Consolidated 90% outside, Own Data 82% inside).
 *   mode: "pie"    — a single donut/pie split into segments
 *                    (e.g. Single Source 63% / Multiple Sources 37%).
 *
 * Auto-mounts on any element marked
 *   <div data-chart="ring-chart" data-src="path/to/data.json"></div>
 *
 * Data contract, see ./data.json:
 *   { mode: "rings",
 *     rings: [ { name, value, color, track } ],        // value 0–100
 *     legend: true }
 *   { mode: "pie",
 *     segments: [ { name, value, color } ],            // values sum to 100
 *     inner: 0.55,                                     // 0 = pie, >0 = donut
 *     legend: true }
 *
 * Arcs sweep in on mount (stroke-dashoffset transition). Hovering a ring
 * or segment shows a tooltip with the series name + value, same visual
 * contract as ChartTooltip.
 */

(function () {
  function ensureStyles() {
    if (document.getElementById('ring-chart-styles')) return;
    const style = document.createElement('style');
    style.id = 'ring-chart-styles';
    style.textContent = `
      [data-chart="ring-chart"] {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        width: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
      }
      .rc-svg-wrap { position: relative; width: 100%; display: flex; justify-content: center; }
      .rc-svg { display: block; max-width: 100%; height: auto; }
      .rc-arc, .rc-seg { transition: stroke-dashoffset 1.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s; cursor: pointer; }
      .rc-svg:hover .rc-arc:not(:hover),
      .rc-svg:hover .rc-seg:not(:hover) { opacity: 0.55; }
      .rc-tip {
        position: absolute;
        background: #ffffff;
        border: 1px solid rgba(20,20,20,0.10);
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        padding: 7px 10px;
        font-size: 11px;
        color: #141414;
        white-space: nowrap;
        display: flex;
        align-items: center;
        gap: 7px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s;
        z-index: 5;
      }
      .rc-tip-dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
      .rc-tip-name { color: rgba(20,20,20,0.6); }
      .rc-tip-val { font-weight: 600; }
      .rc-legend {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 6px 16px;
        font-size: 11px;
        color: rgba(20,20,20,0.65);
      }
      .rc-legend span { display: inline-flex; align-items: center; gap: 6px; }
      .rc-legend i { width: 8px; height: 8px; border-radius: 50%; flex: none; }
      .rc-legend b { color: #141414; font-weight: 600; }
    `;
    document.head.appendChild(style);
  }

  function polar(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  function arcPath(cx, cy, r, a0, a1) {
    const [x0, y0] = polar(cx, cy, r, a0);
    const [x1, y1] = polar(cx, cy, r, a1);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  }

  async function mount(el) {
    const src = el.dataset.src;
    if (!src) { console.warn('[ring-chart] missing data-src on', el); return; }
    try {
      const d = await fetch(src, { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + src);
        return r.json();
      });
      const size = 180, cx = size / 2, cy = size / 2;
      let svg = '', legend = [], hot = [];

      if (d.mode === 'pie') {
        const inner = typeof d.inner === 'number' ? d.inner : 0.55;
        const rOut = 84, w = rOut * (1 - inner);
        const r = rOut - w / 2;
        let a = 0;
        d.segments.forEach((s, i) => {
          const sweep = 360 * (s.value / 100);
          const path = arcPath(cx, cy, r, a, Math.min(a + sweep, 359.999));
          svg += `<path class="rc-seg" data-i="${i}" d="${path}" fill="none" stroke="${s.color}" stroke-width="${w}" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>`;
          legend.push(s); hot.push(s);
          a += sweep;
        });
      } else {
        const gap = 16, w = 13;
        (d.rings || []).forEach((ring, i) => {
          const r = 84 - i * gap;
          svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ring.track || 'rgba(20,20,20,0.07)'}" stroke-width="${w}"/>`;
          const path = arcPath(cx, cy, r, 0, Math.min(360 * (ring.value / 100), 359.999));
          svg += `<path class="rc-arc" data-i="${i}" d="${path}" fill="none" stroke="${ring.color}" stroke-width="${w}" stroke-linecap="round" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>`;
          legend.push(ring); hot.push(ring);
        });
      }

      el.innerHTML = `
        <div class="rc-svg-wrap">
          <svg class="rc-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">${svg}</svg>
          <div class="rc-tip" role="tooltip">
            <span class="rc-tip-dot"></span><span class="rc-tip-name"></span><span class="rc-tip-val"></span>
          </div>
        </div>
        ${d.legend === false ? '' : `<div class="rc-legend">${legend.map(s =>
          `<span><i style="background:${s.color}"></i>${s.name} <b>${s.value}%</b></span>`).join('')}</div>`}
      `;

      const tip = el.querySelector('.rc-tip');
      const wrap = el.querySelector('.rc-svg-wrap');
      el.querySelectorAll('.rc-arc, .rc-seg').forEach((p) => {
        const s = hot[Number(p.dataset.i)];
        p.addEventListener('pointerenter', () => {
          tip.querySelector('.rc-tip-dot').style.background = s.color;
          tip.querySelector('.rc-tip-name').textContent = s.name;
          tip.querySelector('.rc-tip-val').textContent = s.value + '%';
          tip.style.opacity = '1';
        });
        p.addEventListener('pointermove', (ev) => {
          const b = wrap.getBoundingClientRect();
          tip.style.left = (ev.clientX - b.left + 12) + 'px';
          tip.style.top = (ev.clientY - b.top - 10) + 'px';
        });
        p.addEventListener('pointerleave', () => { tip.style.opacity = '0'; });
      });

      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.querySelectorAll('.rc-arc, .rc-seg').forEach((p) => { p.style.strokeDashoffset = '0'; });
      }));
      el.dispatchEvent(new CustomEvent('ring-chart:ready'));
    } catch (err) {
      console.error('[ring-chart] mount failed', err);
    }
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="ring-chart"]:not([data-mounted])');
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
