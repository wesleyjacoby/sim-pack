// Compiles content/*.md into pack/notes.json, the single file you import into the app.
import fs from 'node:fs';
import path from 'node:path';

const GROUPS = ['memorise', 'reference', 'review'];
const COVERS = ['none', 'values', 'blocks'];
const errors = [];
const ids = new Set();
const pages = [];

if (!fs.existsSync('content')) { console.error('No content/ folder.'); process.exit(1); }
const files = fs.readdirSync('content').filter((f) => f.endsWith('.md')).sort();
if (!files.length) { console.error('No .md files in content/'); process.exit(1); }

function parse(text) {
  const m = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return null;
  const meta = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, md: m[2].trim() };
}

for (const f of files) {
  const parsed = parse(fs.readFileSync(path.join('content', f), 'utf8'));
  if (!parsed) { errors.push(`${f}: missing front matter (--- block at the top)`); continue; }
  const { meta, md } = parsed;
  for (const k of ['id', 'title', 'group', 'order']) if (!meta[k]) errors.push(`${f}: missing "${k}"`);
  if (meta.group && !GROUPS.includes(meta.group)) errors.push(`${f}: group must be one of ${GROUPS.join(', ')}`);
  const cover = meta.cover || 'none';
  if (!COVERS.includes(cover)) errors.push(`${f}: cover must be one of ${COVERS.join(', ')}`);
  if (ids.has(meta.id)) errors.push(`${f}: duplicate id "${meta.id}"`);
  ids.add(meta.id);

  // content checks
  const covers = (md.match(/==/g) || []).length;
  if (covers % 2) errors.push(`${f}: unbalanced == cover marks`);
  const open = (md.match(/\{/g) || []).length, close = (md.match(/\}/g) || []).length;
  if (open !== close) errors.push(`${f}: unbalanced { } source marks`);
  let cols = 0;
  md.split('\n').forEach((line, n) => {
    if (!line.startsWith('|')) { cols = 0; return; }
    const cells = line.replace(/\|\s*$/, '').split('|').length - 1;
    if (!cols) cols = cells;
    else if (cells !== cols) errors.push(`${f}:${n + 1}: table row has ${cells} cells, header has ${cols}`);
  });

  pages.push({ id: meta.id, title: meta.title, group: meta.group, order: Number(meta.order), summary: meta.summary || '', cover, md });
}

if (errors.length) { console.error(errors.join('\n') + `\n\n${errors.length} problem(s). Nothing written.`); process.exit(1); }
pages.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group) || a.order - b.order);
fs.mkdirSync('pack', { recursive: true });
fs.writeFileSync('pack/notes.json', JSON.stringify({ format: 1, builtAt: new Date().toISOString(), pages }));
console.log(`pack/notes.json written: ${pages.length} pages`);
