/**
 * <stacked-area>
 *
 * Auto-mounts a smooth stacked-area chart on every element marked
 *   <div data-chart="stacked-area" data-src="path/to/data.json"></div>
 *
 * The chart only renders once the host element scrolls near the viewport,
 * and the @antv/g2plot library itself is fetched once per page on first
 * mount, so dropping the component into a case study costs zero on the
 * initial paint.
 *
 * Data shape, see ./data.json. Long-format rows (one row per date+series)
 * with a top-level `series` array carrying the colour for each name and an
 * optional `opacity` for the area fill.
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
      console.warn('[stacked-area] missing data-src on', el);
      return;
    }

    let payload;
    try {
      const [G2Plot, json] = await Promise.all([
        loadG2Plot(),
        fetch(src, { cache: 'no-cache' }).then(r => {
          if (!r.ok) throw new Error('HTTP ' + r.status + ' on ' + src);
          return r.json();
        })
      ]);
      payload = json;

      // Cache colour lookup so the chart's color callback stays cheap
      const colorByName = Object.fromEntries(
        payload.series.map(s => [s.name, s.color])
      );
      const seriesOrder = payload.series.map(s => s.name);

      const chart = new G2Plot.Area(el, {
        data: payload.data,
        xField: 'date',
        yField: 'value',
        seriesField: 'series',
        isStack: true,
        smooth: true,
        // Stack so that Grievance Cases stays at the top, sliding above the
        // three teal series, which lets the orange read as a distinct band
        // rather than getting squashed against the baseline.
        meta: {
          series: { values: seriesOrder },
        },
        color: ({ series }) => colorByName[series] || '#999',
        areaStyle: {
          fillOpacity: typeof payload.opacity === 'number' ? payload.opacity : 0.7,
        },
        // No upper-edge line on any area, the fills alone read cleaner and
        // avoid the "some lines look thicker than others" artefact that
        // came from g2plot drawing strokes at the default width.
        line: false,
        point: false,
        // Light-mode palette, matches the Straatos case study background
        // (gray-true-25). All axis/grid colours stay neutral so the
        // four teal/orange series carry the chart's voice.
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
        },
        legend: false,
        tooltip: {
          shared: true,
          showTitle: false,
          showCrosshairs: true,
          showMarkers: true,
          // Same marker treatment as smooth-line + area-comparison, white
          // fill with the series colour as the stroke. Keeps tooltips
          // looking identical across the library.
          marker: (datum) => ({
            symbol: 'circle',
            fill: '#ffffff',
            stroke: colorByName[datum && datum.series] || '#999',
            lineWidth: 2,
            r: 4,
          }),
          crosshairs: { type: 'x', line: { style: { stroke: 'rgba(20,20,20,0.25)' } } },
          // Shared ChartTooltip markup, optional Total row from payload.showTotal
          customContent: (title, items) => {
            if (!window.ChartTooltip || !items || !items.length) return '';
            const ordered = seriesOrder
              .map((name) => items.find((it) => it.name === name))
              .filter(Boolean);
            let total = null;
            if (payload.showTotal) {
              const sum = ordered.reduce((acc, it) => acc + Number((it.data && it.data.value) || 0), 0);
              total = { name: payload.totalLabel || 'Total', value: String(sum) };
            }
            return window.ChartTooltip.render({
              rows: ordered.map((it) => ({
                color: it.color,
                name: it.name,
                value: String((it.data && it.data.value) ?? ''),
              })),
              total,
            });
          },
          domStyles: (window.ChartTooltip && window.ChartTooltip.domStyles) || undefined,
        },
        // g2plot's wave-in animates only the geometry (the area fills),
        // so axes, gridlines and legend snap in immediately while the four
        // areas sweep in from left to right as one continuous wipe.
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
      el.dispatchEvent(new CustomEvent('stacked-area:ready', { detail: { chart } }));
    } catch (err) {
      console.error('[stacked-area] mount failed', err);
      el.innerHTML = '<div style="padding:1rem;font-family:monospace;font-size:12px;color:#FF7A45;">Chart failed to load. Check the browser console.</div>';
    }
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="stacked-area"]:not([data-mounted])');
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
      // Old browsers, just mount everything immediately
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
