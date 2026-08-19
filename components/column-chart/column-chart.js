/**
 * <column-chart>
 *
 * Compact vertical bar chart, hand-rolled SVG (no chart lib). Auto-mounts
 * on any element marked
 *   <div data-chart="column-chart" data-src="path/to/data.json"></div>
 *
 * Data contract, see ./data.json:
 *   { categories: ["Own", "Source 1", "Source 2", "Others"],
 *     values: [15, 10, 6, 3],
 *     color: "#E25E25",
 *     yMax: 20, yTicks: 5,
 *     name: "Subjects" }            // tooltip series name
 *
 * Bars grow from the baseline on mount; hovering a bar shows the shared
 * tooltip treatment (dot, name, value).
 */

(function () {
  function ensureStyles() {
    if (document.getElementById('column-chart-styles')) return;
    const style = document.createElement('style');
    style.id = 'column-chart-styles';
    style.textContent = `
      [data-chart="column-chart"] {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 170px;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
      }
      .cc-svg { display: block; width: 100%; height: 100%; }
      .cc-bar { transform: scaleY(0); transform-box: fill-box; transform-origin: bottom; transition: transform 0.9s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s; cursor: pointer; }
      .cc-svg:hover .cc-bar:not(:hover) { opacity: 0.55; }
      .cc-tip {
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
      .cc-tip-dot { width: 7px; height: 7px; border-radius: 50%; flex: none; }
      .cc-tip-name { color: rgba(20,20,20,0.6); }
      .cc-tip-val { font-weight: 600; }
    `;
    document.head.appendChild(style);
  }

  async function mount(el) {
    const src = el.dataset.src;
    if (!src) { console.warn('[column-chart] missing data-src on', el); return; }
    try {
      const d = await fetch(src, { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + src);
        return r.json();
      });
      // Draw at the host's real size (1:1, no scaling) so the bars always
      // fill the space the layout gives them — no dead space below.
      const W = Math.max(el.clientWidth, 200) || 280;
      const H = Math.max(el.clientHeight, 160) || 215;
      const padL = 30, padB = 24, padT = 6;
      const innerW = W - padL - 8, innerH = H - padT - padB;
      const yMax = d.yMax || Math.max(...d.values) * 1.2;
      const ticks = d.yTicks || 4;
      const color = d.color || '#E25E25';
      const n = d.values.length;
      const slot = innerW / n;
      const barW = Math.min(34, slot * 0.5);

      let grid = '', bars = '', labels = '';
      for (let t = 0; t <= ticks; t++) {
        const y = padT + innerH - (innerH * t / ticks);
        const v = Math.round(yMax * t / ticks);
        grid += `<line x1="${padL}" y1="${y}" x2="${W - 8}" y2="${y}" stroke="rgba(20,20,20,0.08)" stroke-dasharray="3 4"/>`;
        grid += `<text x="${padL - 7}" y="${y + 3.5}" text-anchor="end" font-size="9" fill="rgba(20,20,20,0.55)">${v}</text>`;
      }
      d.values.forEach((v, i) => {
        const h = innerH * (v / yMax);
        const x = padL + slot * i + (slot - barW) / 2;
        const y = padT + innerH - h;
        bars += `<rect class="cc-bar" data-i="${i}" x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${color}"/>`;
        labels += `<text x="${x + barW / 2}" y="${H - 9}" text-anchor="middle" font-size="9" fill="rgba(20,20,20,0.55)">${d.categories[i]}</text>`;
      });

      el.innerHTML = `
        <svg class="cc-svg" viewBox="0 0 ${W} ${H}">${grid}${bars}${labels}</svg>
        <div class="cc-tip" role="tooltip">
          <span class="cc-tip-dot" style="background:${color}"></span>
          <span class="cc-tip-name"></span><span class="cc-tip-val"></span>
        </div>
      `;

      const tip = el.querySelector('.cc-tip');
      el.querySelectorAll('.cc-bar').forEach((b) => {
        const i = Number(b.dataset.i);
        b.addEventListener('pointerenter', () => {
          tip.querySelector('.cc-tip-name').textContent = d.name || d.categories[i];
          tip.querySelector('.cc-tip-val').textContent = d.values[i];
          tip.style.opacity = '1';
        });
        b.addEventListener('pointermove', (ev) => {
          const r = el.getBoundingClientRect();
          tip.style.left = (ev.clientX - r.left + 12) + 'px';
          tip.style.top = (ev.clientY - r.top - 10) + 'px';
        });
        b.addEventListener('pointerleave', () => { tip.style.opacity = '0'; });
      });

      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.querySelectorAll('.cc-bar').forEach((b, i) => {
          b.style.transitionDelay = (i * 70) + 'ms';
          b.style.transform = 'scaleY(1)';
        });
      }));
      el.dispatchEvent(new CustomEvent('column-chart:ready'));
    } catch (err) {
      console.error('[column-chart] mount failed', err);
    }
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="column-chart"]:not([data-mounted])');
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
