/* Der Adventsstand – Adventskalender-Spiel rund um den AI Booth Designer */
(() => {
'use strict';

const $ = (s) => document.querySelector(s);
const el = (tag, cls, html) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
};
const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

/* ---------- Die 24 Bauteile (Türchen n -> PARTS[n-1]) ---------- */
const PARTS = [
  { id: 'floor', ico: '⬜', name: 'Bodenplatte', txt: 'Jeder Stand beginnt am Boden. 6 × 4 Meter, 24 m² – passend zum Kalender.' },
  { id: 'post1', ico: '🔩', name: 'Eckstütze', txt: 'Die erste Stütze steht. An ihr hängt später der halbe Stand.' },
  { id: 'post2', ico: '🔩', name: 'Stütze rechts', txt: 'Noch eine Stütze – der Stand bekommt seine Breite.' },
  { id: 'post3', ico: '🔩', name: 'Stütze links', txt: 'Dritte Stütze. Jetzt ist die Grundfläche abgesteckt.' },
  { id: 'beams', ico: '📏', name: 'Zargen', txt: 'Die Zargen verbinden die Stützen. Aus Einzelteilen wird ein Rahmen.' },
  { id: 'wallL', ico: '🧱', name: 'Wandfüllung links', txt: 'Die erste Wand ist zu. Dahinter darf der Nachbarstand lärmen.' },
  { id: 'wallA', ico: '🧱', name: 'Rückwand, Teil 1', txt: 'Die Rückwand wächst – Platz für Grafik und Botschaften.' },
  { id: 'wallB', ico: '🧱', name: 'Rückwand, Teil 2', txt: 'Rückwand komplett. Der Eckstand ist jetzt an zwei Seiten offen.' },
  { id: 'carpet', ico: '🟥', name: 'Roter Teppich', txt: 'Roter Teppich für die Besucher – und er dämpft müde Messefüße.' },
  { id: 'fascia', ico: '🪧', name: 'Blende', txt: 'Die Blende trägt den Namen. Jetzt findet man den Stand schon vom Gang aus.' },
  { id: 'counter', ico: '🛎️', name: 'Theke', txt: 'Die Theke: Empfang, Infopunkt und heimliches Plätzchenlager.' },
  { id: 'spots', ico: '💡', name: 'Strahler', txt: 'Licht an! Gut ausgeleuchtet sieht jeder Entwurf doppelt so gut aus.' },
  { id: 'screen', ico: '🖥️', name: 'Bildschirm', txt: 'Auf dem Bildschirm läuft der KI-Entwurf – vom Prompt zum Stand.' },
  { id: 'stool', ico: '🪑', name: 'Barhocker', txt: 'Ein Platz zum Durchatmen. Am dritten Messetag unbezahlbar.' },
  { id: 'table', ico: '🍸', name: 'Stehtisch', txt: 'Am Stehtisch entstehen die besten Gespräche.' },
  { id: 'rack', ico: '📰', name: 'Prospektständer', txt: 'Prospekte griffbereit. Wer mag, nimmt den Stand zum Nachlesen mit.' },
  { id: 'graphic', ico: '❄️', name: 'Wandgrafik', txt: 'Großflächige Grafik für die Seitenwand – diesmal mit Schneekristallen.' },
  { id: 'tree', ico: '🎄', name: 'Tannenbaum', txt: 'Kein Adventsstand ohne Baum. Nadelt garantiert nicht auf den Teppich.' },
  { id: 'lights', ico: '✨', name: 'Lichterkette', txt: 'Die Lichterkette folgt den Zargen einmal rund um den Stand.' },
  { id: 'gifts', ico: '🎁', name: 'Geschenke', txt: 'Geschenke unterm Baum. Oder sind es getarnte Give-aways?' },
  { id: 'star', ico: '⭐', name: 'Hängestern', txt: 'Der Stern hängt von der Hallendecke – Fernwirkung auf weihnachtlich.' },
  { id: 'snow', ico: '☃️', name: 'Schnee', txt: 'Über Nacht hat es in der Halle geschneit. Fragt nicht wie.' },
  { id: 'visitor', ico: '🧑‍🎄', name: 'Erster Besucher', txt: 'Der erste Besucher ist da – mit Mütze und Glühwein.' },
  { id: 'xmas', ico: '🎉', name: 'Festbeleuchtung', txt: 'Der Stand ist fertig. Frohe Weihnachten und volle Messehallen im neuen Jahr!' },
];

/* ---------- Isometrischer Stand (SVG) ---------- */
const S = 46, C = 0.866;
const P = (x, y, z = 0) => [(x - y) * C * S, (x + y) * 0.5 * S - z * S];
const pts = (a) => a.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
const poly = (a, fill, extra = '') =>
  `<polygon points="${pts(a)}" fill="${fill}" stroke="rgba(0,0,0,.45)" stroke-width=".8" stroke-linejoin="round" ${extra}/>`;
const box = (x, y, z, w, d, h, c) =>
  poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)], c[1]) +
  poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)], c[2]) +
  poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)], c[0]);
