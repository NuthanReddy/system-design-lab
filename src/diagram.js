import { escapeHtml as e, icon } from './icons.js';

const colors = { blue: ['#d5e5f3', '#9bb9db'], green: ['#e0edcc', '#adc88e'], purple: ['#e1d6f0', '#b5a0d0'], gold: ['#f8e7bb', '#e5c478'], orange: ['#f5dac3', '#dfa77f'], rose: ['#f3d2df', '#d59bb4'] };
const darkColors = { blue: ['#4a6279', '#293e51'], green: ['#57724d', '#354b2e'], purple: ['#65507f', '#44305d'], gold: ['#81724b', '#51432a'], orange: ['#886249', '#65432f'], rose: ['#83546d', '#58364a'] };
const positions = { people: [210, 430], service: [455, 300], store: [645, 425], ids: [605, 115], cache: [270, 140], replica: [770, 510], queue: [800, 240], guard: [300, 285] };
const genericPositions = [[200, 405], [420, 290], [630, 170], [650, 410]];

function person(x, y, color) {
  return `<g transform="translate(${x} ${y})"><path d="M-7 3Q-8-4 0-4T7 3v18q-7 6-14 0Z" fill="${color}" stroke="var(--ink)" stroke-width="1.7"/><circle cy="-11" r="6.5" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.7"/></g>`;
}
function nodeShape(node, x, y, first) {
  const name = e(first ? 'sho.rt' : node.name);
  const subtitle = e(first ? 'your link service' : node.subtitle || ' ');
  const graphic = /cache/i.test(node.name) ? 'bolt' : /ID/i.test(node.name) ? 'hash' : /limiter/i.test(node.name) ? 'shield' : /events/i.test(node.name) ? 'queue' : node.kind === 'database' ? 'database' : 'server';
  if (node.kind === 'people') {
    const people = [[-54, -14], [-23, -30], [8, -14], [39, -30], [70, -14], [-23, 16], [8, 32], [39, 16], [70, 32], [101, 16]];
    return `<g class="diagram-node" role="button" tabindex="0" data-node="${e(node.id)}" aria-label="${e(node.name)}: inspect component" transform="translate(${x} ${y})">
      <title>${e(node.name)}</title><path d="m-89 0 110-52q10-5 20 0l108 52q10 5 0 11L41 64q-10 5-20 0L-89 12q-10-5 0-12Z" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/>
      <path d="m-89 12 110 52q10 5 20 0l108-53v9L41 73q-10 5-20 0L-89 21Z" fill="var(--tile-side)" stroke="var(--ink)" stroke-width="1.2"/>
      ${people.map(([px, py], i) => person(px, py - 10, Object.values(colors)[i % 5][1])).join('')}
      <rect x="-72" y="96" width="216" height="28" rx="14" fill="var(--surface)" stroke="var(--ink)" stroke-width="2"/>
      <text x="36" y="114" text-anchor="middle" font-size="12" font-weight="700">${e(node.name)}</text></g>`;
  }
  if (node.kind === 'database') {
    return `<g class="diagram-node" role="button" tabindex="0" data-node="${e(node.id)}" aria-label="${name}: inspect component" transform="translate(${x} ${y})">
      <title>${name}</title><path d="M-46-35v70c0 38 92 38 92 0v-70Z" fill="url(#${node.color}-side)" stroke="var(--ink)" stroke-width="2.3"/><ellipse cy="-35" rx="46" ry="24" fill="url(#${node.color}-top)" stroke="var(--ink)" stroke-width="2.3"/>
      <g transform="translate(-11 -2) scale(.9)">${icon(graphic)}</g>
      <rect x="60" y="-4" width="148" height="28" rx="14" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/><text x="134" y="14" text-anchor="middle" font-size="12" font-weight="700">${name}</text></g>`;
  }
  return `<g class="diagram-node" role="button" tabindex="0" data-node="${e(node.id)}" aria-label="${name}: inspect component" transform="translate(${x} ${y})">
    <title>${name} — ${subtitle}</title>
    <path d="m-68-31 58-30q10-5 20 0l58 30v55q0 10-10 15L10 68q-10 5-20 0l-48-29q-10-5-10-15Z" fill="url(#${node.color}-side)" stroke="var(--ink)" stroke-width="2.3"/>
    <path d="m-58-40 48-25q10-5 20 0l48 25q18 9 0 18L10 4q-10 5-20 0l-48-26q-18-9 0-18Z" fill="url(#${node.color}-top)" stroke="var(--ink)" stroke-width="2.3"/>
    <path d="m-61-23 51 27q10 5 20 0l51-27" fill="none" stroke="var(--bevel)" stroke-width="2"/>
    <g transform="translate(-14 -48) scale(1.2)">${icon(graphic)}</g><text y="26" text-anchor="middle" font-size="16" font-weight="800">${name}</text><text y="45" text-anchor="middle" font-size="10">${subtitle}</text>
    </g>`;
}

