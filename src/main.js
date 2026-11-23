import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import './styles.css';
import { chapters, lessons, resolveRoute, chapterFor, stepChanges } from './course.js';
import { diagram } from './diagram.js';
import { icon, escapeHtml as e } from './icons.js';

const copy = {
  en: { course: 'Course', lessons: 'lessons', learn: 'Learn', practice: 'Practice', lab: 'Design Lab', sheets: 'Cheatsheets', search: 'Search lessons & concepts…', progress: 'Progress', replay: 'Replay', pause: 'Pause', play: 'Play', back: 'Back', next: 'Next', step: 'Step', inLesson: 'In this lesson', goals: 'You’ll learn', key: 'Key idea', changed: 'What changed', complete: 'Complete lesson', completed: 'Lesson complete', language: 'Language', title: 'Search the course', empty: 'No matching lessons. Try a broader concept.', hint: '↑ ↓ select · Enter open · Esc close' },
  es: { course: 'Curso', lessons: 'lecciones', learn: 'Aprender', practice: 'Práctica', lab: 'Laboratorio', sheets: 'Guías', search: 'Buscar lecciones y conceptos…', progress: 'Progreso', replay: 'Repetir', pause: 'Pausar', play: 'Reproducir', back: 'Atrás', next: 'Siguiente', step: 'Paso', inLesson: 'En esta lección', goals: 'Aprenderás', key: 'Idea clave', changed: 'Qué cambió', complete: 'Completar lección', completed: 'Lección completada', language: 'Idioma', title: 'Buscar en el curso', empty: 'Sin resultados. Prueba otro concepto.', hint: '↑ ↓ elegir · Enter abrir · Esc cerrar' },
  fr: { course: 'Cours', lessons: 'leçons', learn: 'Apprendre', practice: 'Exercices', lab: 'Laboratoire', sheets: 'Fiches', search: 'Rechercher des leçons…', progress: 'Progression', replay: 'Rejouer', pause: 'Pause', play: 'Lire', back: 'Retour', next: 'Suivant', step: 'Étape', inLesson: 'Dans cette leçon', goals: 'À découvrir', key: 'Idée clé', changed: 'Ce qui change', complete: 'Terminer la leçon', completed: 'Leçon terminée', language: 'Langue', title: 'Rechercher dans le cours', empty: 'Aucun résultat. Essayez un autre concept.', hint: '↑ ↓ choisir · Entrée ouvrir · Échap fermer' },
};
Object.assign(copy.en, { nextLesson: 'Next lesson', finished: 'Course complete', resume: 'Resume step' });
Object.assign(copy.es, { nextLesson: 'Siguiente lección', finished: 'Curso completado', resume: 'Continuar en el paso' });
Object.assign(copy.fr, { nextLesson: 'Leçon suivante', finished: 'Cours terminé', resume: 'Reprendre à l’étape' });
const lessonOrder = chapters.flatMap(chapter => chapter.lessons);
const narrowScreen = matchMedia('(max-width: 959px)');
const state = {
  ...resolveRoute(location.hash), paused: matchMedia('(prefers-reduced-motion: reduce)').matches,
  theme: 'light', lang: 'en', completed: [], positions: {}, open: new Set(), zoom: 1, pan: [0, 0], drawer: false, mode: 'learn',
};
let noticeTimer;
function notify(message) {
  const notice = document.querySelector('#notice');
  notice.textContent = message;
  notice.classList.add('visible');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.classList.remove('visible'), 3600);
}
function readSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem('sdl:settings') || '{}');
    state.theme = saved.theme === 'dark' ? 'dark' : 'light';
    state.lang = copy[saved.lang] ? saved.lang : 'en';
    state.completed = Array.isArray(saved.completed) ? saved.completed.filter(id => lessons[id]) : [];
    for (const id of lessonOrder) {
      const index = saved.positions?.[id];
      if (Number.isInteger(index)) state.positions[id] = Math.max(0, Math.min(lessons[id].steps.length - 1, index));
    }
    if (!location.hash && typeof saved.position === 'string') Object.assign(state, resolveRoute(saved.position));
    if (typeof saved.position === 'string') {
      const previous = resolveRoute(saved.position);
      state.positions[previous.lesson.id] ??= previous.index;
    }
  } catch {
    notify('Saved settings could not be read. Default settings are in use.');
  }
  const queryLang = new URLSearchParams(location.search).get('lang');
  if (copy[queryLang]) state.lang = queryLang;
}
function save() {
  state.positions[state.lesson.id] = state.index;
  try { localStorage.setItem('sdl:settings', JSON.stringify({ theme: state.theme, lang: state.lang, completed: state.completed, positions: state.positions, position: `/${state.lesson.id}/${state.index + 1}` })); }
  catch { notify('Your browser could not save progress. It will last only for this visit.'); }
}
const t = key => copy[state.lang][key];
const completedCount = chapter => chapter.lessons.filter(id => state.completed.includes(id)).length;
const lessonLink = id => `#/${id}/${(state.positions[id] ?? 0) + 1}`;

