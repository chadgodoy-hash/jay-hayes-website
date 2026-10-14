// Builds paste-ready HighLevel code blocks for the Jay Hayes site.
//
//   node build.mjs
//
// Output
//   dist/<page>.html          paste into ONE HighLevel "Custom JS/HTML" element
//   dist/split/...            per-page blocks + _site-head / _site-footer (if HighLevel limits code size)
//   dist/preview/<page>.html  full documents for checking in a browser
//   dist/_pages.csv           HighLevel page path + SEO title/description per page
//   dist/site/                standalone static site (folder per page path + img/) for Hostinger
//
// Directives in src files
//   {{include:partial|arg1|arg2}}   src/partials/partial.html ({{arg}} = arg1, {{argN}})
//   {{img:file.jpg}}                image URL: HighLevel Media URL from assets-map.json once set,
//                                   otherwise the local src/img file (preview only)
//   {{config:key}}                  value from src/config.json
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const src = p => path.join(root, 'src', p);
const read = p => fs.readFileSync(src(p), 'utf8');
const readJSON = p => JSON.parse(read(p));

const FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,400;0,500;0,600;1,400&family=Young+Serif&display=swap" rel="stylesheet">';

const strip = o => typeof o !== 'object' || !o ? o : Object.fromEntries(Object.entries(o).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, strip(v)]));
const config = strip(readJSON('config.json'));
const CONFIG_JS = `window.JH_CONFIG = ${JSON.stringify(config)};`;

const mapFile = path.join(root, 'assets-map.json');
const assetMap = fs.existsSync(mapFile) ? JSON.parse(fs.readFileSync(mapFile, 'utf8')) : {};
const usedImages = new Set();
let previewMode = false;
let siteMode = false;
const img = file => {
  usedImages.add(file);
  if (assetMap[file]) return assetMap[file];
  if (siteMode) return `/img/${file}`;
  return previewMode ? `../../src/img/${file}` : `IMAGE-NOT-UPLOADED/${file}`;
};

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// {{resources}}: one row per item in src/data/resources.json
function renderResources() {
  const { items } = readJSON('data/resources.json');
  return items.map((r, i) => {
    const ready = r.status === 'available';
    const id = `res-${esc(r.slug)}`;
    return `<li class="res" data-reveal>
          <div class="res__meta"><span class="res__type">${esc(r.type)}</span><span class="res__format">${esc(r.format)}</span></div>
          <div class="res__body">
            <h2 class="res__title h3">${esc(r.title)}</h2>
            <p class="res__desc">${esc(r.description)}</p>
          </div>
          <div class="res__action">
            <span class="res__status ${ready ? 'res__status--ready' : ''}">${ready ? 'Available now' : 'Coming soon'}</span>
            <button type="button" class="btn ${ready ? '' : 'btn--ghost'} res__toggle" aria-expanded="false" aria-controls="${id}">${ready ? 'Send me the download' : 'Notify me'}</button>
          </div>
          <form class="res__form form" id="${id}" hidden data-signup="${ready ? 'resource-download' : 'resource-waitlist'}" data-tags="${ready ? 'resource-download' : 'resource-waitlist'},resource-${esc(r.slug)}"
            data-success="${ready ? 'Done. Check your inbox for the download link.' : 'You’re on the list. Jay will email you when it’s ready.'}">
            <input type="hidden" name="resource" value="${esc(r.slug)}">
            <input type="hidden" name="resource_title" value="${esc(r.title)}">
            <div class="field"><label for="${id}-email">Email</label><input id="${id}-email" type="email" name="email" autocomplete="email" required></div>
            <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" aria-hidden="true">
            <button type="submit" class="btn">${ready ? 'Email me the link' : 'Add me to the list'}</button>
            <p class="form__msg" aria-live="polite"></p>
          </form>
        </li>`;
  }).join('\n        ');
}

function expand(html) {
  for (let i = 0; i < 6; i++) {
    html = html
      .replace(/\{\{include:([\w-]+)(?:\|([^}]*))?\}\}/g, (_, n, arg = '') => {
        const args = arg.split('|');
        return read(`partials/${n}.html`).replaceAll('{{arg}}', args[0]).replace(/\{\{arg(\d)\}\}/g, (__, k) => args[k - 1] || '');
      })
      .replace(/\{\{img:([^}]+)\}\}/g, (_, f) => img(f.trim()))
      .replace(/\{\{resources\}\}/g, () => renderResources())
      .replace(/\{\{config:([\w.]+)\}\}/g, (_, k) => k.split('.').reduce((o, x) => o?.[x], config) ?? '');
  }
  return html;
}