export function diagram(lesson, step, index, theme = 'light') {
  const url = lesson.id === 'design-url-shortener';
  const visible = lesson.nodes.filter(n => step.visible.includes(n.id));
  const coords = Object.fromEntries(lesson.nodes.map((n, i) => [n.id, url ? positions[n.id] : genericPositions[i]]));
  if (url && index < 2) { coords.people = [355, 410]; coords.service = [575, 260]; }
  const gradients = Object.entries(theme === 'dark' ? darkColors : colors).map(([name, [top, side]]) => `<linearGradient id="${name}-top" x2=".6" y2="1"><stop stop-color="${top}"/><stop offset="1" stop-color="${side}"/></linearGradient><linearGradient id="${name}-side"><stop stop-color="${side}"/><stop offset=".5" stop-color="${top}"/><stop offset="1" stop-color="${side}"/></linearGradient>`).join('');
  const edges = step.edges.map((edge, i) => {
    const [from, to, type] = edge;
    const a = coords[from], b = coords[to];
    const dx = b[0] - a[0], dy = b[1] - a[1], length = Math.hypot(dx, dy);
    const parallel = step.edges.filter(([f, t]) => (f === from && t === to) || (f === to && t === from));
    const offset = (parallel.indexOf(edge) - (parallel.length - 1) / 2) * 10 * (from < to ? 1 : -1);
    const start = [a[0] + dx / length * 78 - dy / length * offset, a[1] + dy / length * 62 + dx / length * offset];
    const end = [b[0] - dx / length * 83 - dy / length * offset, b[1] - dy / length * 63 + dx / length * offset];
    const d = `M${start[0]} ${start[1]}L${end[0]} ${end[1]}`;
    const hue = type === 'response' ? '#8ab775' : type === 'miss' ? '#dbba5b' : type === 'write' ? '#a38abf' : '#dfaa7d';
    return `<g><path id="flow-${i}" class="flow-line ${type}" d="${d}" stroke="var(--ink)" stroke-width="1.7" fill="none" marker-end="url(#arrowhead)"/>
      <circle cx="${start[0]}" cy="${start[1]}" r="5" fill="${hue}" stroke="var(--surface)" stroke-width="1.5"><animateMotion dur="${2.5 + i * .4}s" begin="${i * .25}s" repeatCount="indefinite" path="M0 0L${end[0] - start[0]} ${end[1] - start[1]}"/></circle></g>`;
  }).join('');
  const requirement = url && index < 2 ? `<g transform="translate(710 50)"><rect width="245" height="130" rx="12" fill="var(--surface)" stroke="var(--ink)" stroke-width="1.8"/><text x="16" y="26" font-size="10" letter-spacing="1">REQUIREMENTS</text><path d="M16 37h211" stroke="var(--line)"/><text x="16" y="57" font-size="11">create   URL → compact code</text><text x="16" y="80" font-size="11">open     code → destination</text><rect x="12" y="91" width="220" height="24" rx="4" fill="var(--green)"/><text x="16" y="107" font-size="11" font-weight="700">fast, available redirects</text></g>` : '';
  return `<svg id="system-diagram" viewBox="0 0 1000 640" role="img" aria-label="${e(lesson.title)} — ${e(step.title)}. ${e(step.idea)}">
    <defs>${gradients}<marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="m0 0 8 4-8 4Z" fill="var(--ink)"/></marker><filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="7" stdDeviation="3" flood-color="#493b2b" flood-opacity=".12"/></filter></defs>
    <g id="diagram-content">${edges}<g filter="url(#node-shadow)">${visible.map(node => nodeShape(node, ...coords[node.id], url && index < 2 && node.id === 'service')).join('')}</g>${requirement}</g>
  </svg>`;
}
