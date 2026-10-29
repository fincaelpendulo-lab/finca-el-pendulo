// Writes src/styles/tokens.css from design-system/tokens.json (the Finca El Péndulo design system).
// Run after copying a new tokens.json from the design system: npm run tokens
import { readFile, writeFile } from 'node:fs/promises';

const t = JSON.parse(await readFile('design-system/tokens.json', 'utf8'));
const colors = Object.fromEntries(t.color.tokens.map((x) => [x.name, x.value]));
const resolve = (v) => { while (typeof v === 'string' && v.startsWith('{')) v = colors[v.slice(1, -1)]; return v; };

const lines = ['/* Finca El Péndulo: generated from design-system/tokens.json (npm run tokens). Do not edit by hand. */', ':root {'];
for (const x of t.color.tokens) lines.push(`  --${x.name}: ${resolve(x.value)};`);
for (const fam of ['spacing', 'radius', 'shadow']) for (const x of t[fam]?.tokens ?? []) lines.push(`  --${x.name}: ${x.value};`);
lines.push('  --font-display: "Newsreader Variable", Newsreader, Georgia, "Times New Roman", serif;');
lines.push('  --font-text: "Tenor Sans", system-ui, sans-serif;');
lines.push('}');
await writeFile('src/styles/tokens.css', lines.join('\n') + '\n');
console.log('src/styles/tokens.css written');
