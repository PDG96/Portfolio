/**
 * <area-comparison>
 *
 * Multi-series area chart where each series can independently choose:
 *   - dashed or solid line
 *   - fill opacity 0 (line only) or > 0 (filled area)
 *
 * That mix lets you express "design vs actual vs projected" patterns:
 *   - Design,    dashed line,         no fill, full timeline
 *   - Actual,    solid line,          filled area, past portion
 *   - Projected, dashed line,         no fill, future portion (shares the
 *                                              hand-off point with Actual)
 *
 * Auto-mounts on every element marked
 *   <div data-chart="area-comparison" data-src="path/to/data.json"></div>
 *
 * Data contract, see ./data.json.
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

  function formatNumber(value, opts) {
    if (value === null || value === undefined) return '';
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    const decimals = typeof opts.valueDecimals === 'number' ? opts.valueDecimals : 0;
    const thousands = opts.thousandsSeparator || '';
    const decimal   = opts.decimalSeparator || '.';
    const fixed = num.toFixed(decimals);
    const [intRaw, decRaw] = fixed.split('.');
    const intStr = thousands ? intRaw.replace(/\B(?=(\d{3})+(?!\d))/g, thousands) : intRaw;
    return decRaw !== undefined ? `${intStr}${decimal}${decRaw}` : intStr;
  }

  async function mount(el) {
    const src = el.dataset.src;
    if (!src) {
      console.warn('[area-comparison] missing data-src on', el);
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

      const colorByName    = Object.fromEntries(payload.series.map(s => [s.name, s.color]));
      const dashedByName   = Object.fromEntries(payload.series.map(s => [s.name, Boolean(s.dashed)]));
      const fillByName     = Object.fromEntries(payload.series.map(s => [s.name, typeof s.fillOpacity === 'number' ? s.fillOpacity : 0.3]));
      const seriesOrder    = payload.series.map(s => s.name);

      const unit = payload.unit || '';
      const numberOpts = {
        valueDecimals: payload.valueDecimals,
        thousandsSeparator: payload.thousandsSeparator,
        decimalSeparator: payload.decimalSeparator,
      };
      function formatValue(v) {
        const formatted = formatNumber(v, numberOpts);
        return unit ? `${formatted} ${unit}` : formatted;
      }

      const chart = new G2Plot.Area(el, {
        data: payload.data,
        xField: 'year',
        yField: 'value',
        seriesField: 'series',
        isStack: false,
        smooth: false,
        color: ({ series }) => colorByName[series] || '#999',
        // Solid for Actual, dashed for Design + Projected. The lineDash
        // callback receives a "datum" but g2plot picks the FIRST item per
        // series at draw time, so reading datum.series is reliable.
        lineStyle: ({ series }) => {
          const dashed = dashedByName[series];
          return {
            lineWidth: payload.lineWidth || 2,
            stroke: colorByName[series] || '#999',
            lineDash: dashed ? [5, 4] : undefined,
            lineCap: 'round',
          };
        },
        // Per-series fill opacity, 0 turns the area into a line-only series
        areaStyle: ({ series }) => ({
          fill: colorByName[series] || '#999',
          fillOpacity: fillByName[series],
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
          },
          line: { style: { stroke: 'rgba(20,20,20,0.12)' } },
          tickLine: null,
        },
        yAxis: {
          min: typeof payload.yMin === 'number' ? payload.yMin : 0,
          max: typeof payload.yMax === 'number' ? payload.yMax : undefined,
          tickInterval: typeof payload.yTickInterval === 'number' ? payload.yTickInterval : undefined,
          label: {
            style: {
              fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif",
              fontSize: 11,
              fill: 'rgba(20,20,20,0.55)',
            },
            formatter: (v) => formatNumber(v, { thousandsSeparator: payload.thousandsSeparator }),
          },
          grid: {
            line: { style: { stroke: 'rgba(20,20,20,0.08)', lineDash: [3, 4] } },
          },
        },
        legend: false,
        tooltip: {
          shared: true,
          showCrosshairs: true,
          showMarkers: true,
          // White-filled circle with the series colour as the stroke, so
          // each hover dot reads as "the marker of THIS line".
          marker: (datum) => ({
            symbol: 'circle',
            fill: '#ffffff',
            stroke: colorByName[datum && datum.series] || '#999',
            lineWidth: 2,
            r: 4,
          }),
          crosshairs: { type: 'x', line: { style: { stroke: 'rgba(20,20,20,0.20)' } } },
          customContent: (title, items) => {
            if (!window.ChartTooltip || !items || !items.length) return '';
            const ordered = seriesOrder
              .map((name) => items.find((it) => it.name === name))
              .filter(Boolean);
            return window.ChartTooltip.render({
              title: payload.tooltipTitle || 'Emissions Comparison',
              subtitle: title || '',
              rows: ordered.map((it) => ({
                color: it.color,
                name: it.name,
                value: formatValue(it.data && it.data.value),
              })),
            });
          },
          domStyles: (window.ChartTooltip && window.ChartTooltip.domStyles) || undefined,
        },
        animation: {
          appear: {
            animation: 'wave-in',
            duration: 1800,
            easing: 'easeQuadOut',
          },
        },
      });

      chart.render();
      el._chart = chart;
      el.dispatchEvent(new CustomEvent('area-comparison:ready', { detail: { chart } }));
    } catch (err) {
      console.error('[area-comparison] mount failed', err);
      el.innerHTML = '<div style="padding:1rem;font-family:monospace;font-size:12px;color:#FF7A45;">Chart failed to load. Check the browser console.</div>';
    }
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="area-comparison"]:not([data-mounted])');
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
    }, { rootMargin: '160px' });

    targets.forEach((el) => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
