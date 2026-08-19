/**
 * <chart-card>
 *
 * Reusable card chrome for any chart in the library. Wrap any chart with
 *   <chart-card title="Salinity levels">
 *     <div data-chart="smooth-line" data-src="..." style="height:460px"></div>
 *   </chart-card>
 *
 * The component renders the white card with rounded corners, an SF-Pro
 * title on the left, and a full-width rule separating the header from the
 * chart body. Updating these styles here propagates to every chart that
 * uses <chart-card>, no per-chart HTML duplication.
 *
 * Load this script BEFORE any chart script so the DOM is restructured
 * before the chart's auto-mount queries for [data-chart="..."]. With
 * `defer` on both, document order is honoured.
 */

(function () {
  if (window.customElements && customElements.get('chart-card')) return;

  function ensureStyles() {
    if (document.getElementById('chart-card-styles')) return;
    const style = document.createElement('style');
    style.id = 'chart-card-styles';
    style.textContent = `
      chart-card {
        display: flex;
        flex-direction: column;
        background: #ffffff;
        border: 1px solid rgba(20, 20, 20, 0.10);
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
      }
      /* Body fills the leftover space, so when chart-card has a fixed
         height (e.g., a bento tile) the chart inside expands to use it. */
      chart-card .chart-card-body {
        flex: 1;
        min-height: 0;
        width: 100%;
      }
      chart-card .chart-card-header {
        display: flex;
        align-items: center;
        gap: 24px;
        /* Push the header edge-to-edge so its bottom rule spans the full card */
        margin: 0 -24px 24px;
        padding: 0 24px 24px;
        border-bottom: 1px solid rgba(20, 20, 20, 0.10);
      }
      chart-card .chart-card-header h2 {
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-weight: 500;
        font-size: 0.75rem;
        margin: 0;
        letter-spacing: -0.005em;
        color: #141414;
      }

      /* Right-aligned actions slot, hosts any number of buttons/links the
         author dropped in with slot="actions". */
      chart-card .chart-card-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
      }
      /* Optional built-in action button style. Use class="chart-card-action"
         on the slotted element for the standard look (square icon button or
         labelled pill), or override entirely with your own class. */
      chart-card .chart-card-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        height: 32px;
        min-width: 32px;
        padding: 0 8px;
        background: #ffffff;
        border: 1px solid rgba(20, 20, 20, 0.10);
        border-radius: 8px;
        color: rgba(20, 20, 20, 0.65);
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        text-decoration: none;
        transition: border-color 0.2s, color 0.2s, background 0.2s;
      }
      chart-card .chart-card-action:hover {
        border-color: rgba(20, 20, 20, 0.28);
        color: #141414;
        background: #fafafa;
      }
      chart-card .chart-card-action svg {
        width: 16px;
        height: 16px;
        flex: none;
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

  class ChartCard extends HTMLElement {
    connectedCallback() {
      if (this._upgraded) return;
      this._upgraded = true;
      ensureStyles();

      // Snapshot original children so we can re-slot them into the rebuilt
      // markup. Any element with slot="actions" goes to the right side of
      // the header, everything else falls into the body next to the chart.
      const original = Array.from(this.childNodes);
      const isElement = (n) => n.nodeType === 1;
      const isActionSlot = (n) => isElement(n) && n.getAttribute && n.getAttribute('slot') === 'actions';
      const actions = original.filter(isActionSlot);
      const bodyNodes = original.filter((n) => !actions.includes(n));

      const title = this.getAttribute('title') || '';
      const actionsHtml = actions.length ? '<div class="chart-card-actions"></div>' : '';

      this.innerHTML = `
        <div class="chart-card-header">
          <h2>${escapeHtml(title)}</h2>
          ${actionsHtml}
        </div>
        <div class="chart-card-body"></div>
      `;

      if (actions.length) {
        const slot = this.querySelector('.chart-card-actions');
        actions.forEach((n) => {
          n.removeAttribute('slot');
          slot.appendChild(n);
        });
      }
      const body = this.querySelector('.chart-card-body');
      bodyNodes.forEach((n) => body.appendChild(n));
    }

    static get observedAttributes() { return ['title']; }
    attributeChangedCallback(name, oldVal, newVal) {
      if (!this._upgraded) return;
      if (name === 'title') {
        const h2 = this.querySelector('.chart-card-header h2');
        if (h2) h2.textContent = newVal || '';
      }
    }
  }

  customElements.define('chart-card', ChartCard);
})();