// Fläche auf der Rückwand (Ebene y=0) bzw. der linken Wand (Ebene x=0)
const wy = (x0, x1, z0, z1, fill, extra) => poly([P(x0, 0, z0), P(x1, 0, z0), P(x1, 0, z1), P(x0, 0, z1)], fill, extra);
const wx = (y0, y1, z0, z1, fill, extra) => poly([P(0, y0, z0), P(0, y1, z0), P(0, y1, z1), P(0, y0, z1)], fill, extra);
const ty = (x, z, str, size, fill, extra = '') => {
  const p = P(x, 0, z);
  return `<text transform="matrix(.866,.5,0,1,${p[0].toFixed(1)},${p[1].toFixed(1)})" font-size="${size}" font-weight="800" fill="${fill}" font-family="system-ui,Arial,sans-serif" ${extra}>${str}</text>`;
};
const tx = (y, z, str, size, fill, extra = '') => {
  const p = P(0, y, z);
  return `<text transform="matrix(.866,-.5,0,1,${p[0].toFixed(1)},${p[1].toFixed(1)})" font-size="${size}" font-weight="800" fill="${fill}" font-family="system-ui,Arial,sans-serif" ${extra}>${str}</text>`;
};
const ALU = ['#eef2f6', '#aab4c0', '#c9d2dc'];
const post = (x, y) => box(x - 0.06, y - 0.06, 0, 0.12, 0.12, 2.5, ALU);
const circ = (p, r, fill, extra = '') => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${fill}" ${extra}/>`;
const BULBS = ['#ff4d5a', '#f6c453', '#5fe39a', '#6fd3ff'];

