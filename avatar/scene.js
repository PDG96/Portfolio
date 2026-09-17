import * as THREE from 'three/webgpu';
import {
  Fn, uniform, float, vec3, instancedArray, instanceIndex, uv, positionGeometry, positionWorld,
  sin, cos, pow, smoothstep, mix, sqrt, select, hash, time, deltaTime, PI, mx_noise_float,
  vec2, vec4, uniformArray, cameraPosition, normalize, dot, exp, max, min, abs, length,
  texture, normalMap, positionLocal, vertexColor, normalView, attribute,
} from 'three/tsl';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

export async function createScene(opts = {}) {

  const err = document.getElementById('err') || { textContent: '' };
  window.addEventListener('error', e => err.textContent += e.message + '\n');
  window.addEventListener('unhandledrejection', e => err.textContent += (e.reason?.message || e.reason) + '\n');

  // ---------------------------------------------------------------- parâmetros (ref: Omma Digital Oasis)
  // perfil de qualidade: celular (toque + tela estreita) roda com menos folhas/pixels/malha; ?quality=low|high força
  const qParam = new URLSearchParams(location.search).get('quality');
  const LOW = qParam ? qParam === 'low' : (opts.quality === 'low' || (matchMedia('(pointer: coarse)').matches && Math.min(innerWidth, innerHeight) < 900));
  const BLADE_COUNT = LOW ? 60000 : 300000;
  const GRID = Math.ceil(Math.sqrt(BLADE_COUNT));   // 548² ≈ 300k posições; 300² = 90k
  const FIELD_SIZE = 28;
  const DOME = { radius: 10.5, height: 1.6 };   // ilha em domo: altura no centro, zero na borda
  const domeY = r => DOME.height * Math.max(0, 1 - (r / DOME.radius) ** 2);
  const groundYAt = r => r <= DOME.radius ? domeY(r) : -2.2 * Math.pow((r - DOME.radius) / 7.0, 1.8);   // igual ao islandY do shader

  const P = {
    windSpeed: 1.3, windAmplitude: 0.21,
    bladeWidth: LOW ? 7.5 : 4.0, bladeTipWidth: 0.28, bladeHeight: 0.92, bladeHeightVariation: 0.5, bladeLean: 0.9,   // celular: menos folhas, mais largas
    noiseAmplitude: 1.85, noiseFrequency: 0.3, noise2Amplitude: 0.2, noise2Frequency: 15,
    mouseRadius: 2.2, mouseStrength: 3.0, outerRadius: 3.6, outerStrength: 1.0,
    fogStart: 16.0, fogEnd: 34.0, fogIntensity: 0.0,
    colorVariation: 0.7, groundRadius: 9.5, groundFalloff: 3.0,
  };
  // fundo claro: fim de tarde pastel (lavanda no alto, pêssego no horizonte)
  const SKY = { top: '#aeb8ea', midHigh: '#c9c2ee', midLow: '#e2c9ea', glow: '#f4c8c8', horizon: '#ffd7b4', below: '#ece3f2' };
  const COLORS = {
    background: '#ece3f2', ground: '#33661f', fog: '#e2c9ea',
    bladeBase: '#2c5a1c', mid: '#4f8f2a', bladeTip: '#b7d65a', goldenTip: '#cfe27a', greenTip: '#8cc44a',
  };

  // ---------------------------------------------------------------- paletas por hora do dia
  const PALETTES = {
    day:   { top: '#7ea6ee', midHigh: '#a6c2f2', midLow: '#c6d8f3', glow: '#e4e6ee', horizon: '#f3ebe0', below: '#dfe4ee' },
    dusk:  { top: '#4d4f9e', midHigh: '#8468bd', midLow: '#c684ad', glow: '#f09a78', horizon: '#ffc784', below: '#b99ac0' },   // pôr do sol
    dawn:  { top: '#a9b9ea', midHigh: '#c9c3ec', midLow: '#e4cfe6', glow: '#f8d0c4', horizon: '#ffe0bc', below: '#e6e0ee' },
    night: { top: '#0e1330', midHigh: '#1c2250', midLow: '#312c66', glow: '#4e4380', horizon: '#6a5787', below: '#232042' },
  };
  const ENV = { weights: { day: 0, dusk: 1, dawn: 0, night: 0 }, clouds: 0, rain: 0, health: 1 };
  function blendPalette() {
    const out = {};
    for (const k of Object.keys(PALETTES.day)) {
      const c = new THREE.Color(0, 0, 0);
      for (const [ph, w] of Object.entries(ENV.weights)) if (w > 0) c.add(new THREE.Color(PALETTES[ph][k]).multiplyScalar(w));
      // nuvens/chuva: puxa pra um cinza claro e escurece um pouco
      const grey = new THREE.Color('#c9ccd6').lerp(new THREE.Color('#262a3a'), ENV.weights.night);   // cinza escurece de noite
      const k2 = Math.min(1, ENV.clouds * 0.45 + ENV.rain * 0.35);
      c.lerp(grey, k2).multiplyScalar(1 - ENV.rain * 0.12);
      // saúde: quanto pior, mais cinza avermelhado (o mundo dela adoece junto)
      // saúde: quanto pior, mais nublado (cinza-lavanda, mais pesado no alto e mais claro no horizonte; não cinza puro)
      const sick = 1 - Math.min(1, Math.max(0, (ENV.health - 0.2) / 0.6));
      const high = k === 'top' || k === 'midHigh';
      const ash = new THREE.Color(high ? '#8d8a9e' : '#c4bcc6').lerp(new THREE.Color(high ? '#2c2a38' : '#3d3844'), ENV.weights.night);
      c.lerp(ash, sick * 0.72).multiplyScalar(1 - sick * 0.08);
      out[k] = '#' + c.getHexString();
    }
    return out;
  }

  // ---------------------------------------------------------------- cena
  function buildSkyTexture(SKYP = SKY) {
    const canvas = document.createElement('canvas');
    canvas.width = 2; canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, 0, 1024);
    // equiretangular: 0 = zênite, 0.5 = horizonte, 1 = nadir
    // paradas espalhadas e faixa do horizonte larga: degradê esfumado, sem linha marcada
    const mixc = (a, b, t) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), t).getHexString();
    grad.addColorStop(0.0, SKYP.top);
    grad.addColorStop(0.22, mixc(SKYP.top, SKYP.midHigh, 0.7));
    grad.addColorStop(0.34, SKYP.midHigh);
    grad.addColorStop(0.42, mixc(SKYP.midHigh, SKYP.midLow, 0.6));
    grad.addColorStop(0.46, SKYP.midLow);
    grad.addColorStop(0.485, mixc(SKYP.midLow, SKYP.glow, 0.7));
    grad.addColorStop(0.5, mixc(SKYP.glow, SKYP.horizon, 0.6));
    grad.addColorStop(0.53, mixc(SKYP.horizon, SKYP.glow, 0.5));
    grad.addColorStop(0.58, mixc(SKYP.glow, SKYP.below, 0.7));
    grad.addColorStop(0.7, SKYP.below);
    grad.addColorStop(1.0, SKYP.below);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 2, 1024);
    const tex = new THREE.CanvasTexture(canvas);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }

  const scene = new THREE.Scene();
  scene.background = buildSkyTexture();
  scene.fog = new THREE.FogExp2(COLORS.fog, 0.006);

  const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 1200);
  // afastada e mais baixa: o campo ocupa a metade de baixo, o avatar vai em pé no centro (0, 0, 0)
  // boneca em destaque no centro, ilha de grama sob os pés
  camera.position.set(0, 9.5, 34);
  const lookTarget = new THREE.Vector3(0, 7.5, 0);
  camera.lookAt(lookTarget);
  // retrato (celular): câmera mais longe e alvo mais baixo, pra ela inteira caber entre o cabeçalho e a bandeja de baixo
  let portrait = false;
  function frameFor(aspect, force = false) {
    const p = aspect < 0.9;
    if (p === portrait && !force) return;
    portrait = p;
    const dist = p ? 46 : 34;
    lookTarget.y = p ? 7.0 : 7.5;
    camera.position.set(0, p ? 10.0 : 9.5, dist);
    camera.lookAt(lookTarget);
    if (controls) { controls.target.copy(lookTarget); controls.minDistance = p ? 34 : 22; controls.maxDistance = p ? 64 : 48; controls.update(); }
  }
  let controls = null;

  const renderer = new THREE.WebGPURenderer({ antialias: true });
  const isMobile = innerWidth < 768;
  const px = innerWidth * innerHeight;
  renderer.setPixelRatio(LOW ? Math.min(devicePixelRatio, 1.25) : px > 2.4e6 ? Math.min(devicePixelRatio, 1.25) : px > 1.2e6 ? Math.min(devicePixelRatio, 1.5) : Math.min(devicePixelRatio, 2));   // tela grande/celular: menos pixels
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  (opts.container || document.body).prepend(renderer.domElement);
  await renderer.init();

  // ---------------------------------------------------------------- buffers + uniforms
  const bladeData = instancedArray(BLADE_COUNT, 'vec4');   // x, z, rotY, clump
  const bendState = instancedArray(BLADE_COUNT, 'vec4');   // windX, windZ, pushX, pushZ
  const bladeBound = instancedArray(BLADE_COUNT, 'float');

  const U = {};
  for (const [k, v] of Object.entries(P)) if (typeof v === 'number') U[k] = uniform(v);
  const C = {};
  for (const [k, v] of Object.entries(COLORS)) C[k] = uniform(new THREE.Color(v));
  const mouseWorld = uniform(new THREE.Vector3(99999, 0, 99999));
  const camSphereWorld = uniform(new THREE.Vector3(99999, 0, 99999));
  const avatarWorld = uniform(new THREE.Vector3(0, 0, 0));
  const avatarRadius = uniform(1.5);
  const avatarStrength = uniform(0.9);
  const camSphereRadius = uniform(15.0);
  const camSphereStrength = uniform(5.9);
  const grassDensity = uniform(1.0);

  const LIGHT_DIR = new THREE.Vector3(-10, 14, 22).normalize();
  const uDim = uniform(1.0);                                          // escurece grama/ilha de noite e com nuvem
  const uTime = uniform(0);
  const uWaterY = uniform(-0.35);
  const uSkyMix = uniform(0.5);                                       // quanto a água espelha o céu (dia menos, tarde mais)                                     // nível da água (ilha -0.35; colina na base do morro)
  const uRain = uniform(0.0);                                         // 0..1 intensidade da chuva
  const uHealth = uniform(1.0);
  const uDead = uniform(0.0);                                         // 0 viva → 1 morta: a grama some e a colina vira areia                                       // 1 saudável → 0 grave (avatar e ilha reagem)
  // paisagem: 0 = ilha (padrão), 1 = colina (grama no chão inteiro, morro começando atrás dela)
  const uLand = uniform(1.0);                                         // colina é a paisagem padrão
  const uField = uniform(108.0);                                      // lado da área de semeadura (muda por paisagem)
  // colina: ela no topo (y 0 no centro), o terreno desce suave até -depth no raio; ondulações leves ao redor
  const HILL = { radius: 55, depth: 14, flatTop: 9, bump: 0.6, field: LOW ? 84 : 108, blades: 300000 };
  const hillY = Fn(([x, z]) => {
    const r = sqrt(x.mul(x).add(z.mul(z)));
    const t = smoothstep(float(HILL.flatTop), float(HILL.radius), r);   // 0 no topo (plano), 1 na base
    const drop = t.mul(t).mul(float(3).sub(t.mul(2))).mul(-HILL.depth);
    const bump = mx_noise_float(vec3(x.mul(0.05), float(2.0), z.mul(0.05))).mul(HILL.bump).mul(t);   // ondula só fora do topo
    return drop.add(bump);
  });
  const hillYJS = (x, z) => { const r = Math.hypot(x, z); const t = Math.min(1, Math.max(0, (r - HILL.flatTop) / (HILL.radius - HILL.flatTop))); return -t * t * (3 - 2 * t) * HILL.depth; };
  // ilha: contorno irregular (ruído por direção) e perfil domo → praia de areia → fundo
  const SHORE = { width: 7.0, depth: 2.2, exp: 1.8, sand: '#dccaa6', soil: '#6a5646', wobble: 0.10 };
  const cSand = uniform(new THREE.Color(SHORE.sand)), cSoil = uniform(new THREE.Color(SHORE.soil));
  const edgeScale = Fn(([x, z]) => {
    const r = sqrt(x.mul(x).add(z.mul(z))).max(0.001);
    const n = mx_noise_float(vec3(x.div(r).mul(2.4), float(5.0), z.div(r).mul(2.4)));
    return float(1).add(n.mul(SHORE.wobble));
  });
  const islandY = Fn(([re]) => {                                   // re = raio efetivo (já dividido pelo edgeScale)
    const dome = float(DOME.height).mul(float(1).sub(re.div(DOME.radius).pow(2)));
    const t = re.sub(DOME.radius).div(SHORE.width).max(0);
    const shore = pow(t, SHORE.exp).mul(-SHORE.depth);
    return select(re.lessThan(DOME.radius), dome, shore);
  });
  const noise2D = Fn(([x, z]) => mx_noise_float(vec3(x, float(0), z)).mul(0.5).add(0.5));

  // ---------------------------------------------------------------- compute: posição inicial de cada folha
  const computeInit = Fn(() => {
    const blade = bladeData.element(instanceIndex);
    const col = instanceIndex.mod(GRID);
    const row = instanceIndex.div(GRID);
    const jx = hash(instanceIndex).sub(0.5);
    const jz = hash(instanceIndex.add(7919)).sub(0.5);
    const wx = col.toFloat().add(jx).div(float(GRID)).sub(0.5).mul(uField);
    const wz = row.toFloat().add(jz).div(float(GRID)).sub(0.5).mul(uField);
    blade.x.assign(wx);
    blade.y.assign(wz);
    blade.z.assign(hash(instanceIndex.add(1337)).mul(PI.mul(2)));
    const n1 = noise2D(wx.mul(U.noiseFrequency), wz.mul(U.noiseFrequency));
    const f2 = U.noiseFrequency.mul(U.noise2Frequency);
    const n2 = noise2D(wx.mul(f2).add(50), wz.mul(f2).add(50));
    blade.w.assign(n1.mul(U.noiseAmplitude).sub(U.noise2Amplitude).add(n2.mul(U.noise2Amplitude).mul(2)).max(0));
    const dist = sqrt(wx.mul(wx).add(wz.mul(wz)));
    const edgeNoise = noise2D(wx.mul(0.25).add(100), wz.mul(0.25).add(100));
    const maxR = float(10.4).add(edgeNoise.sub(0.5).mul(1.4));
    const boundaryIsland = float(1).sub(smoothstep(maxR.sub(3.2), maxR, dist));   // 0 na borda, 1 a 3.2 pra dentro
    const boundaryHill = float(1).sub(smoothstep(float(42.0), float(52.0), sqrt(wx.mul(wx).add(wz.mul(wz)))));   // colina: para antes da água
    bladeBound.element(instanceIndex).assign(mix(boundaryIsland, boundaryHill, uLand));
  })().compute(BLADE_COUNT);

  // ---------------------------------------------------------------- compute: vento + empurrão (todo frame)
  const pushFrom = (bx, bz, center, radius, strength) => {
    const dx = bx.sub(center.x), dz = bz.sub(center.z);
    const dist = sqrt(dx.mul(dx).add(dz.mul(dz))).add(0.0001);
    const falloff = float(1).sub(dist.div(radius).saturate());
    const influence = falloff.mul(falloff).mul(strength);
    return [dx.div(dist).mul(influence), dz.div(dist).mul(influence)];
  };

  const computeUpdate = Fn(() => {
    const blade = bladeData.element(instanceIndex);
    const bend = bendState.element(instanceIndex);
    const bx = blade.x, bz = blade.y;

    const w1 = sin(bx.mul(0.35).add(bz.mul(0.12)).add(time.mul(U.windSpeed)));
    const w2 = sin(bx.mul(0.18).add(bz.mul(0.28)).add(time.mul(U.windSpeed.mul(0.67))).add(1.7));
    const lw = deltaTime.mul(4.0).saturate();
    bend.x.assign(mix(bend.x, w1.add(w2).mul(U.windAmplitude), lw));
    bend.y.assign(mix(bend.y, w1.sub(w2).mul(U.windAmplitude.mul(0.55)), lw));

    const [p1x, p1z] = pushFrom(bx, bz, mouseWorld, U.mouseRadius, U.mouseStrength);
    const [p2x, p2z] = pushFrom(bx, bz, mouseWorld, U.outerRadius, U.outerStrength);
    const [p3x, p3z] = pushFrom(bx, bz, camSphereWorld, camSphereRadius, camSphereStrength);
    const [p4x, p4z] = pushFrom(bx, bz, avatarWorld, avatarRadius, avatarStrength);
    const tx = p1x.add(p2x).add(p3x).add(p4x);
    const tz = p1z.add(p2z).add(p3z).add(p4z);

    const targetMag = sqrt(tx.mul(tx).add(tz.mul(tz)));
    const currentMag = sqrt(bend.z.mul(bend.z).add(bend.w.mul(bend.w)));
    // dobra rápido, levanta devagar: grama pisada
    const lm = select(targetMag.greaterThan(currentMag), deltaTime.mul(12.0), deltaTime.mul(1.0)).saturate();
    bend.z.assign(mix(bend.z, tx, lm));
    bend.w.assign(mix(bend.w, tz, lm));
  })().compute(BLADE_COUNT);

  // ---------------------------------------------------------------- folha: fita de 5 segmentos
  function createBladeGeometry() {
    const segs = 5, W = 0.055, H = 1.0;
    const verts = [], norms = [], uvArr = [], idx = [];
    for (let i = 0; i <= segs; i++) {
      const t = i / segs, y = t * H, hw = W * 0.5 * (1.0 - t * 0.82);
      verts.push(-hw, y, 0, hw, y, 0);
      norms.push(0, 0, 1, 0, 0, 1);
      uvArr.push(0, t, 1, t);
    }
    for (let i = 0; i < segs; i++) { const b = i * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(norms, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvArr, 2));
    geo.setIndex(idx);
    return geo;
  }

  // ---------------------------------------------------------------- material da grama
  const grassMat = new THREE.MeshBasicNodeMaterial({ side: THREE.DoubleSide, fog: true, transparent: true });

  grassMat.positionNode = Fn(() => {
    const blade = bladeData.element(instanceIndex);
    const bend = bendState.element(instanceIndex);
    const boundary = bladeBound.element(instanceIndex);
    // degradê de quantidade: cheio no centro, cada vez menos pra fora
    const rd = sqrt(blade.x.mul(blade.x).add(blade.y.mul(blade.y))).div(edgeScale(blade.x, blade.y));
    const radialIsland = pow(float(1).sub(smoothstep(float(0.0), float(12.8), rd)), 0.8);        // ilha: 1 no centro → zero na ponta
    const radial = mix(radialIsland, float(0.55), uLand)                                       // colina: densidade uniforme (área bem maior)
      .mul(mix(float(0.35), float(1.0), smoothstep(float(0.0), float(0.8), uHealth)));       // doente: grama rala
    const visible = select(hash(instanceIndex.add(9999)).lessThan(grassDensity.mul(radial)), float(1), float(0));
    // rarefação: perto da borda cada folha tem chance crescente de sumir; as que ficam encolhem só um pouco
    const survives = select(hash(instanceIndex.add(31337)).lessThan(pow(boundary, 1.3)), float(1), float(0));
    const shrinkIsland = float(0.45).add(sqrt(boundary).mul(0.55)).mul(float(1).sub(smoothstep(float(2.0), float(12.5), rd).mul(0.35)));
    const shrink = mix(shrinkIsland, float(0.85).add(hash(instanceIndex.add(777)).mul(0.3)), uLand);
    const hVar = hash(instanceIndex.add(5555)).mul(U.bladeHeightVariation);
    const heightScale = float(0.35).add(blade.w).add(hVar).mul(shrink).mul(survives).mul(visible).mul(float(1).sub(uDead));   // morta: as folhas afundam na areia
    const taper = float(1).sub(uv().y.mul(float(1).sub(U.bladeTipWidth)));
    const lx = positionGeometry.x.mul(U.bladeWidth).mul(taper).mul(heightScale.sign());
    const ly = positionGeometry.y.mul(heightScale).mul(U.bladeHeight);
    const cY = cos(blade.z), sY = sin(blade.z);
    const rx = lx.mul(cY), rz = lx.mul(sY);
    const bendFactor = pow(uv().y, 1.8);
    const bendX = hash(instanceIndex.add(7777)).sub(0.5).mul(U.bladeLean).add(bend.x).add(bend.z);
    const bendZ = hash(instanceIndex.add(8888)).sub(0.5).mul(U.bladeLean).add(bend.y).add(bend.w);
    const relX = rx.add(bendX.mul(bendFactor).mul(U.bladeHeight));
    const relZ = rz.add(bendZ.mul(bendFactor).mul(U.bladeHeight));
    // renormaliza: a folha curva sem esticar
    const origLen = sqrt(rx.mul(rx).add(ly.mul(ly)).add(rz.mul(rz)));
    const newLen = sqrt(relX.mul(relX).add(ly.mul(ly)).add(relZ.mul(relZ)));
    const scale = origLen.div(newLen.max(0.0001));
    const rr = sqrt(blade.x.mul(blade.x).add(blade.y.mul(blade.y))).div(edgeScale(blade.x, blade.y));
    const dome = mix(islandY(rr), hillY(blade.x, blade.y), uLand);
    return vec3(blade.x.add(relX.mul(scale)), ly.mul(scale).add(dome), blade.y.add(relZ.mul(scale)));
  })();

  grassMat.colorNode = Fn(() => {
    const t = uv().y;
    const blade = bladeData.element(instanceIndex);
    const clump = blade.w.saturate();
    const isGolden = hash(instanceIndex.add(4242)).lessThan(0.4);
    const tipMix = float(1).sub(U.colorVariation).add(clump.mul(U.colorVariation));
    const greenTip = mix(C.greenTip, C.bladeTip, tipMix);
    const warmTip = mix(C.greenTip, C.goldenTip, tipMix);
    const tip = mix(greenTip, warmTip, select(isGolden, float(1), float(0)));
    const lower = mix(C.bladeBase, C.mid, smoothstep(float(0.0), float(0.45), t));
    const color = mix(lower, tip, smoothstep(float(0.4), float(0.85), t));
    // luz: a fita encara (-sin, 0, cos) da rotação; lambert dos dois lados contra a key light
    const nx = sin(blade.z).negate(), nz = cos(blade.z);
    const ndl = nx.mul(LIGHT_DIR.x).add(nz.mul(LIGHT_DIR.z)).abs();
    const lit = float(0.62).add(ndl.mul(0.38)).add(t.mul(0.12));                  // ponta pega mais luz
    // sombra de contato da boneca
    const sdx = blade.x.sub(avatarWorld.x), sdz = blade.y.sub(avatarWorld.z).add(0.8);
    const sd = sqrt(sdx.mul(sdx).add(sdz.mul(sdz)));
    const shade = float(1).sub(float(1).sub(smoothstep(float(1.2), float(3.6), sd)).mul(0.45));
    const dist = sqrt(blade.x.mul(blade.x).add(blade.y.mul(blade.y)));
    const sick = float(1).sub(smoothstep(float(0.25), float(0.85), uHealth));
    const dry = mix(color, vec3(0.27, 0.17, 0.085), sick.mul(0.85));                              // doente: grama seca, amarronzada
    return mix(dry.mul(lit).mul(shade), C.fog, smoothstep(U.fogStart, U.fogEnd, dist).mul(U.fogIntensity)).mul(uDim);
  })();

  grassMat.opacityNode = Fn(() => {
    const blade = bladeData.element(instanceIndex);
    const dist = sqrt(blade.x.mul(blade.x).add(blade.y.mul(blade.y)));
    const fadeEnd = select(U.fogIntensity.greaterThan(0.01), U.fogEnd.add(2.0), float(100.0));
    const fade = float(1).sub(smoothstep(fadeEnd.sub(8.0), fadeEnd, dist));
    return smoothstep(float(0.0), float(0.1), uv().y).mul(fade);
  })();

  const grass = new THREE.InstancedMesh(createBladeGeometry(), grassMat, BLADE_COUNT);
  grass.frustumCulled = false;
  scene.add(grass);

  // ---------------------------------------------------------------- chão
  const groundMat = new THREE.MeshBasicNodeMaterial();
  groundMat.colorNode = Fn(() => {
    const wx = positionWorld.x, wz = positionWorld.z;
    const dist = sqrt(wx.mul(wx).add(wz.mul(wz)));
    const edgeNoise = noise2D(wx.mul(0.25).add(100), wz.mul(0.25).add(100));
    const maxR = U.groundRadius.add(edgeNoise.sub(0.5).mul(1.5));
    return mix(C.ground, C.mid.mul(0.75), smoothstep(maxR.sub(U.groundFalloff), maxR, dist));
  })();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(FIELD_SIZE * 60, FIELD_SIZE * 60), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.05;
  ground.visible = false;                                   // substituído pela água

  const clock = new THREE.Clock();
  const hooks = { onRipple: null, onGrass: null, onWater: null };                 // callbacks pra som (app.html)

  // ---------------------------------------------------------------- estrelas (só de noite)
  const uNight = uniform(0.0);
  const STAR_N = LOW ? 600 : 1400, starPos = new Float32Array(STAR_N * 3), starSeed = new Float32Array(STAR_N);
  for (let i = 0; i < STAR_N; i++) {
    const u = Math.random(), v = Math.random();
    const th = u * Math.PI * 2, ph = Math.acos(1 - v * 0.9);                  // hemisfério de cima (evita o horizonte)
    const R = 420;
    starPos[i * 3] = R * Math.sin(ph) * Math.cos(th); starPos[i * 3 + 1] = R * Math.cos(ph) + 20; starPos[i * 3 + 2] = R * Math.sin(ph) * Math.sin(th);
    starSeed[i] = Math.random();
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('seed', new THREE.BufferAttribute(starSeed, 1));
  const starMat = new THREE.PointsNodeMaterial({ transparent: true, depthWrite: false, fog: false });
  const seedAttr = attribute('seed', 'float');
  starMat.sizeNode = seedAttr.mul(2.2).add(1.2);
  starMat.colorNode = vec3(1.0, 0.96, 0.9);
  starMat.opacityNode = uNight.mul(sin(uTime.mul(seedAttr.mul(3.0).add(1.5)).add(seedAttr.mul(40.0))).mul(0.35).add(0.65)).mul(seedAttr.mul(0.6).add(0.4));
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---------------------------------------------------------------- chão da colina (só na paisagem 1)
  const hillMat = new THREE.MeshBasicNodeMaterial();
  hillMat.positionNode = Fn(() => vec3(positionGeometry.x, positionGeometry.y, positionGeometry.z.add(hillY(positionGeometry.x, positionGeometry.y.negate()))))();   // plano deitado: local y = -z mundo, local z = y mundo
  hillMat.colorNode = Fn(() => {
    const wx = positionWorld.x, wz = positionWorld.z;
    const n = mx_noise_float(vec3(wx.mul(0.08), float(1.0), wz.mul(0.08))).mul(0.5).add(0.5);
    const far = smoothstep(float(50.0), float(110.0), sqrt(wx.mul(wx).add(wz.mul(wz))));
    const base = mix(C.ground, C.mid.mul(0.7), n.mul(0.5));
    const sick = float(1).sub(smoothstep(float(0.25), float(0.85), uHealth));
    const dry = mix(base, vec3(0.22, 0.14, 0.07), sick.mul(0.8));
    // morta: areia com marolas de vento (listras finas moduladas por ruído) e grão
    const ripple = sin(wx.mul(1.6).add(wz.mul(0.9)).add(n.mul(6.0))).mul(0.5).add(0.5);
    const grain = mx_noise_float(vec3(wx.mul(0.9), float(7.0), wz.mul(0.9))).mul(0.5).add(0.5);
    const sand = cSand.mul(float(0.88).add(ripple.mul(0.08)).add(grain.mul(0.08)));
    return mix(mix(dry, sand, uDead), C.fog, far.mul(0.85)).mul(uDim);
  })();
  const hillMesh = new THREE.Mesh(new THREE.PlaneGeometry(320, 320, LOW ? 72 : 140, LOW ? 72 : 140), hillMat);
  hillMesh.rotation.x = -Math.PI / 2;
  hillMesh.position.y = -0.15;
  hillMesh.visible = true;
  scene.add(hillMesh);

  // ---------------------------------------------------------------- água (procedural, reage ao mouse como a grama)
  const WATER = { y: -0.35, size: 900, segs: LOW ? 72 : 160, deep: '#6f86c8', shallow: '#9fd2cf', sky: '#dcc9e6', foam: '#f7f4fa' };
  const RIPPLES = LOW ? 6 : 16;
  const ripples = uniformArray(Array.from({ length: RIPPLES }, () => new THREE.Vector4(0, 0, -100, 0)));  // x, z, t0, força
  const W = {}; for (const [k, v] of Object.entries(WATER)) if (typeof v === 'string') W[k] = uniform(new THREE.Color(v));

  // anéis: retorna vec2(mouse, chuva). Mouse = primeira implementação (fechado, curto, só relevo).
  const rippleHeight = Fn(([x, z]) => {
    const t = uTime;
    let hm = float(0), hr = float(0);
    for (let i = 0; i < RIPPLES; i++) {
      const r = ripples.element(i);
      const d = length(vec2(x.sub(r.x), z.sub(r.y)));
      const age = t.sub(r.z);
      const alive = select(age.greaterThan(0.0), float(1), float(0));
      const isMouse = r.w.greaterThan(1.0);
      // mouse (original)
      const fm = age.mul(5.0);
      const rm = sin(d.mul(4.0).sub(age.mul(9.0)));
      const em = exp(age.mul(-1.6)).mul(exp(d.mul(-0.22))).mul(smoothstep(fm.add(0.4), fm.sub(1.2), d)).mul(alive);
      // chuva (largo, mais longo)
      const fr = age.mul(3.2);
      const rr = sin(d.mul(3.0).sub(age.mul(7.0)));
      const er = exp(age.mul(-0.9)).mul(exp(d.mul(-0.14))).mul(smoothstep(fr.add(0.5), fr.sub(2.0), d)).mul(alive).mul(r.w);
      hm = hm.add(select(isMouse, rm.mul(em).mul(r.w.sub(1.0)), float(0)));   // w-1 = amplitude do estilo original
      hr = hr.add(select(isMouse, float(0), rr.mul(er)));
    }
    return vec2(hm, hr);
  });
  // altura da água num ponto: ondas contínuas + anéis
  const waterHeight = Fn(([x, z]) => {
    const t = uTime;
    let h = mx_noise_float(vec3(x.mul(0.18).add(t.mul(0.08)), t.mul(0.3), z.mul(0.18))).mul(0.14)
      .add(mx_noise_float(vec3(x.mul(0.55).add(t.mul(0.2)), t.mul(0.55), z.mul(0.55).sub(t.mul(0.12)))).mul(0.055))
      .add(mx_noise_float(vec3(x.mul(1.6), t.mul(0.9), z.mul(1.6).sub(t.mul(0.15)))).mul(0.018));
    const rp = rippleHeight(x, z);
    h = h.add(rp.x.mul(0.28)).add(rp.y.mul(0.28));
    return h;
  });

  const waterMat = new THREE.MeshBasicNodeMaterial({ fog: false, transparent: true });
  waterMat.positionNode = Fn(() => {
    const p = positionWorld;                                                     // plano deitado: world x,z
    return positionGeometry.add(vec3(0, 0, waterHeight(p.x, p.z)));               // geometria local: z é o "pra cima" do plano
  })();
  waterMat.colorNode = Fn(() => {
    const p = positionWorld;
    const e = float(0.25);
    const h0 = waterHeight(p.x, p.z), hR = waterHeight(p.x.add(e), p.z), hF = waterHeight(p.x, p.z.add(e));   // 3 amostras
    const N = normalize(vec3(h0.sub(hR).div(e), float(1), h0.sub(hF).div(e)));
    const V = normalize(cameraPosition.sub(p));
    // sol da água: baixo e atrás da ilha, o brilho vira rastro no horizonte (não um disco aos pés)
    const L = normalize(vec3(0.25, 0.32, -1.0));
    const H = normalize(L.add(V));
    const spec = pow(max(dot(N, H), 0.0), 140.0).mul(0.22).mul(uDim);
    const fresnel = pow(float(1).sub(max(dot(N, V), 0.0)), 3.0);
    const re = length(vec2(p.x, p.z)).div(edgeScale(p.x, p.z));
    const depth = uWaterY.sub(mix(islandY(re), hillY(p.x, p.z), uLand)).max(0);   // profundidade real da água aqui (ilha ou morro)
    const shallow = float(1).sub(smoothstep(float(0.0), float(1.4), depth));
    let col = mix(W.deep, W.shallow, shallow.mul(0.7));
    col = mix(col, cSand.mul(0.95).mul(uDim), float(1).sub(smoothstep(float(0.0), float(0.35), depth)).mul(0.6));   // areia vista pela água rasa
    col = mix(col, W.sky, fresnel.mul(uSkyMix).add(0.05));
    // espuma na linha da ilha, quebrada por ruído
    const foamN = mx_noise_float(vec3(p.x.mul(1.4), uTime.mul(0.5), p.z.mul(1.4))).mul(0.5).add(0.5);
    const foam = smoothstep(float(0.55), float(0.9), float(1).sub(depth.div(0.12)).mul(foamN.add(0.2)));
    col = mix(col, W.foam.mul(uDim), foam.mul(0.35));
    // anéis pintados: crista clara, cava escura (visível mesmo com céu chapado)
    const rh = rippleHeight(p.x, p.z).y;                                   // só a chuva é pintada
    col = col.add(rh.mul(1.3)).add(abs(rh).mul(0.35));
    // cristas das ondulações do mouse clareiam
    const crest = smoothstep(float(0.06), float(0.2), h0);
    col = mix(col, W.foam, crest.mul(0.3));
    // longe: em vez de virar céu (névoa), escurece um pouco e mantém a linha do horizonte
    const camD = length(p.sub(cameraPosition));
    col = mix(col, W.deep.mul(0.82), smoothstep(float(120.0), float(420.0), camD));
    // doente: a água amarela e fica opaca, cada vez mais turva conforme piora
    const sickW = float(1).sub(smoothstep(float(0.15), float(0.8), uHealth));
    const murky = mix(vec3(0.70, 0.60, 0.28), vec3(0.42, 0.40, 0.20), uDead);           // doente: verde-pântano; morta: mais escuro, separa da areia
    col = mix(col, murky.mul(uDim), sickW.mul(0.8));
    return col.add(spec.mul(float(1).sub(sickW.mul(0.6))));
  })();
  waterMat.opacityNode = float(0.96);
  // celular: mar chapado (uma cor, sem ondas, sem anéis, sem reflexo), só pra manter a linha do horizonte
  const flatWaterMat = new THREE.MeshBasicNodeMaterial({ fog: false });
  flatWaterMat.colorNode = Fn(() => {
    const p = positionWorld;
    const camD = length(vec2(p.x.sub(cameraPosition.x), p.z.sub(cameraPosition.z)));
    let col = mix(W.deep, W.sky, uSkyMix.mul(0.6));
    col = mix(col, W.deep.mul(0.82), smoothstep(float(120.0), float(420.0), camD));
    const sickW = float(1).sub(smoothstep(float(0.15), float(0.8), uHealth));
    const murky = mix(vec3(0.70, 0.60, 0.28), vec3(0.42, 0.40, 0.20), uDead);
    return mix(col, murky.mul(uDim), sickW.mul(0.8));
  })();
  const water = LOW
    ? new THREE.Mesh(new THREE.PlaneGeometry(WATER.size, WATER.size, 1, 1), flatWaterMat)
    : new THREE.Mesh(new THREE.PlaneGeometry(WATER.size, WATER.size, WATER.segs, WATER.segs), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.y = -HILL.depth + 0.8; uWaterY.value = water.position.y;
  scene.add(water);
  const waterPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), HILL.depth - 0.8);
  let rippleIdx = 0, lastRipple = new THREE.Vector3(1e9, 0, 1e9), lastRippleT = 0, nextDrop = 1.0;
  function addRipple(x, z, strength = 1) {
    const v = ripples.array[rippleIdx];
    v.set(x, z, clock.elapsedTime, strength);
    rippleIdx = (rippleIdx + 1) % RIPPLES;
  }
  // perfil: domo até a borda, praia de areia suave, depois fundo
  const prof = [];
  for (let i = 0; i <= 40; i++) { const r = DOME.radius * i / 40; prof.push(new THREE.Vector2(r, domeY(r))); }
  for (let i = 1; i <= 40; i++) {
    const t = i / 40; const r = DOME.radius + SHORE.width * t;
    prof.push(new THREE.Vector2(r, -SHORE.depth * Math.pow(t, SHORE.exp)));
  }
  prof.push(new THREE.Vector2(0, -SHORE.depth));
  const islandMat = new THREE.MeshBasicNodeMaterial();
  islandMat.positionNode = Fn(() => {                                // contorno irregular: empurra radialmente
    const k = edgeScale(positionGeometry.x, positionGeometry.z);
    return vec3(positionGeometry.x.mul(k), positionGeometry.y, positionGeometry.z.mul(k));
  })();
  islandMat.colorNode = Fn(() => {
    const wx = positionWorld.x, wz = positionWorld.z, y = positionWorld.y;
    const re = sqrt(wx.mul(wx).add(wz.mul(wz))).div(edgeScale(wx, wz));
    const n = mx_noise_float(vec3(wx.mul(0.45), float(3.0), wz.mul(0.45))).mul(0.5).add(0.5);
    const greenBase = mix(C.ground, C.mid.mul(0.85), smoothstep(float(5.0), float(10.0), re));
    const green = mix(greenBase, vec3(0.5, 0.42, 0.24), float(1).sub(smoothstep(float(0.25), float(0.85), uHealth)).mul(0.7));
    // verde → areia numa faixa larga e ruidosa (transição quase imperceptível)
    const sandMix = smoothstep(float(9.0), float(12.5), re.add(n.mul(2.0).sub(1.0)));
    const shore = mix(green, cSand, sandMix);
    const wet = mix(shore, cSand.mul(0.86), smoothstep(float(-0.15), float(-0.5), y));            // areia molhada
    return mix(wet, cSoil, smoothstep(float(-0.7), float(-1.8), y)).mul(uDim);
  })();
  const domeMesh = new THREE.Mesh(new THREE.LatheGeometry(prof, 160), islandMat);
  domeMesh.visible = false;
  scene.add(domeMesh);

  // ---------------------------------------------------------------- flores
  // flores: geradas com semente fixa; posições diferentes por paisagem (ilha compacta, colina espalhada); tamanhos variados
  const FLOWER_COLORS = ['#f6b8e0', '#ffd9a8', '#e4ccff', '#ff9ec4', '#fff1b8', '#d9c6ff'];
  let fseed = 7; const frand = () => { fseed = (fseed * 9301 + 49297) % 233280; return fseed / 233280; };
  const FLOWERS = Array.from({ length: 16 }, (_, i) => {
    const a = frand() * Math.PI * 2, size = 0.55 + frand() * 0.75;
    const rIsland = 3.0 + frand() * 5.0, rHill = 4.0 + frand() * 30.0;
    return { x: Math.cos(a) * rIsland, z: Math.sin(a) * rIsland, xh: Math.cos(a * 1.3 + i) * rHill, zh: Math.sin(a * 1.3 + i) * rHill,
             h: 1.6 + frand() * 1.0, color: FLOWER_COLORS[i % FLOWER_COLORS.length], size, phase: frand() * 6.28 };
  });
  const stemMat = new THREE.MeshBasicNodeMaterial({ color: '#3f6a1e', fog: true });
  const centerMat = new THREE.MeshBasicNodeMaterial({ color: '#ffe36b', fog: true });
  const petalGeo = new THREE.SphereGeometry(0.16, 16, 10);
  const flowerGroup = new THREE.Group();
  scene.add(flowerGroup);
  let flowerDroop = 0;
