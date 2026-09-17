// Modelo de cuidado: metas calibradas pela usuária, check-ins com foto, sinais vitais derivados em tempo real.
// Persistência local: metas/check-ins em localStorage, fotos em IndexedDB. Nada sai do dispositivo.

const KEY_GOALS = 'companion:goals', KEY_CHECKINS = 'companion:checkins';
const H = 3600e3, D = 24 * H;

export const DEFAULT_GOALS = {
  started: null,                                   // timestamp de início do jogo (null = ainda calibrando)
  period: { start: null, end: null },              // 'YYYY-MM-DD' escolhidos no calendário
  exercise: { perWeek: 3 },
  walk: { perWeek: 2 },
  meals: {
    breakfast: { on: true, from: '07:00', to: '10:00' },
    lunch:     { on: true, from: '12:00', to: '14:30' },
    snack:     { on: true, from: '15:30', to: '18:00' },
    dinner:    { on: true, from: '19:00', to: '21:30' },
  },
  calories: { perDay: 1800 },
  sleep: { hours: 7.5 },
  water: { liters: 2.0 },
};

export const MEAL_LABEL = { breakfast: 'Café da manhã', lunch: 'Almoço', snack: 'Lanche', dinner: 'Jantar' };
export const TYPE_LABEL = { ...MEAL_LABEL, exercise: 'Exercício', walk: 'Caminhada', water: 'Água', sleep: 'Sono' };
export const NEEDS_PHOTO = new Set(['breakfast', 'lunch', 'snack', 'dinner', 'exercise', 'walk']);

// ---------------------------------------------------------------- storage
export function loadGoals() {
  try { return { ...structuredClone(DEFAULT_GOALS), ...JSON.parse(localStorage.getItem(KEY_GOALS) || '{}') }; } catch (e) { return structuredClone(DEFAULT_GOALS); }
}
export function saveGoals(g) { try { localStorage.setItem(KEY_GOALS, JSON.stringify(g)); } catch (e) {} }
export function loadCheckins() { try { return JSON.parse(localStorage.getItem(KEY_CHECKINS) || '[]'); } catch (e) { return []; } }
function saveCheckins(list) { try { localStorage.setItem(KEY_CHECKINS, JSON.stringify(list.slice(-2000))); } catch (e) {} }

let dbp = null;
function db() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    const r = indexedDB.open('companion', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('photos');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  return dbp;
}
export async function savePhoto(id, blob) {
  try { const d = await db(); await new Promise((res, rej) => { const t = d.transaction('photos', 'readwrite'); t.objectStore('photos').put(blob, id); t.oncomplete = res; t.onerror = () => rej(t.error); }); } catch (e) {}
}
export async function loadPhoto(id) {
  try { const d = await db(); return await new Promise((res, rej) => { const t = d.transaction('photos'); const q = t.objectStore('photos').get(id); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); } catch (e) { return null; }
}

// ---------------------------------------------------------------- estimativa de calorias (plugável)
// v1: stub que devolve null (a usuária digita). Produção: Worker com modelo de visão (Claude) recebendo a foto.
export let estimateCalories = async (blob) => null;
export function setCalorieEstimator(fn) { estimateCalories = fn; }

// ---------------------------------------------------------------- check-in
export async function checkin({ type, photo = null, amount = null, kcal = null, at = Date.now() }) {
  const id = `${type}-${at}-${Math.random().toString(36).slice(2, 7)}`;
  const c = { id, type, at, amount, kcal, photo: !!photo };
  if (photo) await savePhoto(id, photo);
  const list = loadCheckins(); list.push(c); saveCheckins(list);
  return c;
}
export function removeCheckin(id) { saveCheckins(loadCheckins().filter(c => c.id !== id)); }

// ---------------------------------------------------------------- tempo
const clamp = (v, a = 0, b = 100) => Math.max(a, Math.min(b, v));
function startOfDay(t) { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); }
function startOfWeek(t) { const d = new Date(startOfDay(t)); const dow = (d.getDay() + 6) % 7; return d.getTime() - dow * D; }   // segunda
function todayAt(hhmm, t) { const [h, m] = hhmm.split(':').map(Number); return startOfDay(t) + h * H + m * 60e3; }