const DRAW = {
  floor: () => box(0, 0, -0.12, 6, 4, 0.12, ['#dfe4ea', '#8f9aa8', '#aeb8c4']),
  carpet: () => poly([P(0.25, 0.25), P(5.75, 0.25), P(5.75, 3.75), P(0.25, 3.75)], '#b3121d'),
  wallL: () => wx(0, 4, 0, 2.4, '#e9edf2') + wx(2, 2, 0, 2.4, 'none'),
  graphic: () =>
    wx(0.15, 3.85, 0.25, 0.7, '#e30613') + tx(3.7, 0.37, 'HALLE 24 · STAND A24', 10, '#fff') +
    tx(3.5, 1.05, '❄', 46, '#7fbdf0') + tx(1.9, 1.3, '❄', 30, '#a9d4f7') + tx(1.0, 0.95, '❄', 20, '#7fbdf0'),
  wallA: () => wy(0, 3, 0, 2.4, '#f4f6f9'),
  wallB: () => wy(3, 6, 0, 2.4, '#f4f6f9'),
  screen: () =>
    wy(3.5, 5.5, 1.0, 2.1, '#10151c') + wy(3.57, 5.43, 1.07, 2.03, '#16335c') +
    ty(3.72, 1.7, '✨ KI-Entwurf', 11, '#f6c453') + ty(3.72, 1.42, '24 m² · Eckstand', 8, '#cfe3ff') +
    ty(3.72, 1.2, '▮▮▮▮▮▮▮▯▯ 78 %', 7, '#5fe39a'),
  xmas: () => {
    let s = `<g class="neon" filter="url(#glow)">` + ty(1.35, 1.95, 'Frohe', 14, '#ffcf4a') + ty(1.35, 1.58, 'Weihnachten', 14, '#ffcf4a') + `</g>`;
    for (let i = 0; i < 16; i++) {
      const x = -150 + ((i * 97) % 390), d = ((i * 37) % 50) / 10;
      s += `<circle class="flake nog" cx="${x}" cy="-170" r="${1.5 + (i % 3)}" fill="#fff" style="animation-delay:-${d}s"/>`;
    }
    return s;
  },
  post1: () => post(0, 0),
  post2: () => post(6, 0),
  post3: () => post(0, 4),
  beams: () => box(-0.05, 0, 2.4, 0.1, 4, 0.12, ALU) + box(0, -0.05, 2.4, 6, 0.1, 0.12, ALU),
  fascia: () => wy(1, 5, 2.52, 3.1, '#e30613') + ty(1.2, 2.7, 'AI BOOTH DESIGNER', 15, '#fff', 'textLength="166"'),
  snow: () => {
    const line = (a) => `<polyline points="${pts(a)}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
    return line([P(0, 4, 2.57), P(0, 0, 2.57), P(1, 0, 2.57)]) + line([P(5, 0, 2.57), P(6, 0, 2.57)]) +
      line([P(1.05, 0, 3.14), P(4.95, 0, 3.14)]) +
      [1.6, 2.7, 4.1].map((x) => circ(P(x, 0, 3.08), 3.2, '#fff')).join('') +
      [0.8, 2.6].map((y) => circ(P(0, y, 2.5), 3, '#fff')).join('');
  },
  spots: () => [1.5, 3, 4.5].map((x) =>
    `<polygon class="nog" points="${pts([P(x, 0.2, 2.25), P(x + 0.9, 1.6, 0), P(x - 0.9, 1.6, 0)])}" fill="rgba(255,236,170,.16)"/>` +
    box(x - 0.08, 0.05, 2.22, 0.16, 0.22, 0.14, ['#444c57', '#20262e', '#2f3640']) +
    circ(P(x, 0.27, 2.22), 2.6, '#fff3b0')).join(''),
  lights: () => {
    const a = [];
    for (let i = 0; i <= 8; i++) a.push(P(0, 4 - i * 0.5, 2.3 - 0.12 * Math.abs(Math.sin(i * Math.PI / 4 + 0.6))));
    for (let i = 1; i <= 12; i++) a.push(P(i * 0.5, 0, 2.3 - 0.12 * Math.abs(Math.sin(i * Math.PI / 4 + 0.6))));
    return `<polyline points="${pts(a)}" fill="none" stroke="#1d2a1f" stroke-width="1"/>` +
      a.map((p, i) => circ(p, 3, BULBS[i % 4], 'class="bulb"')).join('');
  },
  tree: () => {
    const b = P(1, 0.9, 0.3);
    const tri = (w, y0, h, f) => `<polygon points="${b[0] - w},${b[1] - y0} ${b[0] + w},${b[1] - y0} ${b[0]},${b[1] - y0 - h}" fill="${f}" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>`;
    return box(0.93, 0.83, 0, 0.14, 0.14, 0.3, ['#7a5230', '#5b3b20', '#6a4628']) +
      tri(24, 0, 34, '#1f7a47') + tri(19, 22, 30, '#25905a') + tri(13, 42, 26, '#2fa56a') +
      [[-12, 8, 0], [9, 12, 1], [-3, 28, 3], [7, 34, 0], [-5, 50, 1]].map(([dx, dy, c]) => circ([b[0] + dx, b[1] - dy], 2.6, BULBS[c])).join('') +
      `<text x="${b[0]}" y="${b[1] - 62}" text-anchor="middle" font-size="16" fill="#f6c453">★</text>`;
  },
  gifts: () =>
    box(1.6, 1.45, 0, 0.42, 0.42, 0.36, ['#ff5764', '#c00510', '#e30613']) +
    box(2.15, 1.2, 0, 0.3, 0.3, 0.26, ['#5fe39a', '#1f7a47', '#2f9e62']) +
    box(1.68, 1.53, 0.36, 0.24, 0.24, 0.2, ['#ffe08f', '#c99a2b', '#f6c453']),
  rack: () =>
    box(0.3, 2.75, 0, 0.25, 0.6, 1.4, ['#dfe4ea', '#8f9aa8', '#aeb8c4']) +
    [[0.3, '#e30613'], [0.66, '#f6c453'], [1.02, '#6fd3ff']].map(([z, f]) =>
      poly([P(0.55, 2.82, z), P(0.55, 3.28, z), P(0.55, 3.28, z + 0.27), P(0.55, 2.82, z + 0.27)], f)).join(''),
  table: () => {
    const b = P(2.6, 2.9, 0), t = P(2.6, 2.9, 1.1);
    const e = (p, r, f) => `<ellipse cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" rx="${(r * S * 1.225).toFixed(1)}" ry="${(r * S * 0.707).toFixed(1)}" fill="${f}" stroke="rgba(0,0,0,.45)" stroke-width=".8"/>`;
    return e(b, 0.22, '#8f9aa8') + box(2.57, 2.87, 0, 0.06, 0.06, 1.08, ALU) + e(t, 0.36, '#fff') +
      `<text x="${t[0]}" y="${t[1] + 1}" text-anchor="middle" font-size="11">🍪</text>`;
  },
  counter: () =>
    box(4, 1.5, 0, 1.6, 0.7, 1.0, ['#fff', '#e30613', '#c00510']) +
    box(3.95, 1.45, 1.0, 1.7, 0.8, 0.06, ALU) +
    `<text x="${P(4.8, 2.2, 0.45)[0]}" y="${P(4.8, 2.2, 0.45)[1]}" text-anchor="middle" font-size="13" fill="#fff" font-weight="800" transform="">i</text>`,
  visitor: () => {
    const b = P(3.4, 3.6, 0), x = b[0], y = b[1];
    return `<ellipse class="nog" cx="${x}" cy="${y}" rx="11" ry="5" fill="rgba(0,0,0,.25)"/>` +
      `<rect x="${x - 6}" y="${y - 20}" width="5" height="20" fill="#24364f"/><rect x="${x + 1}" y="${y - 20}" width="5" height="20" fill="#24364f"/>` +
      `<rect x="${x - 9}" y="${y - 46}" width="18" height="28" rx="5" fill="#2b6cb0" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>` +
      `<circle cx="${x}" cy="${y - 53}" r="7.5" fill="#f2c9a0" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>` +
      `<polygon points="${x - 8},${y - 57} ${x + 8},${y - 57} ${x + 9},${y - 72}" fill="#e30613" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>` +
      `<rect x="${x - 9}" y="${y - 59}" width="18" height="4" rx="2" fill="#fff"/><circle cx="${x + 9}" cy="${y - 72}" r="3" fill="#fff"/>` +
      `<rect x="${x + 9}" y="${y - 40}" width="7" height="8" rx="1" fill="#fff" stroke="rgba(0,0,0,.4)" stroke-width=".8"/>`;
  },
  stool: () => box(5.27, 2.97, 0, 0.06, 0.06, 0.7, ALU) + box(5.1, 2.8, 0.7, 0.4, 0.4, 0.08, ['#3a424d', '#1c2129', '#2a313a']),
  star: () => {
    const p = P(2, 3.4, 4.8);
    return `<line x1="${p[0]}" y1="-190" x2="${p[0]}" y2="${p[1] - 26}" stroke="#9db0c9" stroke-width="1"/>` +
      `<text class="neon" x="${p[0]}" y="${p[1]}" text-anchor="middle" font-size="40" fill="#f6c453" stroke="#b8860b" stroke-width="1">★</text>`;
  },
};
// Zeichenreihenfolge von hinten nach vorn
const ORDER = ['floor', 'carpet', 'wallL', 'graphic', 'wallA', 'wallB', 'screen', 'xmas', 'post1', 'post2', 'post3',
  'beams', 'fascia', 'snow', 'spots', 'lights', 'tree', 'gifts', 'rack', 'table', 'counter', 'visitor', 'stool', 'star'];
