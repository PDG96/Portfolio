/**
 * ChartTooltip
 *
 * Shared tooltip renderer for every chart component in the library. Used
 * by smooth-line, stacked-area, area-comparison so the typography,
 * spacing, dot size and total-row treatment stay identical across the
 * whole portfolio.
 *
 * Each chart still owns its own data formatting + ordering, this just
 * locks down the visual contract:
 *
 *   ChartTooltip.render({
 *     title:    string?,           // optional bold heading (e.g. "Emissions Comparison")
 *     subtitle: string?,           // optional smaller line under the title (e.g. the x label)
 *     rows:     [{ color, name, value: string }],
 *     total:    { name: 'Total', value: string }?  // optional total row, divider above
 *   })
 *   -> string of HTML for g2plot's customContent
 *
 * Plus a ready-to-use domStyles object for g2plot tooltip config:
 *   tooltip: { domStyles: ChartTooltip.domStyles, ... }
 */

(function () {
  if (window.ChartTooltip) return;

  function ensureStyles() {
    if (document.getElementById('chart-tooltip-styles')) return;
    const style = document.createElement('style');
    style.id = 'chart-tooltip-styles';
    style.textContent = `
      .ct-tip {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .ct-tip-head { display: flex; flex-direction: column; gap: 1px; }
      .ct-tip-title {
        font-size: 9px;
        font-weight: 600;
        color: #141414;
        letter-spacing: -0.005em;
      }
      .ct-tip-subtitle {
        font-size: 8px;
        font-weight: 400;
        color: rgba(20, 20, 20, 0.55);
      }
      .ct-tip-rows {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ct-tip-row {
        display: grid;
        grid-template-columns: 7px 1fr auto;
        align-items: center;
        gap: 8px;
      }
      .ct-tip-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        display: inline-block;
      }
      .ct-tip-name {
        font-size: 9px;
        color: rgba(20, 20, 20, 0.78);
      }
      .ct-tip-val {
        font-size: 9px;
        font-weight: 500;
        color: #141414;
        font-variant-numeric: tabular-nums;
        padding-left: 16px;
        white-space: nowrap;
      }
      .ct-tip-total {
        display: grid;
        grid-template-columns: 7px 1fr auto;
        align-items: center;
        gap: 8px;
        padding-top: 6px;
        margin-top: 1px;
        border-top: 1px solid rgba(20, 20, 20, 0.08);
      }
      .ct-tip-total .ct-tip-name { color: #141414; font-weight: 500; }
      .ct-tip-total .ct-tip-val { font-weight: 600; }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderRow({ color, name, value }) {
    return `
      <div class="ct-tip-row">
        <span class="ct-tip-dot" style="background:${escapeHtml(color)};"></span>
        <span class="ct-tip-name">${escapeHtml(name)}</span>
        <span class="ct-tip-val">${escapeHtml(value)}</span>
      </div>
    `;
  }

  function render({ title, subtitle, rows, total } = {}) {
    ensureStyles();
    const head = (title || subtitle)
      ? `<div class="ct-tip-head">
          ${title ? `<div class="ct-tip-title">${escapeHtml(title)}</div>` : ''}
          ${subtitle ? `<div class="ct-tip-subtitle">${escapeHtml(subtitle)}</div>` : ''}
        </div>`
      : '';

    const rowsHtml = (rows || []).map(renderRow).join('');

    const totalHtml = total
      ? `<div class="ct-tip-total">
          <span></span>
          <span class="ct-tip-name">${escapeHtml(total.name || 'Total')}</span>
          <span class="ct-tip-val">${escapeHtml(total.value)}</span>
        </div>`
      : '';

    return `
      <div class="ct-tip">
        ${head}
        <div class="ct-tip-rows">${rowsHtml}</div>
        ${totalHtml}
      </div>
    `;
  }

  // g2plot tooltip domStyles, applied to the outer tooltip box. Dimensions
  // and typography reduced ~30% for a more discreet hover.
  const domStyles = {
    'g2-tooltip': {
      background: 'rgba(255, 255, 255, 0.97)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(20, 20, 20, 0.08)',
      borderRadius: '7px',
      color: '#141414',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif",
      fontSize: '9px',
      padding: '10px 11px',
      boxShadow: '0 13px 28px -12px rgba(0, 0, 0, 0.22)',
      minWidth: '168px',
    },
  };

  window.ChartTooltip = { render, domStyles };
})();
