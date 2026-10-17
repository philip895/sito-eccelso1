// Generates optimised responsive JPEGs from the original photography.
//   node tools/images.mjs          (macOS — uses the built-in `sips`)
// Output: assets/images/<category>/web/<slug>-<width>.jpg + assets/images/manifest.json
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync, statSync, readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { images } from '../src/content.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const imgRoot = join(root, 'assets/images');
const TARGETS = [480, 960, 1600, 2400];
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const dims = (file) => {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file]).toString();
  return { w: +out.match(/pixelWidth: (\d+)/)[1], h: +out.match(/pixelHeight: (\d+)/)[1] };
};

const manifest = {};
const tmp = mkdtempSync(join(tmpdir(), 'eccelso-lqip-'));
let made = 0;
for (const [key, { src }] of Object.entries(images)) {
  const input = join(imgRoot, src);
  if (!existsSync(input)) throw new Error(`Missing source image: ${src}`);
  const cat = src.split('/')[0];
  const outDir = join(imgRoot, cat, 'web');
  mkdirSync(outDir, { recursive: true });
  const { w, h } = dims(input);
  const widths = [...new Set([...TARGETS.filter((t) => t < w * 0.92), Math.min(w, 2400)])].sort((a, b) => a - b);
  const files = [];
  for (const tw of widths) {
    const name = `${kebab(key)}-${tw}.jpg`;
    const out = join(outDir, name);
    if (!existsSync(out) || statSync(out).mtimeMs < statSync(input).mtimeMs) {
      const q = tw >= 1600 ? '68' : '74';
      execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', q, '-s', 'dpiWidth', '72', '-s', 'dpiHeight', '72', '--resampleWidth', String(tw), input, '--out', out], { stdio: 'ignore' });
      made++;
    }
    files.push({ w: tw, path: `assets/images/${cat}/web/${name}` });
  }
  // tiny blurred placeholder (inlined as a CSS background while the real image loads)
  const lq = join(tmp, `${kebab(key)}.png`);
  execFileSync('sips', ['-s', 'format', 'png', '--resampleWidth', '16', input, '--out', lq], { stdio: 'ignore' });
  const lqip = `data:image/png;base64,${readFileSync(lq).toString('base64')}`;
  manifest[key] = { w, h, files, lqip };
}
rmSync(tmp, { recursive: true, force: true });
writeFileSync(join(imgRoot, 'manifest.json'), JSON.stringify(manifest, null, 1));
console.log(`images: ${Object.keys(manifest).length} sources, ${made} files generated`);