function flowersHealth(h) { flowerDroop = 1 - Math.min(1, Math.max(0, (h - 0.2) / 0.6)); }
const flowers = FLOWERS.map(f => {
    const g = new THREE.Group();
    g.position.set(f.xh, hillYJS(f.xh, f.zh), f.zh);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, f.h, 8), stemMat);
    stem.position.y = f.h / 2;
    g.add(stem);
    const head = new THREE.Group();
    head.position.y = f.h;
    head.scale.setScalar(f.size);
    const petalMat = new THREE.MeshBasicNodeMaterial({ color: f.color, fog: true });
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Mesh(petalGeo, petalMat);
      const a = (i / 5) * Math.PI * 2;
      p.position.set(Math.cos(a) * 0.22, 0.02, Math.sin(a) * 0.22);
      p.scale.set(1.25, 0.3, 0.7);
      p.rotation.y = -a;
      head.add(p);
    }
    const center = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), centerMat);
    center.scale.y = 0.6;
    head.add(center);
    g.add(head);
    flowerGroup.add(g);
    return { g, head, f };
  });

  // ---------------------------------------------------------------- chuva: fios caindo (instanciados, só quando uRain > 0)
  const RAIN_COUNT = LOW ? 2200 : 5500, RAIN_H = 38, RAIN_AREA = 84;
  const rainMat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: true });
  rainMat.positionNode = Fn(() => {
    const i = instanceIndex;
    const x = hash(i).sub(0.5).mul(RAIN_AREA);
    const z = hash(i.add(11)).sub(0.5).mul(RAIN_AREA);
    const speed = float(24).add(hash(i.add(23)).mul(10));
    const y = hash(i.add(37)).mul(RAIN_H).sub(uTime.mul(speed)).mod(RAIN_H).sub(3.0);
    const on = select(hash(i.add(53)).lessThan(uRain), float(1), float(0));   // mais chuva, mais fios ligados
    const len = float(0.5).add(hash(i.add(71)).mul(0.4));
    return vec3(positionGeometry.x.mul(on), positionGeometry.y.mul(len).mul(on), 0).add(vec3(x, y, z));
  })();
  rainMat.colorNode = vec3(0.86, 0.9, 1.0);
  rainMat.opacityNode = Fn(() => smoothstep(float(0), float(0.4), uv().y).mul(float(1).sub(smoothstep(float(0.8), float(1), uv().y))).mul(0.42).mul(uRain.min(1)))();
  const rain = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.03, 1.0), rainMat, RAIN_COUNT);
  rain.frustumCulled = false;
  scene.add(rain);

  // ---------------------------------------------------------------- morph de expressão (shape key + textura), com easing
  const uExpr = uniform(0);                                          // 0 = neutra, 1 = happy
  const exprTex = {};
  const exprLoader = new THREE.TextureLoader();
  exprTex.happy = exprLoader.load('face_happy.png'); exprTex.happy.colorSpace = THREE.SRGBColorSpace; exprTex.happy.flipY = false;
  let exprTarget = 0, exprMesh = null;
  let mixer = null, clips = {}, current = null, clipOnce = false, clipBase = 'happy-idle';
  let hipBone = null, headBone = null, spineBone = null;
  const spineBase = new THREE.Quaternion(), spineLast = new THREE.Quaternion(); let spineInit = false;
  const tmpQ5 = new THREE.Quaternion(), tmpQ6 = new THREE.Quaternion();
  const tmpV1 = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpV3 = new THREE.Vector3(), tmpV4 = new THREE.Vector3(); const hipRest = new THREE.Vector3(), hipNow = new THREE.Vector3();
  let sadness = 0, sadNow = 0;                                       // 0..1: cabeça cai por cima do clipe
  const headBase = new THREE.Quaternion(), headLast = new THREE.Quaternion(), headTilt = new THREE.Quaternion(); let headInit = false;
  const tmpQ1 = new THREE.Quaternion(), tmpQ2 = new THREE.Quaternion(), tmpQ3 = new THREE.Quaternion(), tmpQ4 = new THREE.Quaternion();
  const clipKey = n => clips[n] ? n : Object.keys(clips).find(k => k.toLowerCase().includes(n.toLowerCase()));
  let held = false;                                                  // pose final travada (morte)
  function play(name, { fade = 0.4, once = false, base = null, hold = false, transient = false } = {}) {
    if (held && !hold) return;                                       // morta: não reage mais
    const k = clipKey(name); const a = k && clips[k]; if (!a) return;
    name = k;
    if (base) clipBase = base;
    if (hold) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; clipOnce = false; held = true; }
    else if (once) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = false; clipOnce = true; }
    else if (transient) { a.setLoop(THREE.LoopRepeat, Infinity); }                       // andar: loop, mas não vira fundo
    else { a.setLoop(THREE.LoopRepeat, Infinity); if (!clipOnce) clipBase = name; }
    if (current && current !== a) { current.fadeOut(fade); }
    a.reset().setEffectiveWeight(1).fadeIn(fade).play();
    current = a;
  }
  function setExpression(name) { exprTarget = name === 'happy' ? 1 : 0; }
  // clipe de fundo por estado (loop); se estiver tocando um clipe único, troca quando ele acabar
  function setBaseClip(name) {
    const want = clipKey(name) || clipKey('idle'); if (!want) return;
    const busy = clipOnce || walkTarget || keyWalking;                 // reação única ou andando: só anota, troca depois
    if (mixer && !busy && clipBase !== want) play(want, { fade: 0.6 });
    else clipBase = want;
  }

  // ---------------------------------------------------------------- cabelo de feltro (máscara por cor + altura, sobre a mesma malha)
  const FELT = { minY: 0.45, sheen: 0.32, grain: 0.14, sheenColor: '#7a4e3a', darken: 0.9 };
  const feltY = uniform(0);                                          // altura (mundo) acima da qual pode ser cabelo
  function feltHair(mesh, { tint = true } = {}) {
    const src = mesh.material;
    if (!src.map) return;
    const healthN = tint ? uHealth : float(1.0);                    // modelos de estado já vêm com a cara do estado: sem tinta de doença
    const m = LOW ? new THREE.MeshStandardNodeMaterial() : new THREE.MeshPhysicalNodeMaterial();   // celular: sem sheen/feltro (shader mais barato)
    const base0 = texture(src.map);
    // saúde: pele pálida (dessatura e esfria) e olheiras (escurece abaixo dos olhos); cabelo perde brilho
    const sickAmt = float(1).sub(smoothstep(float(0.25), float(0.85), healthN));
    const c0 = base0.rgb;
    const lum0 = c0.r.mul(0.3).add(c0.g.mul(0.5)).add(c0.b.mul(0.2));
    // (valores lineares: pele ≈ r 0.9, g 0.5, b 0.3; camiseta branca r≈b; cabelo escuro lum < 0.25)
    const isSkin = smoothstep(float(0.22), float(0.38), lum0).mul(smoothstep(float(0.12), float(0.28), c0.r.sub(c0.b))).mul(float(1).sub(smoothstep(float(0.7), float(0.9), c0.r.sub(c0.g))));
    const sickTone = vec3(lum0.mul(0.72).add(0.04), lum0.mul(1.0).add(0.08), lum0.mul(0.62).add(0.03));        // pele doente: esverdeada de vez
    const pale = mix(c0, sickTone, isSkin.mul(sickAmt).mul(0.75));
    const pxh = positionWorld.x.sub(AVATAR.x), pyh = positionWorld.y.sub(domeY(0)), pzh = positionWorld.z.sub(AVATAR.z);
    const hh = AVATAR.height;
    const underEye = float(1).sub(smoothstep(0.06 * hh, 0.24 * hh, abs(abs(pxh).sub(0.085 * hh)))).mul(smoothstep(0.70 * hh, 0.745 * hh, pyh)).mul(float(1).sub(smoothstep(0.765 * hh, 0.80 * hh, pyh))).mul(smoothstep(0.02 * hh, 0.10 * hh, pzh));
    const shadowed = mix(pale, pale.mul(vec3(0.62, 0.6, 0.72)), underEye.mul(isSkin).mul(sickAmt));
    const base = vec4(shadowed, 1.0);
    const rm = src.roughnessMap ? texture(src.roughnessMap) : null;
    // cabelo: escuro, quente (r > g > b), e acima do peito
    const c = base.rgb;
    const lum = c.r.mul(0.3).add(c.g.mul(0.5)).add(c.b.mul(0.2));
    const warm = c.r.sub(c.b).mul(6.0).saturate();
    const dark = float(1).sub(smoothstep(float(0.18), float(0.42), lum));
    const high = smoothstep(feltY.sub(0.6), feltY.add(0.6), positionWorld.y);
    // olhos ficam de fora: caixa na frente do rosto (relativa ao avatar)
    const px = positionWorld.x.sub(AVATAR.x), py = positionWorld.y.sub(domeY(0)), pz = positionWorld.z.sub(AVATAR.z);
    const h = AVATAR.height;
    const inEyes = float(1).sub(smoothstep(0.2 * h, 0.26 * h, abs(px))).mul(smoothstep(0.72 * h, 0.76 * h, py)).mul(float(1).sub(smoothstep(0.86 * h, 0.9 * h, py))).mul(smoothstep(0.05 * h, 0.12 * h, pz));
    // short: faixa da cintura até o meio da coxa (escuro e quente também)
    const shorts = smoothstep(0.24 * h, 0.29 * h, py).mul(float(1).sub(smoothstep(0.45 * h, 0.50 * h, py)));
    const mask = dark.mul(warm).mul(high.add(shorts).saturate()).mul(float(1).sub(inEyes)).saturate();
    // grão de fibra: ruído fino que clareia/escurece, mais claro nos fios de fora
    const grain = LOW ? float(1.0) : mx_noise_float(positionWorld.mul(38.0)).mul(FELT.grain).add(1.0);
    const fuzz = LOW ? float(0.5) : mx_noise_float(positionWorld.mul(9.0)).mul(0.5).add(0.5);
    // doente: cabelo perde a cor (puxa pra castanho acinzentado e opaco)
    const hairMask = dark.mul(warm).mul(high).mul(float(1).sub(inEyes)).saturate();
    const dullHair = mix(c, vec3(lum.mul(0.9).add(0.06), lum.mul(0.82).add(0.05), lum.mul(0.7).add(0.04)), hairMask.mul(sickAmt).mul(0.8));
    // doente: a camiseta branca vai pra um cinza claro (só nas partes claras e neutras)
    const isShirt = smoothstep(float(0.5), float(0.7), lum).mul(float(1).sub(smoothstep(float(0.08), float(0.2), abs(c.r.sub(c.b)))));
    const dirty = mix(dullHair, c.mul(vec3(0.66, 0.66, 0.69)), isShirt.mul(sickAmt));
    const felted = dirty.mul(grain).mul(float(1.0).add(fuzz.mul(0.04))).mul(FELT.darken);
    m.colorNode = vec4(mix(dirty, felted, mask), 1.0);
    m.roughnessNode = mix(rm ? rm.g : float(0.6), float(1.0), mask);
    m.metalnessNode = rm ? rm.b.mul(float(1).sub(mask)) : float(0);
    if (src.normalMap) m.normalNode = normalMap(texture(src.normalMap), src.normalScale);
    if (!LOW) {
      m.sheenNode = mask.mul(FELT.sheen).mul(float(1).sub(sickAmt.mul(0.6)));             // cabelo doente sem brilho
      m.sheenRoughnessNode = float(0.85);
      m.sheenColorNode = vec3(...new THREE.Color(FELT.sheenColor).toArray());
    }
    m.fog = false;
    mesh.material = m;
  }

  // ---------------------------------------------------------------- expressões: decalque do rosto (textura trocável)
  // decalque desligado (enabled: false): expressões virão por morph
  const FACE = { enabled: false, y: 0.80, size: 0.25, depth: 0.11, zOffset: 0.0, names: ['neutral', 'happy', 'tired', 'sad', 'anxious', 'disappointed', 'drunk-high', 'relaxed'] };
  const faceTex = {};
  const texLoader = new THREE.TextureLoader();
  for (const n of FACE.names) { const t = texLoader.load(`faces/${n}.png`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; faceTex[n] = t; }
  let faceDecal = null, faceMesh = null, currentFace = 'neutral';
  function buildFaceDecal(root) {
    faceMesh = null;
    root.traverse(o => { if (o.isMesh && !faceMesh) faceMesh = o; });
    if (!faceMesh) return;
    const h = AVATAR.height;
    // acha o ponto da testa/olhos na frente do rosto com um raio vindo da câmera (frente = +z)
    const ray = new THREE.Raycaster(new THREE.Vector3(AVATAR.x, domeY(0) + h * FACE.y, AVATAR.z + 30), new THREE.Vector3(0, 0, -1));
    const hit = ray.intersectObject(faceMesh, false)[0];
    if (!hit) { console.warn('rosto: raio não achou a cabeça'); return; }
    const pos = hit.point.clone();
    pos.z += FACE.zOffset;
    const size = new THREE.Vector3(h * FACE.size, h * FACE.size, h * FACE.depth);
    const geo = new DecalGeometry(faceMesh, pos, new THREE.Euler(0, 0, 0), size);
    // sem teste de profundidade (a malha se deforma no morph e o decalque continua por cima), mas some quando o rosto vira
    const mat = new THREE.MeshBasicNodeMaterial({ transparent: true, depthWrite: false, depthTest: false, fog: false });
    const tN = texture(faceTex.neutral), tH = texture(faceTex.happy);
    const facing = smoothstep(float(0.05), float(0.35), normalView.z);
    mat.colorNode = mix(tN.rgb, tH.rgb, uExpr).mul(uDim.mul(0.35).add(0.65));
    mat.opacityNode = mix(tN.a, tH.a, uExpr).mul(facing);
    if (faceDecal) { faceDecal.geometry.dispose(); scene.remove(faceDecal); }
    faceDecal = new THREE.Mesh(geo, mat);
    faceDecal.renderOrder = 10;
    avatarGroup.add(faceDecal);
  }

  // ---------------------------------------------------------------- avatar
  // look padrão: 02 (verão). ?avatar=avatar.glb na URL volta pro look 01 (casaco)
const AVATAR = { url: new URLSearchParams(location.search).get('avatar') || opts.avatar || 'avatar-tripo-anim.glb', height: 16.0, x: 0, z: 0, rotY: 0 };
  const keyLight = new THREE.DirectionalLight('#ffc3a0', 3.0);                // luz principal quente, da frente/esquerda
  keyLight.position.set(-10, 14, 22);
  const rimLight = new THREE.DirectionalLight('#ff8fb0', 2.0);                // contraluz rosa do pôr do sol
  rimLight.position.set(6, 8, -14);
  const fillLight = new THREE.DirectionalLight('#9a8cff', 1.2);              // preenchimento frio da direita
  fillLight.position.set(12, 6, 16);

  for (const l of [keyLight, rimLight, fillLight]) scene.add(l);
  scene.add(new THREE.HemisphereLight('#d8cff5', '#3a4a22', 2.0));
  const avatarGroup = new THREE.Group();
  scene.add(avatarGroup);
  new GLTFLoader().load(AVATAR.url, gltf => {
    const root = gltf.scene;
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const k = AVATAR.height / size.y;
    root.scale.setScalar(k);
    box.setFromObject(root);
    root.position.set(-(box.min.x + box.max.x) / 2 + AVATAR.x, -box.min.y + domeY(Math.hypot(AVATAR.x, AVATAR.z)), -(box.min.z + box.max.z) / 2 + AVATAR.z);
    root.rotation.y = AVATAR.rotY;
    root.traverse(o => { if (o.isMesh) o.frustumCulled = false; if (o.isMesh && o.material) { o.material.fog = false; if (o.morphTargetDictionary && 'expr:happy' in o.morphTargetDictionary) exprMesh = o; feltHair(o); } });
    avatarGroup.add(root);
    avatarRoot = root;
    root.traverse(o => { if (o.isBone) mainRest[o.name] = o.quaternion.clone(); });   // pose de descanso (retarget das variantes)
    avatarWorld.value.set(AVATAR.x, 0, AVATAR.z);
    feltY.value = domeY(0) + AVATAR.height * FELT.minY;
    root.updateMatrixWorld(true);
    if (FACE.enabled) buildFaceDecal(root);
    // animações (Mixamo): idle em loop; outras por estado/ação
    if (gltf.animations && gltf.animations.length) {
      mixer = new THREE.AnimationMixer(root);
      for (const c of gltf.animations) { const a = mixer.clipAction(c); a.enabled = true; clips[c.name] = a; }
      // cancelamento de root motion: o quadril fica no lugar no plano (clipes como fall/walk deslocam a personagem)
      root.traverse(o => { if (o.isBone && /^(Hip|mixamorig:Hips|Hips)$/.test(o.name)) hipBone = o; if (o.isBone && /^(Head|mixamorig:Head)$/.test(o.name)) headBone = o; if (o.isBone && /^(Spine01|mixamorig:Spine1)$/.test(o.name)) spineBone = o; });
      if (hipBone) { root.updateMatrixWorld(true); hipBone.getWorldPosition(hipRest); hipRest.sub(avatarGroup.position); }
      mixer.addEventListener('finished', () => { if (clipOnce) { clipOnce = false; play(clipBase, { fade: 0.35 }); } });
      play(clipKey('idle') ? 'idle' : 'happy-idle', { fade: 0 });
    }
  }, undefined, e => err.textContent += 'avatar: ' + e.message + '\n');

  // ---------------------------------------------------------------- variantes: outro modelo pra um estado (ex.: meta cumprida → modelo feliz dançando)
  // Carregado só quando pedido; troca a malha inteira e toca o próprio clipe em loop. A principal continua no lugar, escondida.
  // arms: 'main' → o clipe da variante não mexe os braços (look_around do Tripo deixa em T); copia os braços da principal (idle),
  // retargetando pela diferença em relação à pose de descanso de cada rig (mesmo esqueleto Tripo, orientações de bind diferentes)
  // clipe toca uma vez quando o estado entra; depois a principal volta em idle (pedido da Pietra). loop: true mantém em loop.
  // pose: 'main' → sem clipe próprio: o corpo inteiro segue a principal (idle + postura doente procedural), retargetado osso a osso
  const VARIANTS = { dance: { url: 'avatar-dance.glb', clip: 'dance', doubleSide: true }, neutral: { url: 'avatar-neutral.glb', clip: 'look', arms: 'main' }, tired: { url: 'avatar-tired.glb', pose: 'main' }, sick: { url: 'avatar-sick.glb', pose: 'main' },
                     radiant: { url: 'avatar-radiant.glb', clip: 'look', arms: 'main' },
                     dead: { url: 'avatar-dead.glb', clip: 'fall', hold: true } };   // hold: toca uma vez e trava no último quadro
  const ARM_BONES = ['L_Upperarm', 'L_Forearm', 'L_Hand', 'R_Upperarm', 'R_Forearm', 'R_Hand'];   // sem clavícula/twists: o rig da variante já os posiciona
  const mainRest = {}, mainBones = {};
  const tmpQR = new THREE.Quaternion();
  function retargetArms(v) {
    if (!(v.arms || v.pose) || !avatarRoot) return;
    if (!mainBones.ready) { avatarRoot.traverse(o => { if (o.isBone) mainBones[o.name] = o; }); mainBones.ready = true; }
    const names = v.pose ? Object.keys(v.bones) : ARM_BONES;
    for (const n of names) {
      const src = mainBones[n], dst = v.bones[n], rs = mainRest[n], rd = v.rest[n];
      if (!src || !dst || !rs || !rd) continue;
      tmpQR.copy(rs).invert().multiply(src.quaternion);              // quanto o clipe da principal girou a partir do descanso
      dst.quaternion.copy(rd).multiply(tmpQR);                       // mesma rotação a partir do descanso da variante
    }
  }
  const variants = {};
  let activeVariant = null;
  function loadVariant(name) {
    const def = VARIANTS[name];
    if (!def) return Promise.resolve(null);
    if (variants[name]) return variants[name].ready;
    const v = variants[name] = { root: null, mixer: null, ready: null };
    v.ready = new Promise(res => new GLTFLoader().load(def.url, gltf => {
      const root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      root.scale.setScalar(AVATAR.height / size.y);
      box.setFromObject(root);
      root.position.set(-(box.min.x + box.max.x) / 2 + AVATAR.x, -box.min.y + domeY(Math.hypot(AVATAR.x, AVATAR.z)), -(box.min.z + box.max.z) / 2 + AVATAR.z);
      root.rotation.y = AVATAR.rotY;
      if (def.lie) {                                                     // deita: gira 90° e reassenta no chão pela caixa nova
        root.rotation.set(-Math.PI / 2, Math.PI / 2, 0, 'YXZ'); root.updateMatrixWorld(true);   // deita de costas (X) e vira 90° (Y): corpo atravessado pra câmera
        const b2 = new THREE.Box3().setFromObject(root);
        root.position.y += (domeY(0) + 0.25) - b2.min.y;
        root.position.x += AVATAR.x - (b2.min.x + b2.max.x) / 2;
        root.position.z += AVATAR.z - (b2.min.z + b2.max.z) / 2 + 1.0;
      }
      // dança: a malha abre em cabelo/axila/short e mostrava o lado de dentro (escuro). Dupla face pinta o avesso com a textura.
      // só a basecolor: o normal/roughness do export HD do Tripo dava losangos nas pálpebras e contorno escuro depois da simplificação
      root.traverse(o => { if (o.isMesh) o.frustumCulled = false; if (o.isMesh && o.material) { const m0 = o.material; m0.fog = false; m0.normalMap = null; m0.roughnessMap = null; m0.metalnessMap = null; m0.metalness = 0; feltHair(o, { tint: false }); if (def.doubleSide) o.material.side = THREE.DoubleSide; } });
      root.visible = false;
      avatarGroup.add(root);
      v.root = root; v.arms = def.arms === 'main'; v.pose = def.pose === 'main'; v.static = !!def.lie; v.bones = {}; v.rest = {};
      root.traverse(o => { if (o.isBone) { v.bones[o.name] = o; v.rest[o.name] = o.quaternion.clone(); } });
      root.updateMatrixWorld(true);
      if (v.bones.Hip) { v.hipRest = v.bones.Hip.getWorldPosition(new THREE.Vector3()).sub(avatarGroup.position); }   // pro cancelamento de root motion (queda/dança deslocam)
      if (gltf.animations.length && !v.pose && !v.static) {
        v.mixer = new THREE.AnimationMixer(root);
        const c = gltf.animations.find(a => a.name.toLowerCase().includes(def.clip)) || gltf.animations[0];
        v.action = v.mixer.clipAction(c);
        if (def.loop) v.action.setLoop(THREE.LoopRepeat, Infinity);
        else if (def.hold) { v.action.setLoop(THREE.LoopOnce, 1); v.action.clampWhenFinished = true; v.hold = true; }
        else { v.action.setLoop(THREE.LoopOnce, 1); v.action.clampWhenFinished = false; v.mixer.addEventListener('finished', () => { v.done = true; }); }
      }
      res(v);
    }, undefined, e => { err.textContent += 'variante: ' + e.message + '\n'; res(null); }));
    return v.ready;
  }
  async function setVariant(name) {
    if (name === undefined || name === activeVariant) return;           // undefined: não mexe
    activeVariant = name;
    const v = name ? await loadVariant(name) : null;
    if (activeVariant !== name) return;                                // mudou de ideia enquanto carregava
    if (v && v.action) { v.done = false; v.action.reset().play(); }
    syncVariantVisibility();
  }
  // a variante é o "fundo" do estado; reações, passos e a queda tocam na principal (que tem os 19 clipes), depois a variante volta
  function syncVariantVisibility() {
    const av = activeVariant && variants[activeVariant];
    const busy = clipOnce || !!walkTarget || keyWalking || (held && !(av && (av.static || av.hold)));   // morta: o modelo dela substitui a queda travada da principal
    const showMain = !av || !av.root || av.done || busy;
    if (avatarRoot) avatarRoot.visible = showMain;
    for (const [k, x] of Object.entries(variants)) if (x.root) x.root.visible = !showMain && k === activeVariant;
  }


  // ---------------------------------------------------------------- girar a cena (arrastar), zoom leve (scroll)
  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(lookTarget);
  controls.enablePan = false;
  controls.enableDamping = true; controls.dampingFactor = 0.06;
  controls.minDistance = 22; controls.maxDistance = 48;
  frameFor(innerWidth / innerHeight, true);
  controls.minPolarAngle = Math.PI * 0.32; controls.maxPolarAngle = Math.PI * 0.52;   // nem de cima, nem por baixo
  controls.rotateSpeed = 0.6; controls.zoomSpeed = 0.5;
  controls.update();

  // ---------------------------------------------------------------- andar até o clique (videogame)
  const WALK = { speed: 3.6, turnSpeed: 6, maxR: 11, clip: 'walk', step: 2.4, stepMode: true };   // stepMode: dois passos curtos (2.4 un.) por clique/tecla
  let walkTarget = null, avatarRoot = null, walkYaw = 0;
  function walkTo(x, z) {
    if (WALK.stepMode && walkTarget) return;                           // já está dando o passo: ignora cliques extras
    if (WALK.stepMode) {                                               // um passo na direção do clique
      const p = avatarGroup.position, dx = x - p.x, dz = z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.2) return;
      const st = Math.min(d, WALK.step);
      x = p.x + dx / d * st; z = p.z + dz / d * st;
    }
    const r = Math.hypot(x, z);
    if (r > WALK.maxR) { x *= WALK.maxR / r; z *= WALK.maxR / r; }
    walkTarget = new THREE.Vector3(x, 0, z);
    if (clipKey(WALK.clip)) play(WALK.clip, { fade: 0.25, transient: true });
  }
  function updateWalk(dt) {
    if (!avatarRoot) return;
    const p = avatarGroup.position;
    if (walkTarget) {
      const dx = walkTarget.x - p.x, dz = walkTarget.z - p.z, d = Math.hypot(dx, dz);
      if (d > 0.3) {                                                   // só vira enquanto ainda tem caminho
        const yaw = Math.atan2(dx, dz);                                // frente = +z
        let dy = yaw - walkYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
        walkYaw += dy * Math.min(1, dt * WALK.turnSpeed);
      }
      const step = Math.min(d, WALK.speed * dt);
      if (d > 0.05) { p.x += dx / d * step; p.z += dz / d * step; }
      if (d <= 0.08) { walkTarget = null; play(clipBase, { fade: 0.35 }); }
    }
    p.y = (uLand.value > 0.5 ? hillYJS(p.x, p.z) : groundYAt(Math.hypot(p.x, p.z))) - domeY(0);   // segue o relevo (o pulinho soma por cima)
    avatarGroup.rotation.y = walkYaw;
    avatarWorld.value.set(p.x, 0, p.z);                                // a grama abre onde ela está
  }
  // teclado: setas / WASD, direção relativa à câmera
  const keys = new Set();
  addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT') return;
    const k = e.key.toLowerCase();
    if (!['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(k)) return;
    e.preventDefault();
    if (WALK.stepMode) { if (e.repeat) return; stepKey(k); return; }
    keys.add(k);
  });
  function stepKey(k) {                                                // um passo relativo à câmera
    const f = (k === 'arrowup' || k === 'w') ? 1 : (k === 'arrowdown' || k === 's') ? -1 : 0;
    const r = (k === 'arrowright' || k === 'd') ? 1 : (k === 'arrowleft' || k === 'a') ? -1 : 0;
    const az = controls.getAzimuthalAngle();
    const fwd = new THREE.Vector3(-Math.sin(az), 0, -Math.cos(az)), right = new THREE.Vector3(fwd.z, 0, -fwd.x);
    const dir = fwd.multiplyScalar(f).add(right.multiplyScalar(r)).normalize();
    const p = avatarGroup.position;
    walkTo(p.x + dir.x * WALK.step, p.z + dir.z * WALK.step);
  }
  addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
  let keyWalking = false;
  function updateKeys(dt) {
    let f = 0, r = 0;
    if (keys.has('arrowup') || keys.has('w')) f += 1;
    if (keys.has('arrowdown') || keys.has('s')) f -= 1;
    if (keys.has('arrowright') || keys.has('d')) r += 1;
    if (keys.has('arrowleft') || keys.has('a')) r -= 1;
    if (!f && !r) { if (keyWalking) { keyWalking = false; play(clipBase, { fade: 0.35 }); } return; }
    walkTarget = null;
    const az = controls.getAzimuthalAngle();                          // frente da câmera no plano
    const fwd = new THREE.Vector3(-Math.sin(az), 0, -Math.cos(az));
    const right = new THREE.Vector3(fwd.z, 0, -fwd.x);
    const dir = fwd.multiplyScalar(f).add(right.multiplyScalar(r)).normalize();
    const p = avatarGroup.position;
    const nx = p.x + dir.x * WALK.speed * dt, nz = p.z + dir.z * WALK.speed * dt;
    if (Math.hypot(nx, nz) <= WALK.maxR) { p.x = nx; p.z = nz; }
    const yaw = Math.atan2(dir.x, dir.z); let dy = yaw - walkYaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    walkYaw += dy * Math.min(1, dt * WALK.turnSpeed);
    if (!keyWalking) { keyWalking = true; if (clipKey(WALK.clip)) play(WALK.clip, { fade: 0.25, transient: true }); }
  }
  let pointerDown = null;
  renderer.domElement.addEventListener('pointerdown', e => { pointerDown = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  renderer.domElement.addEventListener('pointerup', e => {
    if (!pointerDown) return;
    const moved = Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y);
    const quick = performance.now() - pointerDown.t < 400;
    pointerDown = null;
    if (moved > 6 || !quick || LOW) return;                            // arraste (giro da câmera) não é clique; no celular não anda
  });
  function clickAt(cx, cy) {
    const n = new THREE.Vector2((cx / innerWidth) * 2 - 1, -(cy / innerHeight) * 2 + 1);
    const rc = new THREE.Raycaster(); rc.setFromCamera(n, camera);
    let hit = rc.intersectObject(uLand.value > 0.5 ? hillMesh : domeMesh, false)[0];
    if (!hit) {                                                        // fora da ilha: usa o plano do chão e limita ao raio
      const pt = new THREE.Vector3();
      if (rc.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), pt)) hit = { point: pt };
    }
    if (hit) walkTo(hit.point.x, hit.point.z);
    return hit && hit.point;
  }

  // ---------------------------------------------------------------- mouse no plano do chão
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  const lastGrass = new THREE.Vector3(1e9, 0, 1e9);
  const lastWater = new THREE.Vector3(1e9, 0, 1e9);
  addEventListener('mousemove', e => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      const dGrass = Math.hypot(hit.x - lastGrass.x, hit.z - lastGrass.z);
      if (Math.hypot(hit.x, hit.z) < 11 && hooks.onGrass && lastGrass.x < 1e8) hooks.onGrass(Math.min(1, dGrass / 1.5));
      lastGrass.copy(hit);
      mouseWorld.value.copy(hit);
    }
    if (raycaster.ray.intersectPlane(waterPlane, hit) && Math.hypot(hit.x, hit.z) > 13.5) {
      const now = clock.elapsedTime;
      if (hooks.onWater && lastWater.x < 1e8) hooks.onWater(Math.min(1, Math.hypot(hit.x - lastWater.x, hit.z - lastWater.z) / 2.0));
      lastWater.copy(hit);
      if (hit.distanceTo(lastRipple) > 1.2 || now - lastRipple > 0.25) {
        if (hit.distanceTo(lastRipple) > 0.6) { addRipple(hit.x, hit.z, 2.0); lastRipple.copy(hit); lastRippleT = now; if (hooks.onRipple) hooks.onRipple(1); }
      }
    }
  });
  addEventListener('mouseleave', () => mouseWorld.value.set(99999, 0, 99999));
  function onResize() {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    frameFor(camera.aspect);
  }
  addEventListener('resize', onResize);
  addEventListener('orientationchange', () => setTimeout(onResize, 300));
  if (window.visualViewport) visualViewport.addEventListener('resize', onResize);   // iOS: barra do Safari some/aparece

  // ---------------------------------------------------------------- loop
  await renderer.computeAsync(computeInit);
  let bounce = 0;                                   // segundos restantes do pulinho de reação
  let reseed = false;
  let deadTarget = 0;
  function cancelRootMotion(root, hip, rest) {
    root.updateMatrixWorld(true);
    const hipW = hip.getWorldPosition(hipNow);
    const rootW = root.getWorldPosition(tmpV1);
    const off = tmpV2.copy(hipW).sub(rootW);                            // quadril em relação à raiz, no mundo
    const yaw = avatarGroup.rotation.y;
    const restRot = tmpV3.set(rest.x * Math.cos(yaw) + rest.z * Math.sin(yaw), 0, -rest.x * Math.sin(yaw) + rest.z * Math.cos(yaw));
    const target = tmpV4.copy(avatarGroup.position).add(restRot).sub(off);   // onde a raiz tem que estar pro quadril ficar no lugar
    target.y = rootW.y;
    avatarGroup.worldToLocal(target);
    root.position.x = target.x; root.position.z = target.z;
  }
  function simulate(dt) {
    // expressão: aproxima do alvo com easing; shape key e textura andam juntas
    if (mixer) mixer.update(dt);
    syncVariantVisibility();
    for (const x of Object.values(variants)) if (x.root && x.root.visible && x.mixer) { x.mixer.update(dt); if (x.hipRest) cancelRootMotion(x.root, x.bones.Hip, x.hipRest); }
    sadNow += (sadness - sadNow) * Math.min(1, dt * 2);
    // doente: tronco curvado + respiração pesada + balanço lento (tudo aditivo, sobre o clipe)
    if (spineBone && sadNow > 0.001) {
      if (!spineInit || !spineBone.quaternion.equals(spineLast)) spineBase.copy(spineBone.quaternion);
      spineInit = true;
      const tt = clock.elapsedTime;
      const breathe = Math.sin(tt * 2.2) * 0.05 * sadNow;                                  // respiração curta e pesada
      const sway = Math.sin(tt * 0.9) * 0.06 * sadNow;                                     // tonta
      const pq = spineBone.parent.getWorldQuaternion(tmpQ1);
      const bend = tmpQ3.setFromEuler(new THREE.Euler(0.22 * sadNow + breathe, 0, sway));
      const worldTilt = tmpQ2.copy(avatarGroup.quaternion).multiply(bend).multiply(tmpQ4.copy(avatarGroup.quaternion).invert());
      tmpQ5.copy(pq).invert().multiply(worldTilt).multiply(pq);
      spineBone.quaternion.copy(tmpQ5).multiply(spineBase);
      spineLast.copy(spineBone.quaternion);
    }
    if (headBone) {                                                  // cabeça baixa: aditivo sobre o que o clipe deu neste frame, sem acumular
      if (!headInit || !headBone.quaternion.equals(headLast)) headBase.copy(headBone.quaternion);   // o mixer escreveu: nova base
      headInit = true;
      // inclinação "queixo no peito" no espaço do mundo (eixo X do grupo), convertida pro espaço do pai do osso
      const pq = headBone.parent.getWorldQuaternion(tmpQ1);
      const worldTilt = tmpQ2.copy(avatarGroup.quaternion).multiply(tmpQ3.setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.4 * sadNow)).multiply(tmpQ4.copy(avatarGroup.quaternion).invert());
      headTilt.copy(pq).invert().multiply(worldTilt).multiply(pq);
      headBone.quaternion.copy(headTilt).multiply(headBase);
      headLast.copy(headBone.quaternion);
    }
    if (hipBone && avatarRoot) cancelRootMotion(avatarRoot, hipBone, hipRest);   // mantém o quadril sobre a posição do grupo (só X/Z), sem acumular
    uExpr.value += (exprTarget - uExpr.value) * Math.min(1, dt * 5);
    if (exprMesh) exprMesh.morphTargetInfluences[exprMesh.morphTargetDictionary['expr:happy']] = uExpr.value;
    if (bounce > 0) {
      bounce = Math.max(0, bounce - dt);
      const k = Math.sin((1 - bounce / 0.55) * Math.PI);
      avatarGroup.scale.set(1 - k * 0.04, 1 + k * 0.06, 1 - k * 0.04);
    }
    updateKeys(dt);
    updateWalk(dt);
    if (bounce > 0) avatarGroup.position.y += Math.max(0, Math.sin((1 - bounce / 0.55) * Math.PI)) * 1.3;
    for (const x of Object.values(variants)) if (x.root && x.root.visible) retargetArms(x);   // depois da postura procedural e do quadril
  }

  let frameNo = 0;
  renderer.setAnimationLoop(() => { try {
    if (LOW && (++frameNo & 1) && !document.hidden) return;   // celular: 30 fps bastam pra cena calma e poupam bateria
    const dt = Math.min(clock.getDelta(), 0.05);
    uTime.value = clock.elapsedTime;
    // pingos espontâneos na água (fora da ilha), a cada 1.2 a 3 s
    if (clock.elapsedTime > nextDrop) {
      const n = dropRate > 0 ? 2 : 1;                                     // chuva: mais de uma marca por vez
      for (let k = 0; k < n; k++) {
        const a = Math.random() * Math.PI * 2, r = 13 + Math.random() * 20;
        // sem chuva: pingo discreto no estilo original (w > 1); com chuva: anel largo pintado (w <= 1)
        addRipple(Math.cos(a) * r, Math.sin(a) * r, dropRate > 0 ? 0.45 + Math.random() * 0.4 : 1.35 + Math.random() * 0.4);
        if (hooks.onRipple && dropRate === 0) hooks.onRipple(0.5);
      }
      nextDrop = clock.elapsedTime + (dropRate > 0 ? dropRate * (0.5 + Math.random()) : 1.2 + Math.random() * 1.8);
    }
    camSphereWorld.value.set(camera.position.x, 0, camera.position.z);
    const t = clock.elapsedTime;
    for (const { g, f } of flowers) {
      g.rotation.z = Math.sin(t * P.windSpeed * 0.9 + f.phase) * 0.08 * (1 + P.windAmplitude) + flowerDroop * 0.9 * (f.phase % 2 ? 1 : -1);   // murcha: tomba de lado
      g.rotation.x = Math.cos(t * P.windSpeed * 0.6 + f.phase) * 0.05 + flowerDroop * 0.5;
      g.scale.setScalar(1 - flowerDroop * 0.35);
    }
    simulate(dt);
    controls.update();
    rain.rotation.y = controls.getAzimuthalAngle();
    rain.visible = uRain.value > 0.01;
    if (reseed) { reseed = false; renderer.compute(computeInit); }
    uDead.value += (deadTarget - uDead.value) * Math.min(1, dt * 0.9);   // areia chega devagar, junto com a queda
    renderer.compute(computeUpdate);
    renderer.render(scene, camera);
  } catch (e) { err.textContent = 'loop: ' + (e.stack || e); throw e; } });

  function applyEnvironment() {
    const pal = blendPalette();
    scene.background = buildSkyTexture(pal);
    scene.fog.color.set(pal.midLow);
    C.background.value.set(pal.below);
    C.fog.value.set(pal.midLow);
    W.sky.value.set(pal.midLow);
    const sickL = 1 - Math.min(1, Math.max(0, (ENV.health - 0.2) / 0.6));
    const night = ENV.weights.night, dim = (1 - night * 0.55 - ENV.clouds * 0.2 - ENV.rain * 0.15) * (1 - sickL * 0.25);
    uDim.value = 1 - night * 0.6 - ENV.clouds * 0.12 - ENV.rain * 0.08;
    uNight.value = Math.max(0, night - ENV.clouds * 0.8 - ENV.rain);   // nuvem/chuva escondem as estrelas
    uRain.value = ENV.rain;
    keyLight.intensity = 3.0 * dim; rimLight.intensity = 2.0 * (1 - night * 0.3); fillLight.intensity = 1.2 * dim;
    const dusk = ENV.weights.dusk;
    keyLight.color.set(new THREE.Color(night > 0.5 ? '#b9c3ff' : '#ffc3a0').lerp(new THREE.Color('#ff9a5c'), dusk));
    rimLight.color.set(new THREE.Color('#ff8fb0').lerp(new THREE.Color('#ffb070'), dusk));
    const day = ENV.weights.day + ENV.weights.dawn * 0.6;
    W.deep.value.set(new THREE.Color('#6f86c8').lerp(new THREE.Color('#7a93cc'), day).lerp(new THREE.Color('#6d5fa8'), dusk).lerp(new THREE.Color('#2c3a72'), night).lerp(new THREE.Color('#8a94ad'), ENV.clouds * 0.5));
    uSkyMix.value = 0.5 - day * 0.2;                                   // de dia o mar espelha menos o céu: mais contraste no horizonte
    W.shallow.value.set(new THREE.Color('#9fd2cf').lerp(new THREE.Color('#d9a8a0'), dusk * 0.6));
    dropRate = ENV.rain > 0.05 ? 0.09 / ENV.rain : 0;                // chuva: marcas frequentes na água
  }
  let dropRate = 0;

  return {
    scene, camera, renderer, controls, avatarGroup, hooks, grass, setVariant,
    debugVariant() { return { activeVariant, clipOnce, walk: !!walkTarget, keyWalking, held, loaded: Object.fromEntries(Object.entries(variants).map(([k, v]) => [k, !!v.root])) }; },
    get rain() { return ENV.rain; },
    setEnvironment({ weights, clouds = 0, rain = 0 }) {
      if (weights) ENV.weights = weights;
      ENV.clouds = clouds; ENV.rain = rain;
      applyEnvironment();
    },
    react(clip = 'jump', { bounce: doBounce = true } = {}) { if (doBounce && !held) bounce = 0.55; play(clipKey(clip) ? clip : 'greet', { once: true, fade: 0.25 }); },
    hold(clip) { play(clip, { hold: true, fade: 0.3 }); },
    revive() { held = false; play(clipBase, { fade: 0.5 }); },
    setBaseClip, walkTo, clickAt, simulate,
    debugPos() { const hp = new THREE.Vector3(); if (hipBone) hipBone.getWorldPosition(hp); return { group: avatarGroup.position.toArray().map(v => +v.toFixed(2)), root: avatarRoot ? avatarRoot.position.toArray().map(v => +v.toFixed(3)) : null, hip: hp.toArray().map(v => +v.toFixed(2)), target: walkTarget && [walkTarget.x, walkTarget.z], yaw: +walkYaw.toFixed(2) }; },
    setSadness(a) { sadness = Math.max(0, Math.min(1, a)); },
    async setLandscape(name) {
      const hill = name === 'hill';
      uLand.value = hill ? 1 : 0;
      uField.value = hill ? HILL.field : 28;
      hillMesh.visible = hill; water.visible = true; domeMesh.visible = !hill;
      water.position.y = hill ? -HILL.depth + 0.8 : WATER.y; uWaterY.value = water.position.y;
      waterPlane.constant = -water.position.y;
      WALK.maxR = hill ? 11 : 9.2;                                   // sempre dentro do enquadramento
      for (const { g, f } of flowers) { const x = hill ? f.xh : f.x, z = hill ? f.zh : f.z; g.position.set(x, hill ? hillYJS(x, z) : domeY(Math.hypot(x, z)), z); }
      reseed = true;                                                 // re-semeia a grama na área nova (dentro do frame)
    },
    setHealth(h) { uHealth.value = Math.max(0, Math.min(1, h)); deadTarget = uHealth.value < 0.03 ? 1 : 0; flowersHealth(uHealth.value); sadness = 1 - Math.min(1, Math.max(0, (uHealth.value - 0.2) / 0.5)); if (ENV.health !== uHealth.value) { ENV.health = uHealth.value; applyEnvironment(); } if (mixer) mixer.timeScale = 0.7 + 0.3 * Math.min(1, uHealth.value / 0.7); },
    get walking() { return !!walkTarget || keyWalking; },
    play, get clips() { return Object.keys(clips); },
    setExpression,
    faceTune(opts) { Object.assign(FACE, opts); if (faceMesh) buildFaceDecal(faceMesh.parent); },
    // posição de tela (px) de um ponto acima da cabeça, pra ancorar UI
    headScreen() {
      const v = new THREE.Vector3(AVATAR.x, domeY(0) + AVATAR.height * 1.04, AVATAR.z).project(camera);
      return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight };
    },
  };

}