function header() {
  return `<header class="topbar"><button class="icon-button mobile-menu" data-action="drawer" aria-label="Open course navigation" aria-controls="course-navigation" aria-expanded="${state.drawer}">${icon('menu')}</button>
    <a class="brand" href="#/design-url-shortener/1" aria-label="System Design Lab home">${icon('network')}<span>System <mark>Design</mark></span></a>
    <nav class="modes" aria-label="Course sections">
      ${[['learn', 'book'], ['practice', 'gear'], ['lab', 'lab'], ['sheets', 'grid']].map(([mode, glyph]) => `<button data-mode="${mode}" class="${state.mode === mode ? 'selected' : ''}" aria-pressed="${state.mode === mode}">${icon(glyph)}<span>${t(mode)}</span></button>`).join('')}
    </nav>
    <button class="search-button" data-action="search" aria-label="${t('title')}">${icon('search')}<span>${t('search')}</span><kbd>Ctrl K</kbd></button>
    <div class="language-control"><button class="icon-button language-button" data-action="language" aria-label="${t('language')}: ${state.lang.toUpperCase()}" aria-expanded="false">${icon('globe')}<span>${state.lang.toUpperCase()}</span><span class="tiny">⌄</span></button>
      <div class="language-menu" hidden><strong>Interface language</strong>${[['en', 'English'], ['es', 'Español'], ['fr', 'Français']].map(([id, name]) => `<button data-lang="${id}" aria-pressed="${state.lang === id}">${name}${state.lang === id ? icon('check') : ''}</button>`).join('')}<p>Original lesson content is in English.</p></div></div>
    <button class="icon-button" data-action="theme" aria-label="Switch to ${state.theme === 'light' ? 'dark' : 'light'} theme">${icon(state.theme === 'light' ? 'moon' : 'sun')}</button>
    <a class="attribution" href="https://designed-to-scale.vercel.app/" target="_blank" rel="noreferrer"><span class="reference-mark">↗</span><span>inspired by<br><b>Designed to Scale</b></span></a>
  </header>`;
}
function sidebar() {
  return `<div class="drawer-backdrop ${state.drawer ? 'shown' : ''}" data-action="drawer"></div><aside id="course-navigation" class="sidebar ${state.drawer ? 'drawer-open' : ''}" aria-label="Course"><div class="course-heading">${icon('folder')}<b>${t('course')}</b><small>40 ${t('lessons')}</small><button class="icon-button close-drawer" data-action="drawer" aria-label="Close course navigation">${icon('close')}</button></div>
    <nav aria-label="Lessons">${chapters.map(chapter => `<section class="chapter ${state.open.has(chapter.index) ? 'expanded' : ''}">
      <button class="chapter-title" data-chapter="${chapter.index}" aria-expanded="${state.open.has(chapter.index)}">${icon('chevron', 'disclosure')}${icon('folder', 'folder')}<span>${String(chapter.index + 1).padStart(2, '0')}. ${e(chapter.title)}</span><small>${completedCount(chapter)}/${chapter.lessons.length}</small></button>
      <ul>${chapter.lessons.map(id => `<li><a href="${lessonLink(id)}" title="${t('resume')} ${(state.positions[id] ?? 0) + 1}" class="${id === state.lesson.id ? 'current' : ''}" ${id === state.lesson.id ? 'aria-current="page"' : ''}>${icon(state.completed.includes(id) ? 'check' : 'file')}<span>${e(lessons[id].title)}</span></a></li>`).join('')}</ul></section>`).join('')}</nav>
    <details class="progress"><summary><b>${t('progress')}</b><span>${state.completed.length} / 40</span>${icon('chevron')}</summary><div class="progress-detail">${chapters.map(c => `<div><span>${e(c.title)}</span><b>${completedCount(c)}/${c.lessons.length}</b></div>`).join('')}</div><progress value="${state.completed.length}" max="40" aria-label="Completed lessons"></progress></details></aside>`;
}
function lessonView() {
  const { lesson, index } = state;
  const step = lesson.steps[index], chapter = chapterFor(lesson.id);
  const final = index === lesson.steps.length - 1;
  const nextLesson = lessons[lessonOrder[lessonOrder.indexOf(lesson.id) + 1]];
  const metrics = step.metrics || [`${step.visible.length} components`, `${step.edges.length} connections`, `${index + 1}/${lesson.steps.length}`, 'Illustrative'];
  const metricNames = lesson.id === 'design-url-shortener' ? ['Redirect time', 'Store lookups', 'Short codes', 'Links kept'] : ['Components', 'Active paths', 'Lesson step', 'Simulation'];
  return `<main id="lesson" class="lesson-main" tabindex="-1"><section class="lesson-heading"><div class="breadcrumb">${String(chapter.index + 1).padStart(2, '0')}. ${e(chapter.title)} <span>/</span> Lesson ${chapter.lessons.indexOf(lesson.id) + 1} of ${chapter.lessons.length}</div><div class="title-row"><h1>${e(lesson.title)}</h1><div class="badges"><span>${icon('clock')}${lesson.minutes} min</span><span>${icon('chart')}${lesson.difficulty}</span><span>${icon('steps')}${lesson.steps.length} steps</span></div></div><p>${e(lesson.summary)}</p></section>
    <section class="simulation ${state.paused ? 'paused' : ''}" aria-label="Interactive system diagram">
      <div class="readouts">${metrics.map((value, i) => `<div class="readout">${icon(['clock', 'database', 'hash', 'grid'][i])}<span>${metricNames[i]}</span><b>${e(value)}</b></div>`).join('')}</div>
      <div class="playback"><button data-action="replay" aria-label="${t('replay')}">${icon('replay')}<span>${t('replay')}</span></button><button data-action="pause" aria-label="${t(state.paused ? 'play' : 'pause')}" aria-pressed="${state.paused}">${icon(state.paused ? 'play' : 'pause')}<span>${t(state.paused ? 'play' : 'pause')}</span></button></div>
      <div class="diagram-viewport" tabindex="0" aria-label="Diagram viewport: plus and minus zoom, arrows pan when zoomed">${diagram(lesson, step, index, state.theme)}</div>
      <div class="legend"><span class="request">request</span><span class="response">response</span><span class="miss">cache miss</span><span class="write">write / event</span><span class="abuse">abuse</span><span class="failed">× failed request</span></div>
      <div class="zoom-controls"><button data-zoom="-1" aria-label="Zoom out">−</button><button data-zoom="0" aria-label="Fit diagram">Fit</button><button data-zoom="1" aria-label="Zoom in">+</button><button data-action="expand-diagram" aria-label="Show diagram full screen">⤢</button></div>
      <div class="component-note" role="status" hidden></div>
    </section>
    <section class="timeline" aria-label="Lesson steps"><div><b>${t('inLesson')}</b><span>${t('step')} ${index + 1} of ${lesson.steps.length}</span></div><ol>${lesson.steps.map((s, i) => `<li class="${i < index ? 'visited' : ''} ${i === index ? 'active' : ''}"><button data-step="${i}" ${i === index ? 'aria-current="step"' : ''} aria-label="${i + 1} ${e(s.label)}"><span class="step-dot">${i + 1}</span><span class="step-label">${e(s.label)}</span></button></li>`).join('')}</ol></section>
    </main>
    <aside class="guide" aria-label="Step explanation"><section class="step-card"><div class="step-meta"><span>${t('step')} ${index + 1} / ${lesson.steps.length}</span><span class="step-tag ${step.tag.toLowerCase()}">${step.tag}</span></div><div class="step-prose"><h2>${e(step.title)}</h2>${step.body.map(p => `<p>${e(p)}</p>`).join('')}<div class="idea">${icon('bulb')}<div><b>${t('key')}</b><p>${e(step.idea)}</p></div></div>${index ? `<div class="changes"><b>${t('changed')}</b>${stepChanges(lesson, index).map(change => `<p>${e(change)}</p>`).join('')}</div>` : ''}${final ? `<p class="completion">${icon('check')} ${t('completed')}</p>${nextLesson ? `<div class="coming-up"><b>${t('nextLesson')}</b><p>${e(nextLesson.title)}</p><p>${e(nextLesson.summary)}</p></div>` : ''}` : ''}</div>
      <div class="step-navigation"><button data-action="back" ${index === 0 ? 'disabled' : ''}>${icon('arrow', 'reverse')}${t('back')}</button><button class="primary" data-action="${final ? 'next-lesson' : 'next'}" ${final && !nextLesson ? 'disabled' : ''}>${final ? nextLesson ? `${t('nextLesson')}: ${e(nextLesson.title)}` : t('finished') : `${t('next')}: ${e(lesson.steps[index + 1].label)}`}${icon(final && !nextLesson ? 'check' : 'arrow')}</button></div><small class="keyboard-hint">← → step · R replay · Space pause</small></section>
      <section class="goals"><b>${t('goals')}</b><ul>${lesson.goals.map((goal, i) => `<li><span class="goal-check ${index >= Math.ceil((i + 1) / lesson.goals.length * lesson.steps.length) - 1 ? 'checked' : ''}">${icon('check')}</span>${e(goal)}</li>`).join('')}</ul></section></aside>`;
}
function modeView() {
  // The reference exposes these sections as coming-soon controls. Keep that behavior.
  state.mode = 'learn';
  notify(`${t('practice')}, ${t('lab')} and ${t('sheets')} are coming soon — just like the reference. Explore the forty available lessons.`);
}
function render(focusAction) {
  const motionTime = focusAction ? document.querySelector('#system-diagram')?.getCurrentTime() : undefined;
  closeDiagram();
  if (state.index === state.lesson.steps.length - 1 && !state.completed.includes(state.lesson.id)) state.completed.push(state.lesson.id);
  save();
  document.documentElement.dataset.theme = state.theme;
  document.documentElement.lang = state.lang;
  document.querySelector('meta[name="theme-color"]').content = state.theme === 'dark' ? '#24221e' : '#f4ebe0';
  document.title = `${state.lesson.title} · System Design Lab`;
  document.querySelector('#app').innerHTML = `${header()}<div class="workspace">${sidebar()}${lessonView()}</div>`;
  chapters.forEach(c => document.querySelector(`[data-chapter="${c.index}"] .folder`).style.color = c.color);
  applyZoom();
  if (motionTime !== undefined) document.querySelector('#system-diagram').setCurrentTime(motionTime);
  if (state.paused) document.querySelectorAll('animateMotion').forEach(animation => animation.ownerSVGElement.pauseAnimations());
  setDrawer(state.drawer, false);
  if (focusAction) document.querySelector(`[data-action="${focusAction}"]`)?.focus();
}
function setDrawer(open, focus = true) {
  state.drawer = open && narrowScreen.matches;
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('drawer-open', state.drawer);
  sidebar.inert = narrowScreen.matches && !state.drawer;
  document.querySelector('.drawer-backdrop').classList.toggle('shown', state.drawer);
  document.querySelector('.topbar').inert = state.drawer;
  document.querySelector('.lesson-main').inert = state.drawer;
  document.querySelector('.guide').inert = state.drawer;
  const trigger = document.querySelector('.mobile-menu');
  trigger.setAttribute('aria-expanded', String(state.drawer));
  if (focus) (state.drawer ? document.querySelector('.close-drawer') : trigger).focus();
}
narrowScreen.addEventListener('change', () => setDrawer(false, false));
let expandedDiagram;
function expandDiagram() {
  const dialog = document.querySelector('#diagram-dialog');
  const simulation = document.querySelector('.simulation');
  const placeholder = document.createElement('div');
  placeholder.style.height = `${simulation.getBoundingClientRect().height}px`;
  simulation.replaceWith(placeholder);
  expandedDiagram = { simulation, placeholder, trigger: simulation.querySelector('[data-action="expand-diagram"]') };
  dialog.append(simulation);
  expandedDiagram.trigger.dataset.action = 'close-diagram';
  expandedDiagram.trigger.setAttribute('aria-label', 'Close full screen diagram');
  document.body.classList.add('diagram-expanded');
  dialog.showModal();
  expandedDiagram.trigger.focus();
}
function restoreDiagram() {
  if (!expandedDiagram) return;
  const { simulation, placeholder, trigger } = expandedDiagram;
  placeholder.replaceWith(simulation);
  trigger.dataset.action = 'expand-diagram';
  trigger.setAttribute('aria-label', 'Show diagram full screen');
  document.body.classList.remove('diagram-expanded');
  expandedDiagram = undefined;
  trigger.focus();
}
function closeDiagram() {
  const dialog = document.querySelector('#diagram-dialog');
  if (dialog.open) dialog.close();
  restoreDiagram();
}
document.querySelector('#diagram-dialog').addEventListener('close', restoreDiagram);
function go(index) {
  const next = Math.max(0, Math.min(state.lesson.steps.length - 1, index));
  location.hash = `/${state.lesson.id}/${next + 1}`;
}
function applyZoom() {
  const content = document.querySelector('#diagram-content');
  content.setAttribute('transform', `translate(${500 * (1 - state.zoom) + state.pan[0]} ${320 * (1 - state.zoom) + state.pan[1]}) scale(${state.zoom})`);
  document.querySelector('.diagram-viewport').classList.toggle('zoomed', state.zoom > 1);
}
function changeZoom(direction) {
  state.zoom = direction === 0 ? 1 : Math.max(.7, Math.min(3, state.zoom + direction * .25));
  if (state.zoom <= 1) state.pan = [0, 0];
  applyZoom();
}
function movePan(x, y) {
  const limitX = Math.max(0, 500 * (state.zoom - 1));
  const limitY = Math.max(0, 320 * (state.zoom - 1));
  state.pan = [Math.max(-limitX, Math.min(limitX, x)), Math.max(-limitY, Math.min(limitY, y))];
  applyZoom();
}
function pause() {
  state.paused = !state.paused;
  const svg = document.querySelector('#system-diagram');
  if (state.paused) svg.pauseAnimations(); else svg.unpauseAnimations();
  document.querySelector('.simulation').classList.toggle('paused', state.paused);
  const button = document.querySelector('[data-action="pause"]');
  button.innerHTML = icon(state.paused ? 'play' : 'pause') + `<span>${t(state.paused ? 'play' : 'pause')}</span>`;
  button.setAttribute('aria-label', t(state.paused ? 'play' : 'pause'));
  button.setAttribute('aria-pressed', String(state.paused));
}
function replay() {
  const svg = document.querySelector('#system-diagram');
  svg.setCurrentTime(0);
  if (!state.paused) svg.unpauseAnimations();
}
let searchSelection = 0;
let searchResults = [];
function updateSearch(query) {
  const normalized = query.trim().toLowerCase();
  searchResults = Object.values(lessons).filter(lesson => `${lesson.title} ${lesson.summary} ${lesson.steps.map(s => `${s.title} ${s.body.join(' ')}`).join(' ')}`.toLowerCase().includes(normalized)).slice(0, 40);
  searchSelection = 0;
  document.querySelector('#search-results').innerHTML = searchResults.length ? searchResults.map((lesson, i) => `<li role="option" id="result-${i}" aria-selected="${i === 0}"><a href="${lessonLink(lesson.id)}">${icon('file')}<span><b>${e(lesson.title)}</b><small>${e(chapterFor(lesson.id).title)} · ${lesson.steps.length} steps${state.positions[lesson.id] ? ` · ${t('resume')} ${state.positions[lesson.id] + 1}` : ''}</small></span>${icon('arrow')}</a></li>`).join('') : `<li class="empty">${t('empty')}</li>`;
  setSearchSelection();
}
function setSearchSelection() {
  document.querySelectorAll('#search-results [role="option"]').forEach((row, i) => row.setAttribute('aria-selected', String(i === searchSelection)));
  const input = document.querySelector('#search-input');
  if (searchResults.length) input.setAttribute('aria-activedescendant', `result-${searchSelection}`); else input.removeAttribute('aria-activedescendant');
}
function openSearch() {
  if (state.drawer) setDrawer(false);
  const dialog = document.querySelector('#search-dialog');
  dialog.innerHTML = `<div class="search-field">${icon('search')}<label class="sr-only" id="search-title" for="search-input">${t('title')}</label><input id="search-input" role="combobox" aria-controls="search-results" aria-expanded="true" aria-autocomplete="list" placeholder="${t('search')}" autocomplete="off"/><button class="icon-button" data-action="close-search" aria-label="Close search">${icon('close')}</button></div><ul id="search-results" role="listbox" aria-label="Matching lessons"></ul><footer>${t('hint')}</footer>`;
  dialog.showModal();
  updateSearch('');
  document.querySelector('#search-input').focus();
}
document.addEventListener('input', event => { if (event.target.id === 'search-input') updateSearch(event.target.value); });
document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) { event.preventDefault(); document.querySelector('#lesson').focus(); return; }
  const button = event.target.closest('button, [data-action]');
  if (event.target.closest('#search-results a')) document.querySelector('#search-dialog').close();
  if (event.target.closest('.sidebar a') && state.drawer) setDrawer(false);
  if (!event.target.closest('.language-control')) {
    const menu = document.querySelector('.language-menu');
    if (menu) { menu.hidden = true; document.querySelector('[data-action="language"]').setAttribute('aria-expanded', 'false'); }
  }
  if (!button) return;
  if (button.dataset.step !== undefined) return go(Number(button.dataset.step));
  if (button.dataset.chapter !== undefined) {
    const chapter = Number(button.dataset.chapter);
    state.open.has(chapter) ? state.open.delete(chapter) : state.open.add(chapter);
    const section = button.closest('.chapter');
    section.classList.toggle('expanded', state.open.has(chapter));
    button.setAttribute('aria-expanded', String(state.open.has(chapter)));
  }
  if (button.dataset.mode) return button.dataset.mode === 'learn' ? undefined : modeView();
  if (button.dataset.lang) { state.lang = button.dataset.lang; render('language'); notify('Interface language changed. Lesson explanations remain in English.'); }
  if (button.dataset.zoom !== undefined) {
    changeZoom(Number(button.dataset.zoom));
  }
  switch (button.dataset.action) {
    case 'search': openSearch(); break;
    case 'close-search': document.querySelector('#search-dialog').close(); break;
    case 'next': go(state.index + 1); break;
    case 'back': go(state.index - 1); break;
    case 'theme': state.theme = state.theme === 'light' ? 'dark' : 'light'; render('theme'); break;
    case 'pause': pause(); break;
    case 'replay': replay(); break;
    case 'next-lesson': {
      const next = lessonOrder[lessonOrder.indexOf(state.lesson.id) + 1];
      if (next) location.hash = lessonLink(next);
      break;
    }
    case 'expand-diagram': expandDiagram(); break;
    case 'close-diagram': closeDiagram(); break;
    case 'drawer': setDrawer(!state.drawer); break;
    case 'language': {
      const menu = document.querySelector('.language-menu');
      menu.hidden = !menu.hidden; button.setAttribute('aria-expanded', String(!menu.hidden)); break;
    }
  }
});
// SVG components are inspectable without changing simulation state.
function inspectNode(id) {
  const node = state.lesson.nodes.find(n => n.id === id);
  const note = document.querySelector('.component-note');
  const connections = state.lesson.steps[state.index].edges
    .filter(([from, to]) => from === id || to === id)
    .map(([from, to, type]) => `${from === id ? 'To' : 'From'} ${state.lesson.nodes.find(n => n.id === (from === id ? to : from)).name}: ${type === 'miss' ? 'cache miss / storage fallback' : type === 'write' ? 'write / asynchronous event' : type === 'response' ? 'response' : 'request / lookup'}`);
  note.hidden = false;
  note.innerHTML = `<b>${e(node.name)}</b><span>${e(node.detail || node.subtitle || (node.kind === 'people' ? 'Clients start the request and receive its result.' : node.kind === 'database' ? 'Stores records for the dependencies connected below.' : 'Handles the requests and dependencies connected below.'))}</span>${connections.length ? `<ul>${connections.map(connection => `<li>${e(connection)}</li>`).join('')}</ul>` : '<span>No active connections in this step.</span>'}<button class="icon-button" aria-label="Close component details">${icon('close')}</button>`;
  note.querySelector('button').onclick = () => { note.hidden = true; document.querySelector(`[data-node="${id}"]`).focus(); };
}
document.addEventListener('click', event => {
  const node = event.target.closest('[data-node]');
  if (node) inspectNode(node.dataset.node);
});
let drag;
function diagramPoint(event, svg) {
  return new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM().inverse());
}
document.addEventListener('pointerdown', event => {
  const svg = event.target.closest('#system-diagram');
  if (!svg || state.zoom <= 1 || event.button !== 0 || event.target.closest('[data-node]')) return;
  event.preventDefault();
  drag = { svg, origin: diagramPoint(event, svg), pan: [...state.pan], pointerId: event.pointerId };
  svg.setPointerCapture(event.pointerId);
  document.querySelector('.diagram-viewport').classList.add('panning');
});
document.addEventListener('pointermove', event => {
  if (!drag || event.pointerId !== drag.pointerId) return;
  const point = diagramPoint(event, drag.svg);
  movePan(drag.pan[0] + point.x - drag.origin.x, drag.pan[1] + point.y - drag.origin.y);
});
function endDrag(event) {
  if (!drag || event.pointerId !== drag.pointerId) return;
  drag = undefined;
  document.querySelector('.diagram-viewport').classList.remove('panning');
}
document.addEventListener('pointerup', endDrag);
document.addEventListener('pointercancel', endDrag);
document.addEventListener('keydown', event => {
  const search = document.querySelector('#search-dialog');
  const typing = event.target.closest('input, textarea, select, [contenteditable]');
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (!search.open) openSearch(); return; }
  if (search.open) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      searchSelection = Math.max(0, Math.min(searchResults.length - 1, searchSelection + (event.key === 'ArrowDown' ? 1 : -1)));
      setSearchSelection(); document.querySelector(`#result-${searchSelection}`)?.scrollIntoView({ block: 'nearest' });
    }
    if (event.key === 'Enter' && searchResults.length) { event.preventDefault(); location.hash = lessonLink(searchResults[searchSelection].id); search.close(); }
    return;
  }
  if (event.key === 'Escape') {
    if (state.drawer) { event.preventDefault(); setDrawer(false); return; }
    if (document.querySelector('#diagram-dialog').open) return;
    const note = document.querySelector('.component-note');
    if (!note.hidden) { note.querySelector('button').click(); return; }
    const language = document.querySelector('[data-action="language"]');
    if (!document.querySelector('.language-menu').hidden) language.focus();
    document.querySelector('.language-menu').hidden = true;
    language.setAttribute('aria-expanded', 'false');
    return;
  }
  if (state.drawer) {
    if (event.key === 'Tab') {
      const controls = [...document.querySelector('.sidebar').querySelectorAll('button, a, summary')].filter(control => control.getClientRects().length);
      const target = event.shiftKey && event.target === controls[0] ? controls.at(-1) : !event.shiftKey && event.target === controls.at(-1) ? controls[0] : undefined;
      if (target) { event.preventDefault(); target.focus(); }
    }
    return;
  }
  if (typing) return;
  if (event.target.matches('.diagram-viewport')) {
    if (['+', '=', '-', '0'].includes(event.key)) {
      event.preventDefault();
      changeZoom(event.key === '0' ? 0 : event.key === '-' ? -1 : 1);
      return;
    }
    if (state.zoom > 1 && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
      event.preventDefault();
      movePan(state.pan[0] + (event.key === 'ArrowRight' ? -25 : event.key === 'ArrowLeft' ? 25 : 0), state.pan[1] + (event.key === 'ArrowDown' ? -25 : event.key === 'ArrowUp' ? 25 : 0));
      return;
    }
  }
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-node]')) { event.preventDefault(); inspectNode(event.target.dataset.node); return; }
  if (event.key === 'ArrowRight') { event.preventDefault(); go(state.index + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); go(state.index - 1); }
  if (event.key.toLowerCase() === 'r') replay();
  // Space and Enter keep their native activation behavior on controls.
  if (event.target.closest('button, a, summary')) return;
  if (event.key === ' ') { event.preventDefault(); pause(); }
  if (event.key === '/') { event.preventDefault(); openSearch(); }
});
window.addEventListener('hashchange', () => {
  const next = resolveRoute(location.hash);
  if (next.lesson.id !== state.lesson.id) { state.zoom = 1; state.pan = [0, 0]; }
  Object.assign(state, next);
  state.open.add(chapterFor(state.lesson.id).index);
  state.drawer = false;
  save();
  render();
  document.querySelector('#lesson').focus({ preventScroll: true });
});
readSaved();
state.open.add(chapterFor(state.lesson.id).index);
render();