const DOOR_OF = Object.fromEntries(PARTS.map((p, i) => [p.id, i + 1]));

/* ---------- Zustand ---------- */
const KEY = 'adventsstand.v1';
let done = new Set();
let demo = false;
try {
  done = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  demo = localStorage.getItem(KEY + '.demo') === '1';
} catch (e) { /* ohne Speicher läuft es trotzdem */ }
if (/[?&]demo=1/.test(location.search)) demo = true;
const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify([...done]));
    localStorage.setItem(KEY + '.demo', demo ? '1' : '0');
  } catch (e) { /* ignorieren */ }
};
const now = new Date();
const unlocked = (n) => demo || (now.getMonth() === 11 && now.getDate() >= n);

/* ---------- Rendern ---------- */
function renderBooth(fresh) {
  let s = `<svg viewBox="-175 -190 430 440" role="img" aria-label="Messestand mit ${done.size} von 24 Teilen">
    <defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>`;
  for (const id of ORDER) {
    const n = DOOR_OF[id];
    const cls = done.has(n) ? (n === fresh ? 'part' : 'part still') : 'ghost';
    s += `<g class="${cls}">${DRAW[id]()}</g>`;
  }
  $('#booth').innerHTML = s + '</svg>';
  $('#progress').textContent = `${done.size} / 24 Teile`;
}