// ---------------------------------------------------------------- sinais vitais
export function vitals(goals, checkins, now = Date.now()) {
  const since = t => checkins.filter(c => c.at >= t && c.at <= now);
  const today = since(startOfDay(now)), week = since(startOfWeek(now));

  // hidratação: soma de hoje contra a meta, descontando o que "evapora" com o tempo desde cada gole
  let water = 0;
  for (const c of today.filter(c => c.type === 'water')) water += (c.amount || 0) * Math.max(0, 1 - (now - c.at) / (14 * H));
  const hidratacao = clamp(100 * water / Math.max(0.1, goals.water.liters));

  // saciedade: última refeição decai em ~4.5 h; calorias do dia vs alvo ajustam pra cima/baixo
  const meals = today.filter(c => c.type in MEAL_LABEL).sort((a, b) => b.at - a.at);
  let saciedade = 8;
  if (meals.length) {
    const hoursAgo = (now - meals[0].at) / H;
    saciedade = 100 * Math.max(0, 1 - hoursAgo / 4.5) + 8;
  }
  const kcal = today.reduce((a, c) => a + (c.kcal || 0), 0);
  const kcalRatio = kcal / Math.max(1, goals.calories.perDay);
  if (kcalRatio > 1.15) saciedade *= 0.85;                       // passou do alvo: pesada
  saciedade = clamp(saciedade);

  // energia: último sono (registrado hoje de manhã ou ontem à noite) vs meta, caindo com as horas acordada
  const sleeps = since(now - 36 * H).filter(c => c.type === 'sleep').sort((a, b) => b.at - a.at);
  let energia = 35;
  if (sleeps.length) {
    const ratio = Math.min(1.2, (sleeps[0].amount || 0) / Math.max(1, goals.sleep.hours));
    const awake = (now - sleeps[0].at) / H;
    energia = 100 * ratio * Math.max(0.25, 1 - awake / 18);
  }
  energia = clamp(energia);

  // movimento: progresso semanal (exercício + caminhada) e recência da última atividade
  const ex = week.filter(c => c.type === 'exercise').length, wk = week.filter(c => c.type === 'walk').length;
  const target = goals.exercise.perWeek + goals.walk.perWeek;
  const progress = target ? (ex + wk) / target : 1;
  const dow = ((new Date(now).getDay() + 6) % 7) + 1;              // 1..7
  const expected = target * dow / 7;                               // quanto já devia ter feito a essa altura da semana
  const last = since(now - 7 * D).filter(c => c.type === 'exercise' || c.type === 'walk').sort((a, b) => b.at - a.at)[0];
  const recency = last ? Math.max(0.3, 1 - (now - last.at) / (72 * H)) : 0.3;
  const movimento = clamp(100 * Math.min(1.2, (ex + wk) / Math.max(0.5, expected)) * recency);

  // carência: nas primeiras 8 h depois de iniciar, ela nasce bem e vai passando a depender dos registros
  let list = { hidratacao, energia, saciedade, movimento };
  if (goals.started) {
    const grace = clamp(1 - (now - goals.started) / (8 * H), 0, 1);
    for (const k in list) list[k] = Math.max(list[k], 70 * grace);
  }
  const avg = (list.hidratacao + list.energia + list.saciedade + list.movimento) / 4;
  return { ...list, avg, kcal, water, week: { exercise: ex, walk: wk }, mealsToday: meals.map(m => m.type) };
}

// ---------------------------------------------------------------- o que está pendente agora (gera alertas)
export function pending(goals, checkins, now = Date.now()) {
  const out = [];
  if (!goals.started) return out;                                     // sem meta ativa não há o que cobrar
  const today = checkins.filter(c => c.at >= startOfDay(now) && c.at <= now);
  for (const [k, m] of Object.entries(goals.meals)) {
    if (!m.on) continue;
    const from = todayAt(m.from, now), to = todayAt(m.to, now);
    if (goals.started && to < goals.started) continue;                 // janela acabou antes de o jogo começar: não cobra
    const done = today.some(c => c.type === k);
    if (!done && now >= from) out.push({ type: k, late: now > to, title: now > to ? `${MEAL_LABEL[k]} atrasado` : `Hora do ${MEAL_LABEL[k].toLowerCase()}`, body: now > to ? 'A janela passou. Registra assim que comer.' : 'Registra com uma foto do prato.' });
  }
  const v = vitals(goals, checkins, now);
  const fresh = goals.started && now - goals.started < 2 * H;         // recém-iniciado: só cobra refeição da janela atual
  if (!fresh && v.hidratacao < 40) out.push({ type: 'water', title: 'Beber água', body: `Hoje: ${v.water.toFixed(1)} L de ${goals.water.liters} L.` });
  const weekTarget = goals.exercise.perWeek + goals.walk.perWeek;
  const dow = ((new Date(now).getDay() + 6) % 7) + 1;
  if (!fresh && weekTarget && (v.week.exercise + v.week.walk) < Math.floor(weekTarget * dow / 7)) out.push({ type: 'exercise', title: 'Mexer o corpo', body: `Semana: ${v.week.exercise}/${goals.exercise.perWeek} exercícios, ${v.week.walk}/${goals.walk.perWeek} caminhadas.` });
  const hour = new Date(now).getHours();
  const sleptToday = today.some(c => c.type === 'sleep');
  if (!fresh && !sleptToday && hour >= 6 && hour < 12) out.push({ type: 'sleep', title: 'Como foi a noite?', body: 'Registra quantas horas dormiu.' });
  return out;
}

