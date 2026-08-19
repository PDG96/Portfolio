/**
 * <node-graph>
 *
 * Columns of entity cards joined by curved connector lines — the pattern
 * behind both the Governance graph (members → aggregator → people) and a
 * linear chain (Supplier → Aggregator → Buyer). One component, configured
 * by the JSON payload. Auto-mounts on any element marked
 *   <div data-chart="node-graph" data-src="path/to/data.json"></div>
 *
 * Data contract, see ./data.json:
 *   { columns: [ { nodes: [ { id, title, sub, tone, icon, meta } ] } ],
 *     links:   [ { from, to, label } ] }
 *
 * tone: "mint" | "teal" | "pink" | "blue" — the left accent bar colour.
 * icon: "org" | "person" | "agg" — small glyph in the accent bar.
 * meta: optional small line under the title (e.g. an STK id).
 * links draw as soft curves in an SVG underlay; `label` renders as a
 * small count chip on the curve midpoint.
 *
 * Cards fade-slide in per column; lines draw after the cards settle.
 */

(function () {
  const TONES = {
    mint: '#9FE3C0', teal: '#7AD1C8', pink: '#F4B0C5', blue: '#A9CFF0',
  };
  const ICONS = {
    org: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5"/>',
    person: '<circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c1.2-3.2 3.6-4.8 6.5-4.8s5.3 1.6 6.5 4.8"/>',
    agg: '<circle cx="6" cy="6" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="12" cy="18" r="2.2"/><path d="M7.5 7.6 10.6 16M16.5 7.6 13.4 16"/>',
    pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/>',
  };
  const EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h5v5M19 5l-8 8"/><path d="M19 14v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5"/></svg>';
  const PERSON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="3.2"/><path d="M6 19.5c1.1-3 3.3-4.5 6-4.5s4.9 1.5 6 4.5"/></svg>';

  function ensureStyles() {
    if (document.getElementById('node-graph-styles')) return;
    const style = document.createElement('style');
    style.id = 'node-graph-styles';
    style.textContent = `
      [data-chart="node-graph"] {
        position: relative;
        width: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
      }
      .ng-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      /* dotted connector — the dots themselves march along the path */
      .ng-link {
        fill: none;
        stroke: rgba(20,20,20,0.28);
        stroke-width: 1.6;
        stroke-dasharray: 0.1 7;
        stroke-linecap: round;
        animation: ng-march 1.4s linear infinite;
      }
      @keyframes ng-march { to { stroke-dashoffset: -7.1; } }
      @media (prefers-reduced-motion: reduce) { .ng-link { animation: none; } }
      .ng-cols {
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        /* --ng-gap can be overridden by the host context; keeping columns
           close makes the connector lines read as relationships, not wires. */
        gap: var(--ng-gap, 56px);
        padding: 18px 6px;
        z-index: 1;
      }
      .ng-col { display: flex; flex-direction: column; gap: 18px; }
      .ng-node {
        display: flex;
        align-items: stretch;
        background: #ffffff;
        border: 1px solid rgba(20,20,20,0.10);
        border-radius: 10px;
        box-shadow: 0 4px 14px rgba(0,0,0,0.06);
        overflow: hidden;
        min-width: 150px;
        opacity: 0;
        transform: translateY(8px);
        transition: opacity 0.5s cubic-bezier(0.22,1,0.36,1), transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.25s;
      }
      .ng-node:hover { box-shadow: 0 8px 22px rgba(0,0,0,0.12); }
      .ng-accent {
        flex: none;
        width: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(20,20,20,0.6);
      }
      .ng-accent svg { width: 13px; height: 13px; }
      .ng-body { padding: 10px 14px 10px 12px; display: flex; flex-direction: column; gap: 2px; min-width: 0; flex: 1; }
      .ng-title { font-size: 11.5px; font-weight: 600; color: #141414; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .ng-sub { font-size: 9.5px; color: rgba(20,20,20,0.5); }
      /* header row with the entity type + external-link button (rich cards) */
      .ng-type {
        display: flex; align-items: center; gap: 6px;
        font-size: 9.5px; color: rgba(20,20,20,0.6);
        padding-bottom: 6px; margin-bottom: 6px;
        border-bottom: 1px solid rgba(20,20,20,0.07);
      }
      .ng-ext {
        margin-left: auto;
        flex: none;
        width: 18px; height: 18px;
        display: inline-flex; align-items: center; justify-content: center;
        border: 1px solid rgba(20,20,20,0.12);
        border-radius: 4px;
        background: #fff;
        color: rgba(20,20,20,0.45);
        cursor: pointer;
        padding: 0;
      }
      .ng-ext svg { width: 10px; height: 10px; }
      .ng-ext:hover { color: #141414; border-color: rgba(20,20,20,0.3); }
      .ng-slimrow { display: flex; align-items: center; gap: 10px; }
      .ng-id { font-size: 9.5px; color: rgba(20,20,20,0.45); }
      .ng-foot { display: flex; align-items: center; gap: 6px; margin-top: 7px; }
      .ng-flag { width: 16px; height: 16px; border-radius: 50%; display: block; }
      .ng-count {
        display: inline-flex; align-items: center; gap: 4px;
        border: 1px solid rgba(20,20,20,0.12);
        border-radius: 6px;
        padding: 1px 7px;
        font-size: 9.5px; font-weight: 600;
        color: rgba(20,20,20,0.6);
      }
      .ng-count svg { width: 10px; height: 10px; }
    `;
    document.head.appendChild(style);
  }

  async function mount(el) {
    const src = el.dataset.src;
    if (!src) { console.warn('[node-graph] missing data-src on', el); return; }
    try {
      const d = await fetch(src, { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + src);
        return r.json();
      });

      const accent = (n) => `
        <div class="ng-accent" style="background:${TONES[n.tone] || TONES.mint}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n.icon] || ICONS.org}</svg>
        </div>`;
      const renderNode = (n) => {
        const rich = n.type || n.flag || n.count != null || n.idLabel;
        if (!rich) {
          // slim card: accent bar · name · external-link button
          return `
            <div class="ng-node" data-id="${n.id}">
              ${accent(n)}
              <div class="ng-body"><div class="ng-slimrow">
                <span class="ng-title">${n.title}</span>
                <button class="ng-ext" aria-label="Open ${n.title}">${EXT}</button>
              </div>${n.sub ? `<span class="ng-sub">${n.sub}</span>` : ''}</div>
            </div>`;
        }
        return `
          <div class="ng-node" data-id="${n.id}">
            ${accent(n)}
            <div class="ng-body">
              ${n.type ? `<div class="ng-type"><span>${n.type}</span><button class="ng-ext" aria-label="Open ${n.title}">${EXT}</button></div>` : ''}
              <div class="ng-slimrow"><span class="ng-title">${n.title}</span>${n.type ? '' : `<button class="ng-ext" aria-label="Open ${n.title}">${EXT}</button>`}</div>
              ${n.idLabel ? `<span class="ng-id">${n.idLabel}</span>` : ''}
              ${(n.flag || n.count != null) ? `<div class="ng-foot">
                ${n.flag ? `<img class="ng-flag" src="${n.flag}" alt="">` : ''}
                ${n.count != null ? `<span class="ng-count">${PERSON}${n.count}</span>` : ''}
              </div>` : ''}
            </div>
          </div>`;
      };

      el.innerHTML = `
        <svg class="ng-svg"></svg>
        <div class="ng-cols">
          ${d.columns.map(col => `
            <div class="ng-col">
              ${col.nodes.map(renderNode).join('')}
            </div>`).join('')}
        </div>
      `;

      const draw = () => {
        const svg = el.querySelector('.ng-svg');
        const box = el.getBoundingClientRect();
        svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
        let paths = '';
        (d.links || []).forEach((lk) => {
          const a = el.querySelector(`.ng-node[data-id="${lk.from}"]`);
          const b = el.querySelector(`.ng-node[data-id="${lk.to}"]`);
          if (!a || !b) return;
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          const x0 = ra.right - box.left, y0 = ra.top + ra.height / 2 - box.top;
          const x1 = rb.left - box.left, y1 = rb.top + rb.height / 2 - box.top;
          const mx = (x0 + x1) / 2;
          paths += `<path class="ng-link" d="M ${x0} ${y0} C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}"/>`;
        });
        svg.innerHTML = paths;
      };

      requestAnimationFrame(() => requestAnimationFrame(() => {
        el.querySelectorAll('.ng-node').forEach((n, i) => {
          n.style.transitionDelay = (i * 60) + 'ms';
          n.style.opacity = '1';
          n.style.transform = 'none';
        });
        draw();
      }));
      if ('ResizeObserver' in window) new ResizeObserver(draw).observe(el);
      el.dispatchEvent(new CustomEvent('node-graph:ready'));
    } catch (err) {
      console.error('[node-graph] mount failed', err);
    }
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="node-graph"]:not([data-mounted])');
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