const pageMeta = readJSON('pages.json');
const shared = { css: read('global.css'), js: read('global.js') };
fs.rmSync(path.join(root, 'dist'), { recursive: true, force: true });
for (const d of ['dist/preview', 'dist/split', 'dist/site/img']) fs.mkdirSync(path.join(root, d), { recursive: true });

const csv = [['dist file', 'HighLevel page path', 'SEO title', 'SEO description']];
for (const f of fs.readdirSync(src('pages')).filter(f => f.endsWith('.html'))) {
  const name = f.replace('.html', '');
  const build = () => expand(`<div class="jh">\n${read('header.html')}\n${read(`pages/${f}`)}\n${read('footer.html')}\n</div>`);
  const wrap = inner => `<!-- Jay Hayes | page: ${name} | generated by build.mjs; edit src/, not this file -->
${FONTS}
<style>
${shared.css}
</style>
<script>${CONFIG_JS}</script>
${inner}
<script>
${shared.js}
</script>
`;
  previewMode = false;
  const inner = build();
  const block = wrap(inner);
  fs.writeFileSync(path.join(root, 'dist', f), block);
  fs.writeFileSync(path.join(root, 'dist/split', f), `<!-- Jay Hayes | page: ${name} (split mode) -->\n${inner}\n`);
  previewMode = true;
  fs.writeFileSync(path.join(root, 'dist/preview', f),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Preview: ${name}</title>` +
    `<style>body{margin:0;background:#F3F1F8}</style></head><body>\n${wrap(build())}</body></html>\n`);

  const m = pageMeta[name] || {};
  previewMode = false; siteMode = true;
  const siteDir = path.join(root, 'dist/site', (m.path || `/${name}`).replace(/^\//, ''));
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'),
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${esc(m.title || name)}</title><meta name="description" content="${esc(m.description || '')}">` +
    `<style>body{margin:0;background:#F3F1F8}</style></head><body>\n${wrap(build())}</body></html>\n`);
  siteMode = false;
  csv.push([`${f}`, m.path || '?', m.title || '?', m.description || '']);
  const warn = [];
  const left = block.match(/\{\{[^}]*\}\}/g);
  if (left) warn.push('UNRESOLVED ' + [...new Set(left)].join(' '));
  if (block.includes('IMAGE-NOT-UPLOADED')) warn.push('images not uploaded');
  if (inner.includes('data-signup=') && !config.signupWebhook) warn.push('forms not connected');
  if (inner.includes('data-booking') && !config.bookingCalendarUrl) warn.push('booking calendar not connected');
  console.log(`${name.padEnd(22)} ${(block.length / 1024).toFixed(0).padStart(3)} KB${warn.length ? '  ⚠ ' + warn.join(', ') : ''}`);
}
fs.writeFileSync(path.join(root, 'dist/_pages.csv'), csv.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n') + '\n');
fs.writeFileSync(path.join(root, 'dist/split/_site-head.html'), `<!-- Jay Hayes | site-wide HEAD code -->\n${FONTS}\n<style>\n${shared.css}\n</style>\n<script>${CONFIG_JS}</script>\n`);
fs.writeFileSync(path.join(root, 'dist/split/_site-footer.html'), `<!-- Jay Hayes | site-wide FOOTER code -->\n<script>\n${shared.js}\n</script>\n`);

for (const f of usedImages) if (!assetMap[f]) fs.copyFileSync(src(`img/${f}`), path.join(root, 'dist/site/img', f));

const merged = Object.fromEntries([...usedImages].sort().map(f => [f, assetMap[f] || '']));
fs.writeFileSync(mapFile, JSON.stringify(merged, null, 2) + '\n');
const todo = Object.values(merged).filter(v => !v).length;
console.log(`\nImages: ${usedImages.size} used, ${todo} not yet uploaded to HighLevel (see README).`);
if (!config.signupWebhook) console.log('⚠ Forms not connected: set signupWebhook in src/config.json.');
if (!config.bookingCalendarUrl) console.log('⚠ Booking not connected: set bookingCalendarUrl in src/config.json.');
