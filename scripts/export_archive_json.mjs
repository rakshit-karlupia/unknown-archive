import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import esbuild from '../frontend/node_modules/esbuild/lib/main.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const entry = path.join(rootDir, 'frontend', 'src', 'data', 'index.ts');
const tempOut = path.join(rootDir, 'scripts', '.tmp-data-bundle.mjs');
const targetJson = path.join(rootDir, 'backend', 'app', 'data', 'archive_seed.json');

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: tempOut,
});

const mod = await import(`file:///${tempOut.replace(/\\/g, '/')}`);
const payload = {
  categories: mod.CATEGORIES,
  discoveries: mod.RECENT_DISCOVERIES,
  sources: mod.RESEARCH_SOURCES,
  mysteries: mod.MYSTERIES,
};

fs.mkdirSync(path.dirname(targetJson), { recursive: true });
fs.writeFileSync(targetJson, JSON.stringify(payload, null, 2), 'utf-8');
fs.unlinkSync(tempOut);

console.log(
  `Exported ${payload.mysteries.length} mysteries and ${payload.sources.length} sources to ${targetJson}`
);