// ---------------------------------------------------------------- calendário: dia completo, sequência, período
export const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const fromKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };

// dia completo = todas as refeições ligadas + água ≥ 75% da meta + sono registrado
export function dayStatus(goals, checkins, dayStartTs) {
  const end = dayStartTs + D;
  const list = checkins.filter(c => c.at >= dayStartTs && c.at < end);
  const meals = Object.entries(goals.meals).filter(([, m]) => m.on).map(([k]) => k);
  const mealsDone = meals.filter(k => list.some(c => c.type === k)).length;
  const water = list.filter(c => c.type === 'water').reduce((a, c) => a + (c.amount || 0), 0);
  const slept = list.some(c => c.type === 'sleep');
  const items = meals.length + 2;
  const done = mealsDone + (water >= goals.water.liters * 0.75 ? 1 : 0) + (slept ? 1 : 0);
  return { done, items, complete: done === items, any: list.length > 0 };
}
export function streak(goals, checkins, now = Date.now()) {
  let n = 0, d = startOfDay(now);
  if (dayStatus(goals, checkins, d).complete) { n++; }
  d -= D;
  while (dayStatus(goals, checkins, d).complete) { n++; d -= D; }
  return n;
}
export function periodInfo(goals, now = Date.now()) {
  const p = goals.period || {};
  if (!p.start || !p.end) return null;
  const s = fromKey(p.start), e = fromKey(p.end), t = startOfDay(now);
  const total = Math.round((e - s) / D) + 1;
  const dayN = Math.round((t - s) / D) + 1;
  const left = Math.max(0, Math.round((e - t) / D));
  return { start: s, end: e, total, dayN: Math.max(0, Math.min(total, dayN)), left, active: t >= s && t <= e };
}

// ---------------------------------------------------------------- situação da meta: dias perdidos, morte, sucesso
// dia perdido = dia do período (já encerrado) que não foi completo. Morte = metade ou mais dos dias do período perdidos.
export function goalStatus(goals, checkins, now = Date.now()) {
  const info = periodInfo(goals, now);
  if (!info || !goals.started) return null;
  const startDay = Math.max(info.start, startOfDay(goals.started));
  const todayTs = startOfDay(now);
  let lost = 0, complete = 0, elapsed = 0, lostRun = 0, completeRun = 0;
  for (let d = startDay; d < Math.min(todayTs, info.end + D); d += D) {          // só dias já encerrados
    elapsed++;
    const st = dayStatus(goals, checkins, d);
    if (st.complete) { complete++; completeRun++; lostRun = 0; } else { lost++; lostRun++; completeRun = 0; }
  }
  const lostRatio = lost / info.total;
  const dead = goals.dead || lostRatio >= 0.5;
  const finished = todayTs > info.end;
  return { ...info, lost, complete, elapsed, lostRun, completeRun, lostRatio, dead, finished, success: finished && !dead };
}

// ---------------------------------------------------------------- eventos (cada um dispara uma vez; memória em localStorage)
const KEY_SEEN = 'companion:seen';
function seenSet() { try { return new Set(JSON.parse(localStorage.getItem(KEY_SEEN) || '[]')); } catch (e) { return new Set(); } }
function markSeen(set) { try { localStorage.setItem(KEY_SEEN, JSON.stringify([...set].slice(-500))); } catch (e) {} }

// devolve eventos novos desde a última chamada: {kind, key, ...}
export function newEvents(goals, checkins, now = Date.now()) {
  if (!goals.started) return [];
  const seen = seenSet(); const out = [];
  const add = (kind, key, extra = {}) => { const k = kind + ':' + key; if (!seen.has(k)) { seen.add(k); out.push({ kind, key, ...extra }); } };
  const st = goalStatus(goals, checkins, now);
  const today = checkins.filter(c => c.at >= startOfDay(now) && c.at <= now);
  // ação perdida: janela da refeição fechou hoje sem registro (e a janela começou depois do início)
  for (const [k, m] of Object.entries(goals.meals)) {
    if (!m.on) continue;
    const to = todayAt(m.to, now);
    if (now > to && to > goals.started && !today.some(c => c.type === k)) add('missed', k + ':' + dayKey(now), { type: k });
  }
  if (st) {
    const y = startOfDay(now) - D;
    if (y >= Math.max(st.start, startOfDay(goals.started)) && y <= st.end) {
      const ys = dayStatus(goals, checkins, y);
      if (ys.complete) add(st.completeRun >= 3 ? 'daystreak' : 'daydone', dayKey(y), { run: st.completeRun });
      else add(st.lostRun >= 2 ? 'daylostrun' : 'daylost', dayKey(y), { run: st.lostRun });
    }
    if (st.dead) add('dead', 'goal:' + goals.started);
    else if (st.success) add('success', 'goal:' + goals.started);
  }
  markSeen(seen);
  return out;
}
