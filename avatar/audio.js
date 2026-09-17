// Sons procedurais (Web Audio): chuva, água (plop dos anéis) e grama (farfalhar).
// Nada baixado: tudo ruído filtrado e osciladores. Começa só depois de um gesto do usuário.
export function createAudio() {
  let ctx = null, master = null, rainGain = null, rainSrc = null, rustleGain = null, rustleFilter = null, waterGain = null, waterLP = null;
  let waterTarget = 0, waterNow = 0;
  let enabled = false, rainLevel = 0, rustleTarget = 0, rustleNow = 0;

  function noiseBuffer(seconds = 2) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < d.length; i++) {                       // ruído rosa (mais natural que branco)
      const w = Math.random() * 2 - 1;
      b0 = 0.99765 * b0 + w * 0.099;
      b1 = 0.963 * b1 + w * 0.2965;
      b2 = 0.57 * b2 + w * 1.0526;
      d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.11;
    }
    return buf;
  }

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination);

    // chuva: ruído rosa → passa-banda largo + leve modulação, loop
    rainSrc = ctx.createBufferSource(); rainSrc.buffer = noiseBuffer(4); rainSrc.loop = true;
    const rainHP = ctx.createBiquadFilter(); rainHP.type = 'highpass'; rainHP.frequency.value = 900;
    const rainLP = ctx.createBiquadFilter(); rainLP.type = 'lowpass'; rainLP.frequency.value = 6500;
    rainGain = ctx.createGain(); rainGain.gain.value = 0;
    rainSrc.connect(rainHP); rainHP.connect(rainLP); rainLP.connect(rainGain); rainGain.connect(master);
    rainSrc.start();

    // grama: ruído rosa agudo, volume segue o movimento do mouse
    const rs = ctx.createBufferSource(); rs.buffer = noiseBuffer(3); rs.loop = true;
    rustleFilter = ctx.createBiquadFilter(); rustleFilter.type = 'bandpass'; rustleFilter.frequency.value = 3200; rustleFilter.Q.value = 0.7;
    rustleGain = ctx.createGain(); rustleGain.gain.value = 0;
    rs.connect(rustleFilter); rustleFilter.connect(rustleGain); rustleGain.connect(master);
    rs.start();

    // água: ruído rosa bem grave em loop, com o filtro oscilando devagar (marola); volume segue o mouse
    const ws = ctx.createBufferSource(); ws.buffer = noiseBuffer(5); ws.loop = true;
    waterLP = ctx.createBiquadFilter(); waterLP.type = 'lowpass'; waterLP.frequency.value = 420; waterLP.Q.value = 0.9;
    const waterBP = ctx.createBiquadFilter(); waterBP.type = 'bandpass'; waterBP.frequency.value = 260; waterBP.Q.value = 0.5;
    waterGain = ctx.createGain(); waterGain.gain.value = 0;
    ws.connect(waterLP); waterLP.connect(waterBP); waterBP.connect(waterGain); waterGain.connect(master);
    ws.start();
    const lfo = ctx.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 0.35;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 140;
    lfo.connect(lfoGain); lfoGain.connect(waterLP.frequency); lfo.start();

    setInterval(() => {                                        // suaviza o farfalhar
      if (!ctx) return;
      rustleNow += (rustleTarget - rustleNow) * 0.35;
      rustleTarget *= 0.6;                                     // decai sozinho se o mouse parar
      rustleGain.gain.setTargetAtTime(enabled ? rustleNow * 0.09 : 0, ctx.currentTime, 0.05);
      rustleFilter.frequency.setTargetAtTime(2600 + rustleNow * 1800, ctx.currentTime, 0.1);
      waterNow += (waterTarget - waterNow) * 0.18;              // a água responde mais devagar, mais fluida
      waterTarget *= 0.75;
      waterGain.gain.setTargetAtTime(enabled ? waterNow * 0.08 : 0, ctx.currentTime, 0.12);   // fundo grave, bem baixo
      // bolhinhas: o que dá a textura de água. Quantidade proporcional ao movimento.
      if (enabled && waterNow > 0.03) {
        const n = Math.floor(waterNow * 4 + Math.random() * 1.2);
        for (let i = 0; i < n; i++) bubble(waterNow, Math.random() * 0.06);
      }
    }, 60);
  }

  function bubble(level, delay) {
    const t = ctx.currentTime + delay;
    const o = ctx.createOscillator(); o.type = 'sine';
    const f0 = 350 + Math.random() * Math.random() * 1600;        // mais bolhas graves, poucas agudas
    const dur = 0.035 + Math.random() * 0.07;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f0 * (1.12 + Math.random() * 0.25), t + dur);   // bolha sobe de tom
    const g = ctx.createGain();
    const v = (0.004 + Math.random() * 0.009) * (0.4 + level);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0003, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.01);
  }

  function plop(strength = 1) {                             // mouse ou pingo mexeu na água: só alimenta o som contínuo
    waterTarget = Math.max(waterTarget, Math.min(1, strength));
  }

  function rustle(speed) {                                     // speed 0..1
    rustleTarget = Math.max(rustleTarget, Math.min(1, speed));
  }

  function setRain(level) {
    rainLevel = level;
    if (ctx) rainGain.gain.setTargetAtTime(enabled ? level * 0.22 : 0, ctx.currentTime, 0.8);
  }

  async function setEnabled(on) {
    enabled = on;
    if (on) { init(); if (ctx.state === 'suspended') await ctx.resume(); }
    if (ctx) rainGain.gain.setTargetAtTime(on ? rainLevel * 0.22 : 0, ctx.currentTime, 0.4);
  }

  return { setEnabled, setRain, plop, rustle, get enabled() { return enabled; } };
}
