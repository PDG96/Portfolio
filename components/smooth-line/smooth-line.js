/**
 * <smooth-line>
 *
 * Auto-mounts a multi-series smooth line chart on every element marked
 *   <div data-chart="smooth-line" data-src="path/to/data.json"></div>
 *
 * Built on top of @antv/g2plot, lazy-loaded from CDN on first viewport
 * intersect (shared with the stacked-area component, so the library
 * downloads only once per page even if both charts are present).
 *
 * Data contract, see ./data.json. Long-format rows (date+series+value)
 * with a top-level `series` array carrying each line's colour.
 */

(function () {
  const G2PLOT_CDN = 'https://unpkg.com/@antv/g2plot@2.4.32/dist/g2plot.min.js';
  let g2plotPromise = null;

  function loadG2Plot() {
    if (window.G2Plot) return Promise.resolve(window.G2Plot);
    if (g2plotPromise) return g2plotPromise;
    g2plotPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = G2PLOT_CDN;
      s.async = true;
      s.onload = () => window.G2Plot ? resolve(window.G2Plot) : reject(new Error('G2Plot not on window after load'));
      s.onerror = () => reject(new Error('Failed to load g2plot from ' + G2PLOT_CDN));
      document.head.appendChild(s);
    });
    return g2plotPromise;
  }

  async function mount(el) {
    const src = el.dataset.src;
    if (!src) {
      console.warn('[smooth-line] missing data-src on', el);
      return;
    }

    try {
      const [G2Plot, payload] = await Promise.all([
        loadG2Plot(),
        fetch(src, { cache: 'no-cache' }).then(r => {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + src);
          return r.json();
        }),
      ]);

      const colorByName = Object.fromEntries(
        payload.series.map(s => [s.name, s.color])
      );
      const seriesOrder = payload.series.map(s => s.name);

      // Locale-aware value formatter, integers stay integers, decimals get
      // the configured separator (defaults to "."), and the unit is appended
      // if the data payload declared one.
      const unit = payload.unit || '';
      const decimalSeparator = payload.decimalSeparator || '.';
      const valueDecimals = typeof payload.valueDecimals === 'number' ? payload.valueDecimals : 1;
      function formatValue(v) {
        if (v === null || v === undefined) return '';
        const num = Number(v);
        if (!Number.isFinite(num)) return String(v);
        const isInt = Number.isInteger(num);
        const str = isInt ? String(num) : num.toFixed(valueDecimals).replace('.', decimalSeparator);
        return unit ? `${str} ${unit}` : str;
      }

      const chart = new G2Plot.Line(el, {
        data: payload.data,
        xField: 'date',
        yField: 'value',
        seriesField: 'series',
        smooth: true,
        color: ({ series }) => colorByName[series] || '#999',
        lineStyle: ({ series }) => ({
          lineWidth: payload.lineWidth || 2,
          stroke: colorByName[series] || '#999',
        }),
        point: false,
        meta: {
          series: { values: seriesOrder },
        },
        xAxis: {
          label: {
            style: {
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif",
              fontSize: 11,
              fill: 'rgba(20,20,20,0.55)',
            },
            formatter: (v) => {
              const [y, m] = String(v).split('-');
              if (!m) return v;
              const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
              return months[parseInt(m, 10) - 1] + ' ' + y.slice(2);
            },
          },
          line: { style: { stroke: 'rgba(20,20,20,0.12)' } },
          tickLine: null,
        },
        yAxis: {
          min: typeof payload.yMin === 'number' ? payload.yMin : 0,
          max: typeof payload.yMax === 'number' ? payload.yMax : undefined,
          label: {
            style: {
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif",
              fontSize: 11,
              fill: 'rgba(20,20,20,0.55)',
            },
          },
          grid: {
            line: { style: { stroke: 'rgba(20,20,20,0.08)', lineDash: [3, 4] } },
          },
          // Tick spacing tuned for integer-step Y axes (Salinity 0-16 etc.)
          tickInterval: typeof payload.yTickInterval === 'number' ? payload.yTickInterval : undefined,
        },
        legend: false,
        tooltip: {
          shared: true,
          showTitle: false,
          showCrosshairs: true,
          showMarkers: true,
          marker: (datum) => ({
            symbol: 'circle',
            fill: '#ffffff',
            stroke: colorByName[datum && datum.series] || '#999',
            lineWidth: 2,
            r: 4,
          }),
          crosshairs: { type: 'x', line: { style: { stroke: 'rgba(20,20,20,0.25)' } } },
          // Tooltip markup + styling delegated to the shared ChartTooltip
          // module, see components/chart-tooltip/chart-tooltip.js.
          customContent: (title, items) => {
            if (!window.ChartTooltip || !items || !items.length) return '';
            const ordered = seriesOrder
              .map((name) => items.find((it) => it.name === name))
              .filter(Boolean);
            return window.ChartTooltip.render({
              rows: ordered.map((it) => ({
                color: it.color,
                name: it.name,
                value: formatValue(it.data && it.data.value),
              })),
            });
          },
          domStyles: (window.ChartTooltip && window.ChartTooltip.domStyles) || undefined,
        },
        // wave-in draws the lines from left to right while axes/gridlines
        // appear instantly, same cadence as the stacked-area component
        // for visual consistency across the library.
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 1700,
            easing: 'easeQuadOut',
          },
        },
      });

      chart.render();
      el._chart = chart;
      el.dispatchEvent(new CustomEvent('smooth-line:ready', { detail: { chart } }));
    } catch (err) {
      console.error('[smooth-line] mount failed', err);
      el.innerHTML = '<div style="padding:1rem;font-family:monospace;font-size:12px;color:#FF7A45;">Chart failed to load. Check the browser console.</div>';
    }
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="smooth-line"]:not([data-mounted])');
    if (!targets.length) return;

    // Inside an iframe, wait for the parent to confirm the iframe is on
    // screen before mounting so the wave-in animation runs at the right
    // moment, not on iframe load.
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