const DOOR_LAYOUT = [7, 18, 3, 22, 11, 1, 15, 24, 5, 13, 20, 9, 2, 17, 10, 23, 6, 14, 21, 4, 12, 19, 8, 16];
function renderDoors() {
  const wrap = $('#doors');
  wrap.innerHTML = '';
  let next = 0;
  for (let n = 1; n <= 24; n++) if (unlocked(n) && !done.has(n)) { next = n; break; }
  for (const n of DOOR_LAYOUT) {
    const b = el('button', 'door');
    const part = PARTS[n - 1];
    if (done.has(n)) {
      b.classList.add('done');
      b.innerHTML = `<span class="num">${n}</span><span class="ico">${part.ico}</span>`;
      b.title = `${part.name} – nochmal spielen`;
    } else {
      b.textContent = n;
      if (!unlocked(n)) { b.classList.add('locked'); b.title = `Öffnet am ${n}. Dezember`; }
      else if (n === next) b.classList.add('next');
    }
    b.setAttribute('aria-label', `Türchen ${n}` + (done.has(n) ? `, erledigt: ${part.name}` : unlocked(n) ? '' : ', noch verschlossen'));
    b.addEventListener('click', () => {
      if (unlocked(n)) openDoor(n);
      else { b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); }
    });
    wrap.appendChild(b);
  }
  const t = $('#today');
  if (now.getMonth() === 11) t.textContent = now.getDate() <= 24 ? `Heute: ${now.getDate()}. Dezember` : 'Alle Türchen offen';
  else {
    const d1 = new Date(now.getFullYear(), 11, 1);
    const days = Math.ceil((d1 - now) / 864e5);
    t.textContent = days > 0 ? `Noch ${days} Tag${days === 1 ? '' : 'e'} bis 1. Dezember` : 'Bis zum nächsten Advent';
  }
}

/* ---------- Modal ---------- */
let cleanup = null;
function closeModal() {
  if (cleanup) { cleanup(); cleanup = null; }
  $('#modal').hidden = true;
}
$('#mClose').addEventListener('click', closeModal);
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

const GAMES = [
  { name: 'Prompt-Puzzle', text: 'Der AI Booth Designer braucht einen klaren Auftrag. Tippe die Bausteine in der richtigen Reihenfolge an.', run: promptGame },
  { name: 'Bauteil-Memory', text: 'Im Lager ist alles durcheinander. Finde die passenden Paare.', run: memoryGame },
  { name: 'Messe-Quiz', text: 'Wer Stände baut, muss die Begriffe kennen. Zwei Fragen bis zum Bauteil.', run: quizGame },
  { name: 'Teile-Regen', text: 'Die Lieferung kommt von oben! Fange die Bauteile mit dem Wagen – und weiche den Eisklumpen 🧊 aus.', run: catchGame },
];

function openDoor(n) {
  const g = GAMES[(n - 1) % 4], level = Math.floor((n - 1) / 4);
  $('#mKicker').textContent = `Türchen ${n} · Stufe ${level + 1} von 6`;
  $('#mTitle').textContent = g.name;
  $('#mText').textContent = g.text;
  const body = $('#mBody');
  body.innerHTML = '';
  $('#modal').hidden = false;
  cleanup = g.run(body, level, () => win(n)) || null;
}

