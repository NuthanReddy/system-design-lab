const paths = {
  book: '<path d="M12 5c-3-2-6-2-9-1v14c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1Z"/><path d="M12 5v14"/>',
  search: '<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
  moon: '<path d="M20 13A8 8 0 0 1 11 4 8 8 0 1 0 20 13Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  replay: '<path d="M4 10a8 8 0 1 1 1 8M4 3v7h7"/>',
  pause: '<path d="M8 5h2v14H8zM14 5h2v14h-2z"/>',
  play: '<path d="m8 4 12 8-12 8Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  steps: '<path d="M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1"/>',
  chart: '<path d="M4 20v-5m5 5V11m5 9V7m5 13V3"/>',
  bulb: '<path d="M8 16c0-3-3-4-3-7a7 7 0 0 1 14 0c0 3-3 4-3 7M8 17h8m-7 4h6M12 5v5"/>',
  server: '<rect x="3" y="3" width="18" height="7" rx="2"/><rect x="3" y="14" width="18" height="7" rx="2"/><path d="M6 6h1m0 11H6m7-11h5m-5 11h5"/>',
  database: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  hash: '<path d="m9 2-3 20M18 2l-3 20M3 8h19M2 16h19"/>',
  bolt: '<path d="m14 2-9 12h7l-2 8 9-12h-7Z"/>',
  shield: '<path d="m12 2 9 4v6c0 5-9 10-9 10S3 17 3 12V6Z"/><path d="m8 12 3 3 5-6"/>',
  queue: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M7 9v6m5-6v6m5-6v6"/>',
  lab: '<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M7 6v1m4-1v1"/>',
  grid: '<rect x="3" y="3" width="6" height="6"/><rect x="15" y="3" width="6" height="6"/><rect x="3" y="15" width="6" height="6"/><rect x="15" y="15" width="6" height="6"/>',
  gear: '<path d="m9 3 1-2h4l1 2 3 2 2 1v4l-2 1v3l2 1v4l-2 1-3 2-1 2h-4l-1-2-3-2-2-1v-4l2-1v-3-1l-2-1V6l2-1Z" transform="translate(2 0) scale(.85)"/><circle cx="12" cy="12" r="3"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  folder: '<path d="M2 6h8l2 3h10v11H2Z"/>',
  file: '<path d="M5 2h9l5 5v15H5Z"/><path d="M14 2v6h5"/>',
  network: '<rect x="8" y="2" width="8" height="5" rx="1"/><rect x="2" y="16" width="8" height="5" rx="1"/><rect x="14" y="16" width="8" height="5" rx="1"/><path d="M12 7v5M6 16v-4h12v4"/>',
};
export function icon(name, className = '') {
  return `<svg class="icon ${className}" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.server}</svg>`;
}
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
