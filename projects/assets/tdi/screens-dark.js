/* TDI · Supplier Assessment screens in the dark design system, as editable SVG.
   Rebuilt from Pietra's light references (Group 11277 / Group 11278) with the
   same tokens, spacing and components as the rest of the TDI dark set.
   Self-contained: open screens-dark.html, which renders and can export. */
(function (global) {

const C = {
  ink:'#0F0F12', ink2:'#18181C', ground:'#121215', surface:'#1B1B20', surface2:'#202026',
  line:'#2A2B33', line2:'#363843', text:'#F1F1F4', muted:'#9A9EAB', faint:'#6C7080',
  accent:'#7A5AF8', accentInk:'#FFFFFF', accentSoft:'rgba(122,90,248,0.20)', accentSoft2:'rgba(122,90,248,0.35)',
  ok:'#4ADE80', okBg:'rgba(34,197,94,0.15)', warn:'#FBBF24', warnBg:'rgba(245,158,11,0.15)',
  bad:'#F87171', badBg:'rgba(239,68,68,0.15)', badLine:'#7F2A2A',
  info:'#60A5FA', teal:'#2DD4BF', land:'#2C2E36', water:'#1F2A3A', landLine:'#3A3D47',
};

/* ---------- primitives ---------- */
const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const el = (tag, attrs={}, inner='') =>
  `<${tag}${Object.entries(attrs).map(([k,v]) => v==null||v===''?'':` ${k}="${esc(v)}"`).join('')}>${inner}</${tag}>`;
const g = (id, attrs, inner) => el('g', {id, ...attrs}, inner);
const rect = (x,y,w,h,o={}) => el('rect', {id:o.id, x, y, width:w, height:h, rx:o.rx, fill:o.fill||'none', stroke:o.stroke, 'stroke-width':o.sw, opacity:o.opacity});
const txt = (x,y,s,o={}) => el('text', {x, y, 'font-family':'Inter, sans-serif', 'font-size':o.size||13,
  'font-weight':o.weight||400, fill:o.fill||C.text, 'text-anchor':o.anchor, 'letter-spacing':o.ls, opacity:o.opacity}, esc(s));
const line = (x1,y1,x2,y2,o={}) => el('line', {id:o.id, x1, y1, x2, y2, stroke:o.stroke||C.line, 'stroke-width':o.sw||1});
const circle = (cx,cy,r,o={}) => el('circle', {id:o.id, cx, cy, r, fill:o.fill||'none', stroke:o.stroke, 'stroke-width':o.sw, opacity:o.opacity});

const ICONS = {
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  chevron:'<path d="m9 18 6-6-6-6"/>',
  chevronDown:'<path d="m6 9 6 6 6-6"/>',
  chevronUp:'<path d="m18 15-6-6-6 6"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  globe:'<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  box:'<path d="m21 8-9-5-9 5v8l9 5 9-5z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/>',
  pin:'<circle cx="12" cy="6" r="3"/><path d="M12 9v7"/><path d="m8 20 4-4 4 4"/>',
  alert:'<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M12 8v5"/><path d="M12 16.5v.01"/>',
  clipboard:'<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/>',
  pie:'<path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
  pen:'<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  doc:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8"/>',
  monitor:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  logout:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  arrow:'<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
  check:'<path d="m20 6-11 11-5-5"/>',
  kebab:'<circle cx="12" cy="5" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  minus:'<path d="M5 12h14"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',
  comment:'<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-3.8-.9L3 20.5l1.6-4.6A8.4 8.4 0 0 1 3.5 11 8.4 8.4 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5z"/>',
  download:'<path d="M12 3v11"/><path d="m8 11 4 4 4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  mine:'<path d="M14.5 12.5 6.6 20.4a1 1 0 1 1-3-3l7.9-7.9"/><path d="M17.7 3.7a1 1 0 0 0-1.4 0l-4.6 4.6a1 1 0 0 0 0 1.4l2.6 2.6a1 1 0 0 0 1.4 0l4.6-4.6a1 1 0 0 0 0-1.4z"/>',
  hand:'<path d="M18 11V6a2 2 0 0 0-4 0"/><path d="M14 10V4a2 2 0 0 0-4 0v2"/><path d="M10 10.5V6a2 2 0 0 0-4 0v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  source:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
};
const icon = (name, x, y, size, color, sw=1.6, id) => el('g', {
  id: id || ('icon/'+name), transform:`translate(${x},${y}) scale(${(size/24).toFixed(4)})`,
  fill:'none', stroke:color, 'stroke-width':sw, 'stroke-linecap':'round', 'stroke-linejoin':'round', color
}, ICONS[name]);

/* ---------- shared chrome ---------- */
const RAIL = 56, SIDE = 250, W = 1440;
const MAIN_X = RAIL + SIDE;           // 306
const MAIN_W = W - MAIN_X;            // 1134

function sidebar(H, active='Assessments') {
  const railIcons = ['home','grid','pen','doc','monitor','users'];
  let r = rect(0,0,RAIL,H,{id:'bg', fill:C.ink});
  let y = 20;
  railIcons.forEach((ic,i) => {
    r += g('rail/'+ic, {transform:`translate(10,${y})`},
      (i===1 ? rect(0,0,36,36,{rx:9, fill:'#2F3038'}) : '') + icon(ic, 8, 8, 20, i===1 ? '#FFFFFF' : '#C7C9D1'));
    y += 44;
  });
  r += g('rail/gear', {transform:`translate(10,${H-120})`}, icon('gear',8,8,20,'#C7C9D1'));
  r += g('rail/logout', {transform:`translate(10,${H-76})`}, icon('logout',8,8,20,'#C7C9D1'));
  r += circle(28, H-32, 13, {id:'avatar', fill:'#E8E8EC'});

  const nav = [['Supply Chain Map','globe'],['Suppliers','box'],['Traceability','pin'],['Risks','alert'],['Assessments','clipboard'],['Analytics','pie']];
  let s = rect(RAIL,0,SIDE,H,{id:'bg', fill:C.ink2}) + txt(RAIL+24, 42, 'Supply Chain', {size:18, weight:600, fill:'#FFFFFF', ls:-.2});
  let ny = 68;
  nav.forEach(([label, ic]) => {
    const on = label === active;
    s += g('nav/'+label, {},
      (on ? rect(RAIL+14, ny, SIDE-28, 40, {rx:8, fill:'rgba(255,255,255,0.08)'}) : '') +
      icon(ic, RAIL+26, ny+10, 20, on ? '#FFFFFF' : '#B9BBC4') +
      txt(RAIL+58, ny+26, label, {size:14, weight:on?500:400, fill:on ? '#FFFFFF' : '#D9DAE0'}));
    ny += 44;
  });
  return g('rail',{},r) + g('sidenav',{},s);
}

function header(title, crumbs, seg) {
  // rounded top-left corner of the main surface, same as the other TDI exports
  let out = el('path', {id:'bg', d:`M${MAIN_X+26},0 H${W} V104 H${MAIN_X} V26 A26,26 0 0 1 ${MAIN_X+26},0 Z`, fill:C.surface});
  out += line(MAIN_X, 104, W, 104);
  let cx = MAIN_X + 28;
  out += icon('home', cx, 22, 16, C.faint); cx += 24;
  crumbs.forEach((c, i) => {
    const last = i === crumbs.length - 1;
    out += icon('chevron', cx, 22, 16, C.faint); cx += 22;
    out += txt(cx, 34, c, {size:13, fill: last ? C.text : C.faint});
    cx += c.length * 6.6 + 10;
  });
  out += txt(MAIN_X+28, 80, title, {size:24, weight:600, ls:-.4});
  // Same segmented control as the Map/Flow one: track 34 tall, rx 9, surface-2
  // over line; thumb inset 3, rx 7, surface + line; labels 14/500. It is
  // auto-width in the product (14px padding each side), so this pair of longer
  // labels makes a wider track than Map/Flow's 136.
  const segW = 190, segX = W - 28 - segW;
  out += g('segmented', {transform:`translate(${segX},56)`},
    rect(0,0,segW,34,{rx:9, fill:C.surface2, stroke:C.line}) +
    rect(seg==='analysis'?3:segW/2, 3, segW/2-3, 28, {rx:7, fill:C.surface, stroke:C.line}) +
    txt(segW*0.25+2, 21, 'Analysis', {size:14, weight:500, fill: seg==='analysis'?C.text:C.muted, anchor:'middle'}) +
    txt(segW*0.75, 21, 'Entry form', {size:14, weight:500, fill: seg==='entry'?C.text:C.muted, anchor:'middle'}));
  return g('header', {}, out);
}

function sectionBar(y, label, withExport) {
  let out = rect(MAIN_X, y, MAIN_W, 56, {id:'bg', fill:C.surface}) + line(MAIN_X, y+56, W, y+56);
  out += txt(MAIN_X+28, y+35, label, {size:17, weight:600, ls:-.2});
  if (withExport) out += g('button/export', {transform:`translate(${W-28-104},${y+11})`},
    rect(0,0,104,34,{rx:9, fill:C.surface2, stroke:C.line}) + icon('download',14,9,16,C.text) + txt(38,22,'Export',{size:13.5, weight:500}));
  return g('section-bar/'+label, {}, out);
}

/* ---------- small components ---------- */
function card(x, y, w, h, inner, id) {
  return g(id || 'card', {transform:`translate(${x},${y})`},
    rect(0,0,w,h,{id:'bg', rx:14, fill:C.surface, stroke:C.line}) + inner);
}
function cardHead(w, label, kebab) {
  return g('head', {}, txt(24, 34, label, {size:15, weight:600}) +
    (kebab ? icon('kebab', w-38, 16, 18, C.muted) : '') + line(0, 54, w, 54));
}
function pill(x, y, label, tone, id) {
  const map = {low:[C.ok,C.okBg], ok:[C.ok,C.okBg], med:[C.warn,C.warnBg], high:[C.bad,C.badBg],
    accent:[C.accent, C.accentSoft], neutral:[C.muted,'rgba(154,158,171,0.14)']};
  const [fg, bg] = map[tone] || map.neutral;
  const w = label.length * 6.9 + 22;
  return g(id || ('pill/'+label), {transform:`translate(${x},${y})`},
    rect(0,0,w,24,{rx:12, fill:bg}) + txt(w/2, 16, label, {size:12, weight:500, fill:fg, anchor:'middle'}));
}
function field(w, label, value, o={}) {
  // label above, input box below; o.state: 'filled' | 'empty' | 'focus'
  const focus = o.state === 'focus';
  let out = txt(0, 10, label, {size:12.5, fill:C.muted});
  out += rect(0, 20, w, 40, {rx:8, fill:C.surface2, stroke: focus ? C.accent : C.line2, sw: focus ? 1.5 : 1});
  out += txt(14, 45, value, {size:13.5, fill: o.state==='empty'||focus ? C.faint : C.text});
  if (!o.noChevron) out += icon('chevronDown', w-28, 32, 16, C.muted);
  if (!o.noComment) out += icon('comment', w+14, 30, 18, o.active ? C.accent : C.muted);
  return g('field/'+label.slice(0,42), {transform:`translate(${o.x||0},${o.y||0})`}, out);
}

/* ---------- screen 1: Supplier Assessment (analysis) ---------- */
function supplierAssessment() {
  const PAD = 28, CW = MAIN_W - PAD*2, X = MAIN_X + PAD;
  let y = 160 + 20;              // header 104 + section bar 56 + gap
  let body = '';

  // three risk cards
  const risks = [['Inherent Risk','High','high'], ['Residual risk','Medium','med'], ['Audit Performance','Conform','ok']];
  const rw = (CW - 24*2) / 3;
  risks.forEach(([label, val, tone], i) => {
    body += card(X + i*(rw+24), y, rw, 56,
      txt(20, 34, label, {size:13.5}) + pill(rw-20-(val.length*6.9+22), 16, val, tone), 'stat/'+label);
  });
  y += 56 + 20;

  // details + information availability
  const dw = Math.round(CW * 0.63), iw = CW - dw - 20;
  const dh = 360;
  {
    let inner = cardHead(dw, 'Details');
    inner += txt(24, 86, 'Location', {size:12.5, fill:C.muted});
    // stylised map plate
    const mx = 24, my = 98, mw = dw-48, mh = 190;
    let map = rect(mx, my, mw, mh, {id:'plate', rx:10, fill:C.water});
    map += el('path', {id:'land', d:`M${mx},${my+40} C${mx+70},${my+10} ${mx+140},${my+70} ${mx+220},${my+40} S${mx+360},${my+20} ${mx+mw},${my+52} L${mx+mw},${my+mh} L${mx},${my+mh} Z`, fill:C.land});
    map += el('path', {id:'river', d:`M${mx+90},${my+mh} C${mx+150},${my+130} ${mx+130},${my+90} ${mx+210},${my+58}`, stroke:'#2B3A4E', 'stroke-width':3, fill:'none'});
    map += el('path', {id:'border', d:`M${mx+250},${my+52} L${mx+300},${my+120} L${mx+250},${my+mh}`, stroke:C.landLine, 'stroke-width':1, 'stroke-dasharray':'4 4', fill:'none'});
    ['Capoocan','Villaba','Matag-ob','Tongonan','Jaro'].forEach((n, i) => {
      const px = mx + 60 + i*Math.round((mw-120)/4), py = my + 40 + (i%3)*44;
      map += txt(px, py, n, {size:9.5, fill:'#8A93A3'});
    });
    // pin + tooltip
    const px = mx + Math.round(mw*0.42), py = my + Math.round(mh*0.45);
    map += g('pin', {}, el('path', {d:`M${px},${py+14} c-6,-8 -9,-12 -9,-17 a9,9 0 1 1 18,0 c0,5 -3,9 -9,17 z`, fill:C.accent}) + circle(px, py-3, 3.2, {fill:'#FFFFFF'}));
    map += g('tooltip', {transform:`translate(${px-92},${py+20})`},
      rect(0,0,184,38,{rx:8, fill:C.surface, stroke:C.line}) +
      txt(92, 16, 'Democratic Republic of the Congo', {size:9.5, weight:500, anchor:'middle'}) +
      txt(92, 28, 'Tshuapa Territory, Kasai Province', {size:8.5, fill:C.muted, anchor:'middle'}));
    inner += g('map', {}, map);
    [['Products','Copper'],['Category','Large scale mine'],['Position','Upstream']].forEach(([k, v], i) => {
      const cx = 24 + i*Math.round((dw-48)/3);
      inner += g('fact/'+k, {}, txt(cx, my+mh+28, k, {size:12.5, fill:C.muted}) + txt(cx, my+mh+52, v, {size:13.5}));
    });
    body += card(X, y, dw, dh, inner, 'card/Details');
  }
  {
    let inner = cardHead(iw, 'Information Availability');
    const cx = iw/2, cy = 200;
    const arc = (r, pct, color, id) => {
      const a = pct/100 * Math.PI*2 - Math.PI/2;
      const x0 = cx, y0 = cy - r, x1 = cx + r*Math.cos(a), y1 = cy + r*Math.sin(a);
      return el('path', {id, d:`M${x0},${y0} A${r},${r} 0 ${pct>50?1:0} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`,
        stroke:color, 'stroke-width':14, 'stroke-linecap':'round', fill:'none'});
    };
    inner += circle(cx, cy, 64, {stroke:C.surface2, sw:14}) + circle(cx, cy, 44, {stroke:C.surface2, sw:14});
    inner += arc(64, 73, '#A78BFA', 'ring/independent-research');
    inner += arc(44, 52, C.accent, 'ring/supplier-questionnaire');
    const leg = (lx, pct, label, color) => g('legend/'+label, {},
      txt(lx-9, 296, pct, {size:14, weight:600, anchor:'middle'}) + circle(lx+18, 292, 4, {fill:color}) +
      txt(lx, 316, label, {size:10.5, fill:C.muted, anchor:'middle'}));
    inner += g('legend', {}, leg(cx-82, '73%', 'Independent research', '#A78BFA') + leg(cx+82, '52%', 'Supplier questionnaire', C.accent));
    body += card(X + dw + 20, y, iw, dh, inner, 'card/Information Availability');
  }
  y += dh + 20;

  // supplier status
  {
    let inner = cardHead(CW, 'Supplier Status');
    const cols = [['Red Flags','Yes','high'], ['Audited','Yes','ok'], ['Assessment score', null, null], ['Ongoing corrective action plan','No','ok']];
    cols.forEach(([k, v, tone], i) => {
      const cx = 24 + i*Math.round((CW-48)/4);
      inner += txt(cx, 92, k, {size:12.5, fill:C.muted});
      if (v) inner += pill(cx, 106, v, tone);
      else inner += rect(cx, 112, 120, 8, {rx:4, fill:C.surface2}) + rect(cx, 112, 96, 8, {rx:4, fill:C.accent}) + txt(cx+132, 120, '80%', {size:13});
    });
    body += card(X, y, CW, 152, inner, 'card/Supplier Status');
  }
  y += 152 + 20;

  // assessment details table
  {
    const rows = [
      ['Establish strong company management systems','Conform','ok', true],
      ['Identify and assess risks in the supply chain','Minor non-conformances','med', false],
      ['Design and implement a strategy to respond to identified risks','Major non-conformances','high', true],
      ['Carry out independent third-party audit of supply chain due diligence at identified points in t…','Not applicable','neutral', true],
      ['Report annually on supply chain due dilligence','Conform','ok', true],
      ['ESG supplier code of conduct','Minor non-conformances','med', true],
    ];
    const H = 54 + 24 + 40 + rows.length*44 + 24;
    let inner = cardHead(CW, 'Assessment Details', true);
    const iwid = CW - 48, colx = [0, Math.round(iwid*0.56), Math.round(iwid*0.76), Math.round(iwid*0.90)];
    inner += g('thead', {transform:'translate(24,78)'},
      rect(0,0,iwid,40,{rx:8, fill:C.surface2}) +
      txt(colx[0]+14, 25, 'Audit Criteria', {size:12, fill:C.muted}) +
      txt(colx[1], 25, 'Audit Performance', {size:12, fill:C.muted}) +
      txt(colx[2], 25, 'Triangulation', {size:12, fill:C.muted}) +
      txt(colx[3], 25, 'Last Update', {size:12, fill:C.muted}));
    let ry = 118, tb = '';
    rows.forEach(([crit, perf, tone, tri]) => {
      tb += g('row/'+crit.slice(0,32), {transform:`translate(24,${ry})`},
        txt(colx[0]+14, 27, crit, {size:13}) +
        pill(colx[1]-2, 10, perf, tone) +
        (tri ? icon('check', colx[2]+6, 12, 16, C.accent) : circle(colx[2]+14, 21, 6, {stroke:C.line2, sw:1.4})) +
        txt(colx[3], 27, '10 Jan 24', {size:13, fill:C.text}) +
        line(0, 44, iwid, 44));
      ry += 44;
    });
    inner += g('tbody', {}, tb);
    body += card(X, y, CW, H, inner, 'card/Assessment Details');
    y += H + 20;
  }

  // risk matrix
  {
    const H = 54 + 24 + 300 + 40;
    let inner = cardHead(CW, 'Risk Matrix', true);
    const gx = 96, gy = 88, gw = CW - gx - 40, gh = 280, cw = gw/3, ch = gh/3;
    let grid = rect(gx, gy, gw, gh, {id:'plot', rx:8, fill:C.surface2, stroke:C.line});
    for (let i = 1; i < 3; i++) {
      grid += line(gx + i*cw, gy, gx + i*cw, gy+gh, {stroke:C.line});
      grid += line(gx, gy + i*ch, gx+gw, gy + i*ch, {stroke:C.line});
    }
    ['Large','Medium','Limited'].forEach((l, i) => grid += txt(gx-14, gy + i*ch + ch/2 + 4, l, {size:11.5, fill:C.muted, anchor:'end'}));
    ['Limited','Medium','Large'].forEach((l, i) => grid += txt(gx + i*cw + cw/2, gy+gh+26, l, {size:11.5, fill:C.muted, anchor:'middle'}));
    const dots = [
      ['Corruption', 2.72, 0.16, C.info], ['Forced Labour', 2.36, 0.28, C.ok],
      ['Violence and Conflict', 1.72, 0.40, C.ok], ['Labour Rights', 2.22, 0.46, C.teal],
      ['Occupational Health and Safety', 1.42, 0.58, C.warn], ['Business Ethics', 2.58, 0.66, C.teal],
      ['Degraded Landscapes', 2.50, 1.06, C.teal], ['Child Labour', 1.80, 1.20, C.warn],
      ['Community Impact', 2.56, 1.24, C.warn], ['Pollution', 1.98, 1.36, C.teal],
      ['Carbon Emissions', 2.40, 1.56, C.warn], ['Indigenous Peoples Rights', 1.84, 2.14, C.ok],
      ['Deforestation', 2.62, 2.20, C.warn], ['Negative Biodiversity Impact', 0.46, 2.28, C.ok],
      ['Tailings Breaches', 1.16, 2.38, C.info], ['Security Forces', 1.62, 2.52, C.info],
    ];
    dots.forEach(([label, col, row, color]) => {
      const px = gx + col*cw, py = gy + row*ch;
      grid += g('risk/'+label, {}, circle(px, py, 4, {fill:color}) + txt(px+10, py+4, label, {size:11.5, fill:C.text}));
    });
    inner += g('matrix', {}, grid);
    body += card(X, y, CW, H, inner, 'card/Risk Matrix');
    y += H + 20;
  }

  // trade relationships
  {
    const H = 54 + 24 + 340;
    let inner = cardHead(CW, 'Trade Relationships', true);
    const nodes = [['Cooper Mine 01','Mine Site','mine','1 Source(s)'], ['COMILO','Artisanal Processor','hand','4 Source(s)'], ['Maki Banga','Artisanal Processor','hand','1 Source(s)']];
    const nw = 180, nh = 64, cx = CW/2 - nw/2;
    let ny = 100, flow = '';
    nodes.forEach(([name, tag, ic, src], i) => {
      if (i) flow += line(CW/2, ny-36, CW/2, ny, {stroke:C.line2}) + circle(CW/2, ny-36, 3, {fill:C.surface, stroke:C.line2}) + circle(CW/2, ny, 3, {fill:C.surface, stroke:C.line2});
      const tone = i === 0 ? [C.bad, C.badBg] : [C.accent, C.accentSoft];
      flow += g('node/'+name, {transform:`translate(${cx},${ny})`},
        rect(0,0,nw,nh,{rx:10, fill:C.surface2, stroke:C.line2}) +
        txt(14, 26, name, {size:13, weight:600}) +
        rect(nw-32, 12, 20, 20, {rx:5, fill:C.surface, stroke:C.line2}) + icon('arrow', nw-28, 16, 12, C.muted) +
        rect(14, 38, tag.length*5.6+26, 18, {rx:5, fill:tone[1]}) + icon(ic, 18, 42, 10, tone[0], 2) + txt(32, 51, tag, {size:9.5, weight:500, fill:tone[0]}) +
        icon('source', 14 + tag.length*5.6+36, 42, 10, C.muted, 2) + txt(14 + tag.length*5.6+50, 51, src, {size:9.5, fill:C.muted}));
      ny += nh + 44;
    });
    // zoom controls
    let zy = 120;
    ['plus','minus','target','chevronUp','chevronDown'].forEach(ic => {
      flow += g('tool/'+ic, {transform:`translate(${CW-58},${zy})`}, icon(ic, 0, 0, 16, C.muted)); zy += 26;
    });
    inner += g('flow', {}, flow);
    body += card(X, y, CW, H, inner, 'card/Trade Relationships');
    y += H + 28;
  }

  const H = y;
  const inner =
    rect(0,0,W,H,{id:'page-bg', fill:C.ground}) +
    sidebar(H) +
    el('path', {id:'main-bg', d:`M${MAIN_X+26},0 H${W} V${H} H${MAIN_X} V26 A26,26 0 0 1 ${MAIN_X+26},0 Z`, fill:C.ground}) +
    header('Kommany Mine', ['Supply Chain','Suppliers','Supplier Assessment','Kommany Mine'], 'analysis') +
    sectionBar(104, 'Supplier Assessment', false) +
    body;
  return svgDoc(W, H, inner);
}

/* ---------- screen 2: Supplier Assessment (entry form) ---------- */
function entryForm() {
  const PAD = 28, X = MAIN_X + PAD;
  const NAVW = 250, FORMX = X + NAVW + 36, FORMW = W - PAD - FORMX;
  const sections = ['Identification','Beneficiaries / Shareholders','Key Personnel','Location','Products','Activity','Suppliers','Buyers','Scrutiny','AML / CFT','Financial Information','Organisation Policies','Documentation','Contact Information','Appraisal','Linked Subjects'];
  let y = 160 + 20;
  let body = '';

  // section nav
  let nav = '', ny = y;
  sections.forEach(s => {
    const on = s === 'Scrutiny';
    nav += g('section/'+s, {},
      (on ? rect(X, ny, NAVW, 36, {rx:8, fill:C.accentSoft}) : '') +
      txt(X+16, ny+23, s, {size:13, weight:on?500:400, fill:on ? C.accent : C.muted}));
    ny += 36;
  });
  body += g('section-nav', {}, nav);

  // form
  let fy = y;
  body += txt(FORMX, fy+16, 'Scrutiny', {size:17, weight:600, ls:-.2});
  body += txt(FORMX, fy+40, 'Please provide an accurate self-assessment to facilitate onboarding, as your statements may be checked against information', {size:12.5, fill:C.muted});
  body += txt(FORMX, fy+58, 'from other sources.', {size:12.5, fill:C.muted});
  fy += 80;

  // card 1
  {
    const fieldW = FORMW - 80;
    const items = [
      ['Has your organisation been involved in any significant dispute or litigation?', 'No', {}],
      ['Identify any polemical track-record which may be associated to the organisation', 'Accusations of corruption', {}],
      ['Status of litigations and polemics', 'Ongoing', {active:true}],
    ];
    let inner = '', iy = 28;
    items.forEach(([label, val, o]) => { inner += field(fieldW, label, val, {...o, x:24, y:iy}); iy += 78; });
    // free-text answer attached to the previous field
    inner += g('answer/Status of litigations and polemics', {transform:`translate(24,${iy-4})`},
      rect(0,0,fieldW+28,52,{rx:8, fill:'rgba(122,90,248,0.08)', stroke:C.accent}) +
      txt(16, 31, 'We have been wrongly accused by a competitor', {size:13.5}));
    iy += 68;
    inner += field(fieldW, 'Date of incorporation', '2004', {x:24, y:iy}); iy += 78;
    inner += field(fieldW, 'Expected effect of litigations and polemics on the organisation', 'Select', {x:24, y:iy, state:'focus'});
    // open dropdown
    const opts = ['Business continuity challenge','Compliance challenge','Reputational challenge','No effect'];
    inner += g('dropdown', {transform:`translate(24,${iy+64})`},
      rect(0,0,fieldW,opts.length*38+12,{rx:10, fill:C.surface2, stroke:C.line2}) +
      opts.map((o, i) => g('option/'+o, {}, txt(16, 32 + i*38, o, {size:13.5}))).join(''));
    iy += 78 + opts.length*38 + 22;
    inner += field(fieldW, 'Is the organisation mentioned on any international watchlist?', 'Select', {x:24, y:iy, state:'empty'}); iy += 78;
    inner += field(fieldW, 'Is the organisation mentioned in any UN Group of Experts report?', 'Select', {x:24, y:iy, state:'empty'}); iy += 78;
    body += card(FORMX, fy, FORMW, iy, inner, 'card/Scrutiny');
    fy += iy + 32;
  }

  // Past Activity
  body += txt(FORMX, fy+16, 'Past Activity', {size:17, weight:600, ls:-.2});
  body += txt(FORMX, fy+40, 'Identify all information which partners should be made aware of, to minimise future risk.', {size:12.5, fill:C.muted});
  fy += 62;
  {
    const fieldW = FORMW - 80;
    let inner = field(fieldW, 'Has the organisation previously operated under a different name?', 'Select', {x:24, y:28, state:'empty'});
    inner += g('field/comments', {transform:'translate(24,106)'},
      txt(0, 10, 'Please provide any relevant comments and clarifications on this section', {size:12.5, fill:C.muted}) +
      rect(0, 20, fieldW+28, 110, {rx:8, fill:C.surface2, stroke:C.line2}) +
      txt(14, 44, 'Type', {size:13.5, fill:C.faint}));
    body += card(FORMX, fy, FORMW, 264, inner, 'card/Past Activity');
    fy += 264 + 28;
  }

  const navBottom = ny + 28;
  const H = Math.max(fy, navBottom) + 84;   // room for the sticky footer
  // footer
  const footer = g('footer', {},
    rect(MAIN_X, H-72, MAIN_W, 72, {id:'bg', fill:C.surface}) + line(MAIN_X, H-72, W, H-72) +
    g('button/cancel', {transform:`translate(${MAIN_X + MAIN_W/2 - 104},${H-54})`},
      rect(0,0,92,36,{rx:9, fill:C.surface2, stroke:C.line}) + txt(46, 23, 'Cancel', {size:13.5, weight:500, anchor:'middle'})) +
    g('button/save', {transform:`translate(${MAIN_X + MAIN_W/2 + 12},${H-54})`},
      rect(0,0,92,36,{rx:9, fill:C.accent}) + txt(46, 23, 'Save', {size:13.5, weight:500, fill:'#FFFFFF', anchor:'middle'})));

  const inner =
    rect(0,0,W,H,{id:'page-bg', fill:C.ground}) +
    sidebar(H) +
    el('path', {id:'main-bg', d:`M${MAIN_X+26},0 H${W} V${H} H${MAIN_X} V26 A26,26 0 0 1 ${MAIN_X+26},0 Z`, fill:C.ground}) +
    header('Kommany Mine', ['Supply Chain','Suppliers','Supplier Assessment','Kommany Mine'], 'entry') +
    sectionBar(104, 'Supplier Assessment', true) +
    body + footer;
  return svgDoc(W, H, inner);
}

function svgDoc(w, h, inner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none">${inner}</svg>`;
}

global.TDIScreens = {supplierAssessment, entryForm, C};
})(window);
