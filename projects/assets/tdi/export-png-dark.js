// Run in the prototype page (tdi-flow-map.html) with save-server on :8790.
// Rebuilds the Flow Overview, the participants table and the detail card
// with exactly the content of Pietra's composition PNG (image 8.png), then
// exports the dark set.
(async () => {
const save = (name, svg) => fetch('http://localhost:8790/save?name=' + name, {method:'POST', body: svg}).then(r => r.text());
const wait = ms => new Promise(r => setTimeout(r, ms));
const out = [];
document.documentElement.setAttribute('data-theme','dark');
document.documentElement.removeAttribute('data-accent');
document.querySelector('.app').style.gridTemplateColumns = '56px 250px 1134px';
document.querySelector('.app').style.width = '1440px';
select('lges-pack');

/* ---------- Flow Overview, exactly the PNG chain ---------- */
const CHAIN = [ // [id, label, tier, depth, high-risk badge]
  ['nikola','Nikola Motors Company','oem',0],
  ['lges','LG Energy Solution (LGES)','pack',1],
  ['catl','CATL (Contemporary Amperex Technology Co.)','cell',2],
  ['umicore1','Umicore S.A','cathode',3],
  ['huayou','Huayou Cobalt','precursor',4],
  ['jinchuan','Jinchuan Group Ltd','precursor',5],
  ['umicore2','Umicore S.A','refining',5],
  ['ningbo','Ningbo Congo','refining',6],
  ['cmoc','China Molybdenum Co.','refining',6,true],
  ['tfm','Tenke Fungurume Mining (TFM)','smelting',7,true],
  ['cdm','Congo Dongfang Mining (CDM)','smelting',7],
  ['tcc','Tengyuan Cobalt & Copper Resources (TCC)','artisanal',8],
  ['mikas','Minière de Kasombo (MIKAS)','artisanal',8],
  ['tshipuki','Tshipuki','mining',9,true],
  ['kamilombe','Kamilombe','mining',9],
  ['kamilombe2','Kamilombe2','mining',9],
  ['dinamitiere','Dinamitiere','mining',9],
  ['drain','Drain DCA','mining',9,true],
];
const CHAIN_EDGES = [['nikola','lges'],['lges','catl'],['catl','umicore1'],['umicore1','huayou'],['huayou','jinchuan'],['huayou','umicore2'],
  ['jinchuan','ningbo'],['umicore2','cmoc'],['ningbo','tfm'],['cmoc','cdm'],['tfm','tcc'],['cdm','mikas'],
  ['tcc','tshipuki'],['tcc','kamilombe'],['mikas','kamilombe2'],['mikas','dinamitiere'],['mikas','drain']];
const SELECTED = 'lges';

window.TDI_MINI = () => {
  TDI.readColors(); const C = TDI.C(), {g, rect, txt, iconG, el, edgePath, TIER} = TDI;
  const W = 96, H = 66, GX = 8, GY = 26, TILE = 30, pad = 24;
  // rows by depth, ordered by parent x
  const byId = Object.fromEntries(CHAIN.map(c => [c[0], {id:c[0], label:c[1], tier:c[2], depth:c[3], high:!!c[4], parents:[]}]));
  CHAIN_EDGES.forEach(([a,b]) => byId[b].parents.push(a));
  const pos = {}; const rows = d3.group(Object.values(byId), n => n.depth);
  [...rows.keys()].sort((a,b)=>a-b).forEach(d => {
    const list = rows.get(d).map(n => ({n, k: n.parents.length ? d3.mean(n.parents, p => pos[p].x) : 0})).sort((a,b)=>a.k-b.k);
    list.forEach((o,i) => { pos[o.n.id] = {x:(i-(list.length-1)/2)*(W+GX), y:d*(H+GY)}; });
  });
  const xs = Object.values(pos).map(p=>p.x), ys = Object.values(pos).map(p=>p.y);
  const x0 = d3.min(xs)-W/2, x1 = d3.max(xs)+W/2, y0 = d3.min(ys), y1 = d3.max(ys)+H;
  const wrap = (s, max=20) => { const words = s.split(' '), lines=['']; words.forEach(w => { if((lines[lines.length-1]+' '+w).trim().length > max && lines[lines.length-1]) lines.push(w); else lines[lines.length-1] = (lines[lines.length-1]+' '+w).trim(); }); return lines.slice(0,2); };
  let svg = '';
  CHAIN_EDGES.forEach(([a,b]) => { const A=pos[a], B=pos[b];
    svg += el('path',{id:`edge/${byId[a].label}→${byId[b].label}`, d:edgePath(A.x-x0+pad, A.y-y0+pad+TILE, B.x-x0+pad, B.y-y0+pad, 6), stroke:C.edge,'stroke-width':1.2, fill:'none'}); });
  Object.values(byId).forEach(n => { const p = pos[n.id], t = TIER[n.tier], sel = n.id===SELECTED, X = p.x-x0+pad-W/2, Y = p.y-y0+pad;
    let card = '';
    if(sel){ // wide selected card, icon left + label right, like the PNG
      const cw = 190, cx = X + W/2 - cw/2;
      card = g('mini/'+n.label,{transform:`translate(${cx},${Y})`},
        rect(0,0,cw,44,{rx:8,fill:C.accentSoft,stroke:C.accent,sw:1.5}) +
        rect(10,7,30,30,{rx:8,fill:t.color,opacity:.16}) + rect(10,7,30,30,{rx:8,stroke:t.color,opacity:.5}) + iconG(t.icon,17,14,16,t.color,2.2) +
        txt(50,27,n.label,{size:11,weight:600}));
      svg += card; return; }
    const solid = n.tier==='mining';
    const tile = solid
      ? rect(W/2-TILE/2,0,TILE,TILE,{rx:8,fill:t.color}) + iconG(t.icon,W/2-8,7,16,'#FFFFFF',2.2)
      : rect(W/2-TILE/2,0,TILE,TILE,{rx:8,fill:t.color,opacity:.16}) + rect(W/2-TILE/2,0,TILE,TILE,{rx:8,stroke:t.color,opacity:.5}) + iconG(t.icon,W/2-8,7,16,t.color,2.2);
    const bx = W/2+TILE/2, by = 2;
    const badge = n.high ? g('badge/high-risk',{}, el('circle',{cx:bx,cy:by,r:5.5,fill:C.badBg,stroke:C.bad,'stroke-width':1}) +
      el('path',{d:`M${bx},${by-2.6}V${by+0.6}`,stroke:C.bad,'stroke-width':1.4,'stroke-linecap':'round'}) + el('circle',{cx:bx,cy:by+2.4,r:.8,fill:C.bad})) : '';
    const lines = wrap(n.label);
    svg += g('mini/'+n.label,{transform:`translate(${X},${Y})`}, tile + badge + lines.map((l,i)=>txt(W/2,TILE+13+i*11,l,{size:9,weight:500,anchor:'middle'})).join(''));
  });
  return {w:x1-x0+pad*2, h:y1-y0+pad*2, svg, selX:pos[SELECTED].x-x0+pad};
};

/* ---------- Participants table, the PNG's seven rows ---------- */
window.TDI_ROWS = [
  {id:'lges-pack',   org:'LG Energy Solution (LGES)', pos:'Battery Pack Manufacturing', risk:'low'},
  {id:'catl-cell',   org:'CATL (Contemporary Amperex Technology Co.)', pos:'Battery Cell Manufacturing', risk:'low'},
  {id:'umicore-cat', org:'Umicore S.A', pos:'Battery Pack Manufacturing', risk:'low'},
  {id:'ningbo-ref',  org:'Ningbo Congo', pos:'Refinery', risk:'low'},
  {id:'tfm-sm',      org:'Tenke Fungurume Mining (TFM)', pos:'Smelting', risk:'medium'},
  {id:'tcc-ap',      org:'Tengyuan Cobalt & Copper Resources (TCC)', pos:'Artisanal Processing', risk:'low'},
  {id:'tshipuki-mn', org:'Tshipuki', pos:'Artisanal Mine Site', risk:'high'},
];

/* ---------- Detail card as in the PNG (Battery Pack, Medium, those flags) ---------- */
window.TDI_DETAIL = {id:'lges-pack', title:'LG Energy Solution (LGES)', risk:'medium', ccs:['CN','BE','GB','DE','JP','US','CD','ZM']};

/* ---------- exports ---------- */
setView('flow'); await wait(1500); fitFlow(false); await wait(600);
out.push(await save('TDI-dark-page-flow.svg', TDI.exportPage()));
{ TDI.readColors(); const f = TDI.flowGraph(); const pad = 40;
  out.push(await save('TDI-dark-flow-graph.svg', TDI.svgDoc(f.w+pad*2, f.h+pad*2, TDI.rect(0,0,f.w+pad*2,f.h+pad*2,{id:'bg',fill:TDI.C().ground}) + TDI.g('flow-graph',{transform:`translate(${pad},${pad})`}, f.svg)))); }
out.push(await save('TDI-dark-node-states.svg', TDI.exportStates()));
setView('map'); await wait(1500);
out.push(await save('TDI-dark-page-map.svg', TDI.exportPage()));
TDI.readColors(); const C = TDI.C();
{ const gl = TDI.globeSvg(360,360,280); out.push(await save('TDI-dark-globe.svg', TDI.svgDoc(720,720, TDI.rect(0,0,720,720,{id:'bg',fill:C.ground}) + gl.svg, gl.defs))); }
const comp = (name, w, h, inner) => save(name, TDI.svgDoc(w+48, h+48, TDI.rect(0,0,w+48,h+48,{id:'bg',fill:C.ground}) + TDI.g('component',{transform:'translate(24,24)'}, inner)));
out.push(await comp('TDI-dark-detail-card.svg', 1078, 160, TDI.detailCard(1078)));
{ const t = TDI.tableCard(1078, 12); out.push(await comp('TDI-dark-participants-table.svg', 1078, t.h, t.svg)); }
{ const m = window.TDI_MINI(); const mw = Math.ceil(m.w)+40;
  out.push(await comp('TDI-dark-flow-overview.svg', mw, m.h+80, TDI.miniCard(mw, m.h+80)));
  // shorter, scroll-clipped variant for the composition (the PNG cuts the mine row)
  out.push(await comp('TDI-dark-flow-overview-short.svg', mw, 780, TDI.miniCard(mw, 780))); }
out.push(await comp('TDI-dark-legend.svg', 420, 30, TDI.legendRow(210,0)));
out.push(await save('TDI-dark-sidebar.svg', TDI.svgDoc(306, 900, TDI.sidebar(900))));
out.push(await save('TDI-dark-header.svg', TDI.svgDoc(1440, 104, TDI.rect(0,0,1440,104,{id:'bg',fill:C.ground}) + TDI.rect(0,0,306,104,{id:'side-bg',fill:C.ink2}) + TDI.rect(0,0,56,104,{id:'rail-bg',fill:C.ink}) + TDI.header(1440))));
window._exportResult = out.join(' | ');
})();
