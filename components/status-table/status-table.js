/**
 * <status-table>
 *
 * Data table with optional status-icon column, search box, and row hover.
 * Powers both the Compliance table (status icons + hover explanations) and
 * the Governance table (plain columns + kebab) in the KOTA screen — one
 * component, configured by the JSON payload. Auto-mounts on any element
 * marked
 *   <div data-chart="status-table" data-src="path/to/data.json"></div>
 *
 * Data contract, see ./data.json:
 *   { search: true,                         // renders a search input that filters rows
 *     kebab: true,                          // trailing ⋮ column
 *     status: {                             // optional leading status column
 *       ok:    { label: "Compliant",     desc: "…" },
 *       warn:  { label: "Undetermined",  desc: "…" },
 *       bad:   { label: "Not Compliant", desc: "…" } },
 *     columns: [ { key, label, width } ],
 *     rows:    [ { _status: "ok", col1: "…", col2: "…" } ] }
 *
 * Hovering a status icon opens a tooltip with the status label + desc —
 * the three balloons from the original screen, as live UI.
 */

(function () {
  const STATUS_STYLE = {
    ok:   { color: '#3E9B5F', bg: 'rgba(111,204,140,0.18)', glyph: '<path d="M5 12.5l4.2 4.2L19 7"/>' },
    warn: { color: '#C98A2D', bg: 'rgba(240,168,100,0.20)', glyph: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>' },
    bad:  { color: '#C0392B', bg: 'rgba(226,87,74,0.16)',  glyph: '<path d="M12 4 2.8 19.5h18.4z"/><path d="M12 10v4M12 16.8v.4"/>' },
  };

  function ensureStyles() {
    if (document.getElementById('status-table-styles')) return;
    const style = document.createElement('style');
    style.id = 'status-table-styles';
    style.textContent = `
      [data-chart="status-table"] {
        position: relative;
        width: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-size: 11.5px;
        color: #141414;
      }
      .st-search {
        display: flex;
        align-items: center;
        gap: 8px;
        border: 1px solid rgba(20,20,20,0.12);
        border-radius: 8px;
        padding: 7px 11px;
        margin-bottom: 12px;
        color: rgba(20,20,20,0.4);
      }
      .st-search svg { width: 13px; height: 13px; flex: none; }
      .st-search input {
        border: 0; outline: 0; flex: 1; font: inherit; color: #141414; background: transparent;
      }
      .st-scroll { width: 100%; overflow-x: auto; }
      .st-table { width: 100%; border-collapse: collapse; }
      .st-table th {
        text-align: left;
        font-size: 10px;
        font-weight: 600;
        color: rgba(20,20,20,0.55);
        background: rgba(20,20,20,0.035);
        padding: 8px 10px;
        white-space: nowrap;
      }
      .st-table td {
        padding: 9px 10px;
        border-top: 1px solid rgba(20,20,20,0.07);
        color: rgba(20,20,20,0.8);
        white-space: nowrap;
      }
      .st-table tbody tr { transition: background 0.15s; }
      .st-table tbody tr:hover { background: rgba(226,94,37,0.05); }
      .st-ico {
        position: relative;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 22px; height: 22px;
        border-radius: 6px;
        cursor: pointer;
      }
      .st-ico svg { width: 13px; height: 13px; }
      .st-kebab { color: rgba(20,20,20,0.45); letter-spacing: 1px; text-align: center; cursor: pointer; }
      .st-tip {
        position: absolute;
        max-width: 230px;
        background: #ffffff;
        border: 1px solid rgba(20,20,20,0.10);
        border-radius: 10px;
        box-shadow: 0 10px 28px rgba(0,0,0,0.14);
        padding: 10px 12px;
        z-index: 6;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s;
        white-space: normal;
      }
      .st-tip-label { display: block; font-size: 11px; font-weight: 600; margin-bottom: 3px; }
      .st-tip-desc { font-size: 10.5px; line-height: 1.5; color: rgba(20,20,20,0.6); }
    `;
    document.head.appendChild(style);
  }

  async function mount(el) {
    const src = el.dataset.src;
    if (!src) { console.warn('[status-table] missing data-src on', el); return; }
    try {
      const d = await fetch(src, { cache: 'no-cache' }).then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + src);
        return r.json();
      });

      const head =
        (d.status ? '<th style="width:34px"></th>' : '') +
        d.columns.map(c => `<th${c.width ? ` style="width:${c.width}"` : ''}>${c.label}</th>`).join('') +
        (d.kebab ? '<th style="width:30px"></th>' : '');

      const body = d.rows.map(row => {
        const s = row._status && STATUS_STYLE[row._status];
        return `<tr>
          ${d.status ? `<td>${s ? `<span class="st-ico" data-status="${row._status}" style="background:${s.bg};color:${s.color}" tabindex="0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${s.glyph}</svg></span>` : ''}</td>` : ''}
          ${d.columns.map(c => `<td>${row[c.key] ?? ''}</td>`).join('')}
          ${d.kebab ? '<td class="st-kebab">⋮</td>' : ''}
        </tr>`;
      }).join('');

      el.innerHTML = `
        ${d.search ? `<label class="st-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>
          <input type="search" placeholder="${d.searchPlaceholder || 'Search'}" aria-label="Search table">
        </label>` : ''}
        <div class="st-scroll"><table class="st-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>
        <div class="st-tip" role="tooltip"><span class="st-tip-label"></span><span class="st-tip-desc"></span></div>
      `;

      // status tooltips
      const tip = el.querySelector('.st-tip');
      el.querySelectorAll('.st-ico').forEach((ico) => {
        const conf = d.status[ico.dataset.status];
        const s = STATUS_STYLE[ico.dataset.status];
        const show = () => {
          tip.querySelector('.st-tip-label').textContent = conf.label;
          tip.querySelector('.st-tip-label').style.color = s.color;
          tip.querySelector('.st-tip-desc').textContent = conf.desc || '';
          const er = el.getBoundingClientRect(), ir = ico.getBoundingClientRect();
          tip.style.left = Math.max(0, ir.left - er.left + 26) + 'px';
          tip.style.top = (ir.top - er.top - 6) + 'px';
          tip.style.opacity = '1';
        };
        const hide = () => { tip.style.opacity = '0'; };
        ico.addEventListener('pointerenter', show);
        ico.addEventListener('focus', show);
        ico.addEventListener('pointerleave', hide);
        ico.addEventListener('blur', hide);
      });

      // live search filter
      const input = el.querySelector('.st-search input');
      if (input) {
        const trs = Array.from(el.querySelectorAll('tbody tr'));
        input.addEventListener('input', () => {
          const q = input.value.trim().toLowerCase();
          trs.forEach((tr) => {
            tr.style.display = !q || tr.textContent.toLowerCase().includes(q) ? '' : 'none';
          });
        });
      }
      el.dispatchEvent(new CustomEvent('status-table:ready'));
    } catch (err) {
      console.error('[status-table] mount failed', err);
    }
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="status-table"]:not([data-mounted])');
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