function win(n) {
  if (cleanup) { cleanup(); cleanup = null; }
  const isNew = !done.has(n);
  done.add(n);
  save();
  const part = PARTS[n - 1];
  $('#mKicker').textContent = `Türchen ${n} · geschafft`;
  $('#mTitle').textContent = isNew ? 'Neues Bauteil!' : 'Wieder gelöst!';
  $('#mText').textContent = '';
  const body = $('#mBody');
  body.innerHTML = `<div class="win"><div class="big">${part.ico}</div><h3>${part.name}</h3><p class="mtext">${part.txt}</p>
    ${done.size === 24 ? '<p><strong>🎄 Alle 24 Teile verbaut – dein Adventsstand ist fertig!</strong></p>' : ''}
    <div class="row"><button class="btn" id="build">${isNew ? 'Einbauen' : 'Zurück zum Stand'}</button></div></div>`;
  $('#build').addEventListener('click', () => {
    closeModal();
    renderBooth(isNew ? n : 0);
    renderDoors();
    $('#booth').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  $('#build').focus();
}

/* ---------- Spiel 1: Prompt-Puzzle ---------- */
const PROMPTS = [
  ['Entwirf einen', 'Reihenstand', 'mit 12 m²', 'und einer Theke.'],
  ['Gestalte einen', 'Eckstand', 'mit 24 m²,', 'einer roten Blende', 'und einer Lagerkabine.'],
  ['Plane einen', 'Kopfstand', 'mit 30 m²', 'für eine Produktneuheit,', 'mit großem Bildschirm', 'und einer Besprechungsecke.'],
  ['Erstelle einen', 'Blockstand', 'mit 48 m²,', 'von allen Seiten offen,', 'mit einer Bar in der Mitte', 'sowie zwei Besprechungsräumen', 'und einem Hängebanner.'],
  ['Entwirf für die Wintermesse', 'einen Eckstand', 'mit 36 m²', 'in Rot und Silber,', 'mit Theke am Gang,', 'einer Lounge dahinter,', 'dazu indirektes Licht', 'und ganz hinten ein Lager.'],
  ['Baue zum Schluss', 'einen festlichen', 'Adventsstand', 'mit 24 m²,', 'einem Tannenbaum in der Ecke,', 'einer Lichterkette an den Zargen,', 'Geschenken unter dem Baum', 'und einem Stern darüber', '– frohe Weihnachten!'],
];
function promptGame(body, level, onWin) {
  const parts = PROMPTS[level];
  let pos = 0, errors = 0;
  const boxEl = el('div', 'promptbox', '<span class="caret"></span>');
  const chips = el('div', 'chips');
  const status = el('p', 'status', `0 / ${parts.length} Bausteine`);
  shuffle(parts.map((t, i) => ({ t, i }))).forEach(({ t, i }) => {
    const c = el('button', 'chip');
    c.textContent = t;
    c.dataset.i = i;
    c.addEventListener('click', () => {
      if (i !== pos) {
        errors++;
        c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
        status.textContent = 'Das passt hier noch nicht – wie würde der Satz weitergehen?';
        if (errors % 2 === 0) chips.querySelector(`[data-i="${pos}"]`).classList.add('hintme');
        return;
      }
      c.classList.add('used');
      pos++;
      boxEl.innerHTML = parts.slice(0, pos).join(' ') + ' <span class="caret"></span>';
      status.textContent = `${pos} / ${parts.length} Bausteine`;
      if (pos === parts.length) {
        status.textContent = '✨ Der AI Booth Designer legt los …';
        setTimeout(onWin, 900);
      }
    });
    chips.appendChild(c);
  });
  body.append(boxEl, chips, status);
}

/* ---------- Spiel 2: Memory ---------- */
const ICONS = ['🔩', '💡', '🎄', '🪑', '🖥️', '🎁', '📐', '⭐', '🧰', '☕', '❄️', '🪧'];
function memoryGame(body, level, onWin) {
  const pairs = [4, 6, 6, 8, 8, 10][level];
  const cards = shuffle(shuffle(ICONS).slice(0, pairs).flatMap((x) => [x, x]));
  const grid = el('div', 'memory');
  grid.style.gridTemplateColumns = `repeat(${pairs === 10 ? 5 : 4}, 1fr)`;
  const status = el('p', 'status', `0 / ${pairs} Paare · 0 Züge`);
  let open = [], found = 0, moves = 0, lock = false, timer = null;
  cards.forEach((ico, idx) => {
    const c = el('button', 'mcard');
    c.textContent = ico;
    c.setAttribute('aria-label', `Karte ${idx + 1}`);
    c.addEventListener('click', () => {
      if (lock || c.classList.contains('open') || c.classList.contains('found')) return;
      c.classList.add('open');
      open.push(c);
      if (open.length < 2) return;
      moves++;
      const [a, b] = open;
      open = [];
      if (a.textContent === b.textContent) {
        a.classList.add('found'); b.classList.add('found');
        found++;
        if (found === pairs) timer = setTimeout(onWin, 700);
      } else {
        lock = true;
        timer = setTimeout(() => { a.classList.remove('open'); b.classList.remove('open'); lock = false; }, 800);
      }
      status.textContent = `${found} / ${pairs} Paare · ${moves} Züge`;
    });
    grid.appendChild(c);
  });
  body.append(grid, status);
  return () => clearTimeout(timer);
}

/* ---------- Spiel 3: Quiz ---------- */
const QUIZ = [
  { q: 'Wie viele offene Seiten hat ein Reihenstand?', a: ['Eine', 'Zwei', 'Vier'], x: 'Der Reihenstand steht zwischen Nachbarn und öffnet sich nur zum Gang.' },
  { q: 'Was zeigt ein Grundriss?', a: ['Den Stand von oben', 'Den Stand von vorn', 'Die Preisliste'], x: 'Der Grundriss ist die Draufsicht – er zeigt, was wo steht.' },
  { q: 'Wie viele offene Seiten hat ein Eckstand?', a: ['Zwei', 'Eine', 'Drei'], x: 'Der Eckstand liegt an einer Gangkreuzung und ist nach zwei Seiten offen.' },
  { q: 'Was ist ein Prompt?', a: ['Die Texteingabe, mit der man einer KI den Auftrag gibt', 'Ein besonders schneller Messebauer', 'Ein Verbindungsteil zwischen zwei Stützen'], x: 'Je klarer der Prompt, desto besser der Entwurf.' },
  { q: 'Ein Kopfstand ist …', a: ['nach drei Seiten offen', 'ein Stand, der auf dem Kopf steht', 'nach einer Seite offen'], x: 'Der Kopfstand sitzt am Ende einer Standreihe – drei Seiten zum Gang.' },
  { q: 'Welche Angabe hilft dem AI Booth Designer am wenigsten?', a: ['Das Lieblingsplätzchen des Chefs', 'Die Standfläche in m²', 'Der Standtyp'], x: 'Fläche, Standtyp und Zweck sind die Basis. Plätzchen bitte trotzdem mitbringen.' },
  { q: 'Wie nennt man einen Stand, der nach allen vier Seiten offen ist?', a: ['Blockstand', 'Reihenstand', 'Rundstand'], x: 'Der Blockstand (auch Inselstand) ist rundum von Gängen umgeben.' },
  { q: 'Was ist eine Zarge?', a: ['Ein waagerechtes Profil zwischen zwei Stützen', 'Ein Teppichrest', 'Ein Messeausweis'], x: 'Zargen verbinden die Stützen und tragen Wände, Blenden und Licht.' },
  { q: 'Wofür ist die Blende am Stand da?', a: ['Sie trägt Namen und Logo des Ausstellers', 'Sie schützt vor Sonne', 'Sie verdeckt den Notausgang'], x: 'Die Blende sitzt oben am Stand und sorgt für Fernwirkung.' },
  { q: 'Woher hat octanorm seinen Namen?', a: ['Vom achteckigen Stützenprofil', 'Vom Monat Oktober', 'Von acht Gründern'], x: '„Octa“ steht für das Achteck – die Form der klassischen Stütze.' },
  { q: 'Was ist ein Rendering?', a: ['Ein am Computer erzeugtes Bild des Entwurfs', 'Die Endabnahme des Stands', 'Ein Rentier mit Messeausweis'], x: 'Mit Renderings sieht man den Stand, bevor die erste Stütze steht.' },
  { q: 'Was passiert mit Systembauteilen nach der Messe?', a: ['Sie werden abgebaut und wiederverwendet', 'Sie werden verschenkt', 'Sie bleiben in der Halle stehen'], x: 'Wiederverwendung ist der große Vorteil des Systembaus.' },
];
function quizGame(body, level, onWin) {
  let step = 0;
  const show = () => {
    const item = QUIZ[level * 2 + step];
    body.innerHTML = '';
    const q = el('p', 'q');
    q.textContent = `Frage ${step + 1} von 2: ${item.q}`;
    const answers = el('div', 'answers');
    const status = el('p', 'status');
    const row = el('div', 'row');
    shuffle(item.a.map((t, i) => ({ t, ok: i === 0 }))).forEach(({ t, ok }) => {
      const b = el('button', 'ans');
      b.textContent = t;
      b.addEventListener('click', () => {
        if (answers.dataset.solved) return;
        if (!ok) { b.classList.add('wrong'); b.disabled = true; status.textContent = 'Nicht ganz – versuch es noch einmal.'; return; }
        answers.dataset.solved = '1';
        b.classList.add('right');
        status.textContent = '✓ ' + item.x;
        const nb = el('button', 'btn');
        nb.textContent = step === 0 ? 'Nächste Frage' : 'Bauteil abholen';
        nb.addEventListener('click', () => { if (step === 0) { step = 1; show(); } else onWin(); });
        row.appendChild(nb);
        nb.focus();
      });
      answers.appendChild(b);
    });
    body.append(q, answers, status, row);
  };
  show();
}

/* ---------- Spiel 4: Teile-Regen ---------- */
function catchGame(body, level, onWin) {
  const W = 360, H = 420, target = 8 + level * 2, speed = 150 + level * 32;
  const cv = el('canvas', 'catch');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = W * dpr; cv.height = H * dpr;
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  const status = el('p', 'status', 'Maus, Finger oder Pfeiltasten ← → bewegen den Wagen.');
  const row = el('div', 'row');
  body.append(cv, status, row);

  const GOOD = ['🔩', '💡', '🧰', '📐', '🎁'];
  let cart, items, score, lives, spawn, last, raf = 0, running = false, keys = {};
  const reset = () => { cart = W / 2; items = []; score = 0; lives = 3; spawn = 0.4; last = 0; row.innerHTML = ''; running = true; raf = requestAnimationFrame(tick); };

  const move = (e) => { const r = cv.getBoundingClientRect(); cart = Math.max(26, Math.min(W - 26, (e.clientX - r.left) / r.width * W)); };
  cv.addEventListener('pointermove', move);
  cv.addEventListener('pointerdown', move);
  const kd = (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { keys[e.key] = true; e.preventDefault(); } };
  const ku = (e) => { keys[e.key] = false; };
  document.addEventListener('keydown', kd);
  document.addEventListener('keyup', ku);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#e9edf2';
    ctx.fillRect(0, H - 14, W, 14);
    ctx.textAlign = 'center';
    ctx.font = '28px system-ui, sans-serif';
    for (const it of items) ctx.fillText(it.ch, it.x, it.y);
    ctx.font = '42px system-ui, sans-serif';
    ctx.fillText('🛒', cart, H - 16);
    ctx.font = '700 15px system-ui, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`Teile ${score} / ${target}`, 12, 24);
    ctx.textAlign = 'right';
    ctx.fillText('❤️'.repeat(lives) + '🖤'.repeat(3 - lives), W - 10, 24);
  }
  function tick(t) {
    if (!running) return;
    const dt = Math.min(0.05, last ? (t - last) / 1000 : 0);
    last = t;
    if (keys.ArrowLeft) cart = Math.max(26, cart - 330 * dt);
    if (keys.ArrowRight) cart = Math.min(W - 26, cart + 330 * dt);
    spawn -= dt;
    if (spawn <= 0) {
      const bad = Math.random() < 0.22 + level * 0.03;
      items.push({ x: 24 + Math.random() * (W - 48), y: -10, v: speed * (0.85 + Math.random() * 0.4), bad, ch: bad ? '🧊' : GOOD[Math.floor(Math.random() * GOOD.length)] });
      spawn = Math.max(0.38, 0.85 - level * 0.07) * (0.7 + Math.random() * 0.6);
    }
    for (const it of items) {
      it.y += it.v * dt;
      if (!it.hit && it.y > H - 58 && it.y < H - 8 && Math.abs(it.x - cart) < 32) {
        it.hit = true;
        if (it.bad) lives--; else score++;
      }
    }
    items = items.filter((it) => !it.hit && it.y < H + 30);
    draw();
    if (score >= target) { running = false; status.textContent = 'Lieferung komplett!'; setTimeout(onWin, 600); return; }
    if (lives <= 0) {
      running = false;
      status.textContent = 'Der Wagen ist eingefroren. Gleich nochmal!';
      const b = el('button', 'btn');
      b.textContent = 'Nochmal versuchen';
      b.addEventListener('click', reset);
      row.appendChild(b);
      b.focus();
      return;
    }
    raf = requestAnimationFrame(tick);
  }
  reset();
  return () => { running = false; cancelAnimationFrame(raf); document.removeEventListener('keydown', kd); document.removeEventListener('keyup', ku); };
}

/* ---------- Start ---------- */
const snow = $('#snow');
for (let i = 0; i < 36; i++) {
  const f = document.createElement('i');
  const size = 3 + Math.random() * 5;
  f.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;animation-duration:${8 + Math.random() * 10}s;animation-delay:-${Math.random() * 18}s`;
  snow.appendChild(f);
}
$('#demo').checked = demo;
$('#demo').addEventListener('change', (e) => { demo = e.target.checked; save(); renderDoors(); });
$('#reset').addEventListener('click', () => {
  if (!confirm('Wirklich alle Bauteile wieder abbauen?')) return;
  done.clear(); save(); renderBooth(0); renderDoors();
});
renderBooth(0);
renderDoors();
})();
