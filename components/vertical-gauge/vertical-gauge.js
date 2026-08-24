/**
 * <vertical-gauge>
 *
 * A vertical pill-shaped scale with a gradient fill, configurable text
 * labels on the left, and a pointer + readout on the right showing the
 * current value. Generic enough for pH, salinity, soil moisture, any
 * "low to high" reading.
 *
 * Auto-mounts on every element marked
 *   <div data-chart="vertical-gauge" data-src="path/to/data.json"></div>
 *
 * Data contract:
 *   { min, max, value, valuePrefix, valueDecimals, valueColor,
 *     labels [{ text, position 0-1 }],
 *     gradient [{ stop 0-1, color }],
 *     caption { title, subtitle } }
 *
 * Motion: pointer rises from the bottom to its target, the value counts
 * up from `min` to `value` in parallel.
 */

(function () {
  function ensureStyles() {
    if (document.getElementById('vertical-gauge-styles')) return;
    const style = document.createElement('style');
    style.id = 'vertical-gauge-styles';
    style.textContent = `
      [data-chart="vertical-gauge"] {
        display: block;
        width: 100%;
      }
      .vg-root {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) var(--vg-bar-width, 64px) minmax(0, 1fr);
        column-gap: var(--vg-col-gap, 16px);
        align-items: stretch;
        height: 100%;
        min-height: 220px;
        width: 100%;
        max-width: var(--vg-max-width, 400px);
        margin: 0 auto;
      }
      .vg-labels {
        position: relative;
      }
      /* Labels read as axis ticks, same font/size/colour as the axes in
         the other charts in the library. */
      .vg-label {
        position: absolute;
        right: 0;
        bottom: var(--pos);
        transform: translateY(50%);
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-size: 11px;
        font-weight: 400;
        color: rgba(20, 20, 20, 0.55);
        white-space: nowrap;
      }
      .vg-bar {
        position: relative;
        width: var(--vg-bar-width, 64px);
        height: 100%;
        border-radius: 9999px;
        overflow: visible;
        /* Light empty-glass background, the fill rises over this. */
        background: #f5f5f5;
      }
      .vg-bar-fill {
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: var(--gauge-gradient, linear-gradient(to top, #FF8B6F, #FFE48A 50%, #9BBEEA));
        /* Liquid-fill effect, clip the gradient from the top so it rises
           up from the bottom of the bar. */
        clip-path: inset(100% 0 0 0);
        transition: clip-path 1.2s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .vg-bar-fill.is-filled { clip-path: inset(0 0 0 0); }

      .vg-pointer {
        position: absolute;
        left: 50%;
        bottom: 0%;
        transform: translate(-50%, 50%);
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--pointer-color, #1B989B);
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.96), 0 1px 6px rgba(0, 0, 0, 0.18);
        opacity: 0;
        /* easeOutBack so the pointer overshoots its target then settles,
           reading as a soft "drop into place" once it reaches the value. */
        transition:
          bottom 1.05s cubic-bezier(0.34, 1.56, 0.64, 1),
          opacity 0.35s ease-out;
        z-index: 2;
      }
      .vg-pointer.is-rising { opacity: 1; }

      .vg-readout {
        position: relative;
        height: 100%;
      }
      .vg-readout-row {
        position: absolute;
        left: 0;
        bottom: 0%;
        transform: translateY(50%);
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transition:
          opacity 0.35s ease-out,
          bottom 1.05s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .vg-readout-row.is-revealed { opacity: 1; }
      .vg-dash {
        flex: none;
        width: var(--vg-dash-width, 28px);
        height: 1px;
        background: repeating-linear-gradient(
          to right,
          rgba(20, 20, 20, 0.35) 0 4px,
          transparent 4px 8px
        );
      }
      .vg-value-text {
        display: flex;
        align-items: baseline;
        gap: 4px;
        color: var(--pointer-color, #1B989B);
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .vg-prefix, .vg-suffix {
        font-size: var(--vg-affix-size, 13px);
        font-weight: 500;
        opacity: 0.8;
      }
      .vg-band {
        font-size: var(--vg-band-size, 15px);
        font-weight: 600;
        letter-spacing: -0.01em;
      }
      .vg-value {
        font-size: var(--vg-value-size, 28px);
        font-weight: 600;
        letter-spacing: -0.02em;
      }

      /* Caption shares the same axis-style typography as the labels. */
      .vg-caption {
        margin-top: 14px;
        text-align: center;
        color: rgba(20, 20, 20, 0.55);
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF UI Display', 'Segoe UI', sans-serif;
        font-size: 11px;
        font-weight: 400;
        line-height: 1.4;
      }
      .vg-cap-title { }
      .vg-cap-sub {
        margin-top: 1px;
        font-variant-numeric: tabular-nums;
      }

      @media (prefers-reduced-motion: reduce) {
        .vg-pointer, .vg-readout-row, .vg-bar-fill { transition: none; }
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

  function formatNumber(value, decimals) {
    if (!Number.isFinite(value)) return '';
    return decimals != null ? value.toFixed(decimals) : String(value);
  }

  function buildGradientCss(stops) {
    if (!Array.isArray(stops) || !stops.length) return null;
    const sorted = [...stops].sort((a, b) => a.stop - b.stop);
    const css = sorted.map((s) => `${s.color} ${Math.round(s.stop * 100)}%`).join(', ');
    return `linear-gradient(to top, ${css})`;
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function countUp(el, from, to, decimals, duration = 1400) {
    const start = performance.now();
    function tick(now) {
      // See indicator-stack.js: clamp both ends, a negative t here sends
      // easeOutCubic (and the displayed number) to a huge garbage value.
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const current = from + (to - from) * easeOutCubic(t);
      el.textContent = formatNumber(current, decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = formatNumber(to, decimals);
    }
    el.textContent = formatNumber(from, decimals);
    requestAnimationFrame(tick);
    /* rAF is suspended while the tab is in the background, so a gauge that
       gets revealed there would sit frozen on its starting value -- which
       reads as a real reading of zero, not as an animation waiting. Timers
       still fire, so this lands the true number whatever happened above. */
    setTimeout(() => { el.textContent = formatNumber(to, decimals); }, duration + 250);
  }

  async function mount(el) {
    ensureStyles();
    const src = el.dataset.src;
    if (!src) {
      console.warn('[vertical-gauge] missing data-src on', el);
      return;
    }

    let payload;
    try {
      const r = await fetch(src, { cache: 'no-cache' });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      payload = await r.json();
    } catch (err) {
      console.error('[vertical-gauge] fetch failed', err);
      el.innerHTML = `<div style="padding:1rem;font-family:monospace;font-size:12px;color:#C7232C;">Failed to load gauge data.</div>`;
      return;
    }

    const min = typeof payload.min === 'number' ? payload.min : 0;
    const max = typeof payload.max === 'number' ? payload.max : 1;
    const value = typeof payload.value === 'number' ? payload.value : min;
    const pointerPos = max === min ? 0 : Math.max(0, Math.min(1, (value - min) / (max - min)));
    const pointerColor = payload.valueColor || '#1B989B';
    const valuePrefix = payload.valuePrefix || '';
    const valueSuffix = payload.valueSuffix || '';
    const decimals = typeof payload.valueDecimals === 'number' ? payload.valueDecimals : 0;

    /* readout: "band" names the zone the needle landed in -- Alkaline, Neutral,
       Acidic -- instead of repeating a number the scale already shows. The
       nearest label by position wins, so it needs no extra data. */
    const bandMode = payload.readout === 'band';
    const bandPos = (value - min) / ((max - min) || 1);
    const bandList = Array.isArray(payload.labels) ? payload.labels : [];
    const bandName = bandMode && bandList.length
      ? bandList.reduce((best, l) =>
          Math.abs(l.position - bandPos) < Math.abs(best.position - bandPos) ? l : best
        ).text
      : '';
    const gradientCss = buildGradientCss(payload.gradient) || 'linear-gradient(to top, #FF8B6F, #FFE48A 50%, #9BBEEA)';

    const labels = Array.isArray(payload.labels) ? payload.labels : [];
    const labelsHtml = labels.map((l) => `
      <span class="vg-label" style="--pos: ${Math.max(0, Math.min(1, l.position)) * 100}%">${escapeHtml(l.text)}</span>
    `).join('');

    const captionHtml = payload.caption ? `
      <div class="vg-caption">
        ${payload.caption.title ? `<div class="vg-cap-title">${escapeHtml(payload.caption.title)}</div>` : ''}
        ${payload.caption.subtitle ? `<div class="vg-cap-sub">${escapeHtml(payload.caption.subtitle)}</div>` : ''}
      </div>
    ` : '';

    el.innerHTML = `
      <div class="vg-root" style="--pointer-color: ${pointerColor};">
        <div class="vg-labels" aria-hidden="true">${labelsHtml}</div>
        <div class="vg-bar" aria-hidden="true">
          <span class="vg-bar-fill" style="background: ${gradientCss};"></span>
          <span class="vg-pointer" style="--pointer-pos: 0%"></span>
        </div>
        <div class="vg-readout" aria-label="${bandMode ? escapeHtml(bandName) : escapeHtml(valuePrefix) + ' ' + formatNumber(value, decimals) + escapeHtml(valueSuffix)}">
          <div class="vg-readout-row${bandMode ? ' vg-readout-row--band' : ''}" style="--pointer-pos: 0%">
            ${bandMode ? '' : '<span class="vg-dash"></span>'}
            <span class="vg-value-text">
              ${!bandMode && valuePrefix ? `<span class="vg-prefix">${escapeHtml(valuePrefix)}</span>` : ''}
              <!-- Rendered at the real reading rather than at the minimum. If
                   the count-up never runs (background tab, stalled rAF, a host
                   that never reports visibility) a gauge sitting on its minimum
                   reads as a genuine measurement of zero. countUp resets this
                   to the starting value itself the moment it begins. -->
              ${bandMode
                ? `<span class="vg-band">${escapeHtml(bandName)}</span>`
                : `<span class="vg-value">${formatNumber(value, decimals)}</span>` +
                  (valueSuffix ? `<span class="vg-suffix">${escapeHtml(valueSuffix)}</span>` : '')}
            </span>
          </div>
        </div>
      </div>
      ${captionHtml}
    `;

    const fillEl     = el.querySelector('.vg-bar-fill');
    const pointer    = el.querySelector('.vg-pointer');
    const readoutRow = el.querySelector('.vg-readout-row');
    const valueEl    = el.querySelector('.vg-value');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetPct = `${pointerPos * 100}%`;

    if (reduce) {
      // No motion, snap to final state
      fillEl.classList.add('is-filled');
      pointer.style.bottom = targetPct;
      readoutRow.style.bottom = targetPct;
      pointer.classList.add('is-rising');
      readoutRow.classList.add('is-revealed');
      valueEl.textContent = formatNumber(value, decimals);
    } else {
      // Phase 1, the bar fills up from the bottom (1200ms).
      requestAnimationFrame(() => {
        fillEl.classList.add('is-filled');
      });

      // Phase 2, after the fill is in, the pointer rises with a back-ease
      // overshoot, the readout line + value follow, and the number counts.
      const fillDuration = 1200;
      setTimeout(() => {
        pointer.style.bottom = targetPct;
        readoutRow.style.bottom = targetPct;
        pointer.classList.add('is-rising');
        readoutRow.classList.add('is-revealed');
        countUp(valueEl, min, value, decimals, 950);
      }, fillDuration - 50); // tiny overlap, feels less stop-and-go
    }

    el.dispatchEvent(new CustomEvent('vertical-gauge:ready', { detail: { value } }));
  }

  function init() {
    const targets = document.querySelectorAll('[data-chart="vertical-gauge"]:not([data-mounted])');
    if (!targets.length) return;

    // Inside an iframe, IntersectionObserver fires immediately because the
    // iframe's own viewport contains the gauge. The visitor often hasn't
    // scrolled the parent page to this section yet, so the animation
    // would burn before they could see it. Wait for a "bento:visible"
    // postMessage from the parent before mounting.
    const insideIframe = window !== window.top;

    if (insideIframe) {
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
      // Safety, mount after 5s even without a message (e.g. opened standalone)
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
    }, { rootMargin: '120px' });

    targets.forEach((el) => io.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Public remount API (used by the gallery's Replay button if needed)
  window.VerticalGauge = {
    remount(el) {
      delete el.dataset.mounted;
      el.innerHTML = '';
      mount(el);
    },
    remountAll() {
      document.querySelectorAll('[data-chart="vertical-gauge"]').forEach((el) => this.remount(el));
    },
  };
})();
