// Replaces the alif/hamza mark with Hud the Hoopoe's head+crest (the same
// "mark" pose used in-app for the navbar/footer) as the favicon and PWA
// icons. Same supersampled pngjs pipeline as generate-icons.mjs.
//
// Background handling per file:
//   - favicon-32: off-white (--color-bg elsewhere in the app) — plain
//     transparent blurred into an unreadable blob at 32px with nothing to
//     contrast against.
//   - icon-192, icon-512: transparent (no background), per request — these
//     are the actual installed-app/home-screen icons, and read cleanly at
//     their size.
//   - apple-touch-icon: kept navy — iOS does not support alpha on touch
//     icons and renders transparent areas as solid black regardless of
//     what's in the file, an Apple platform limitation, not a bug here.
//   - icon-maskable-512: MUST keep an opaque background that fills the full
//     canvas — Android's adaptive-icon system crops a maskable icon into a
//     circle/squircle/etc and expects the whole square to be solid, or the
//     mask reveals transparent gaps. Kept navy per the existing theme_color.
import { PNG } from 'pngjs';
import { createWriteStream, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'frontend', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const CREAM = [0xe8, 0xc9, 0x8f];
const TERRACOTTA = [0xc1, 0x60, 0x2c];
const BLACK = [0x1c, 0x1a, 0x17];
const WHITE = [0xff, 0xff, 0xff];
const NAVY = [0x12, 0x3a, 0x66];
const OFFWHITE = [0xfb, 0xf9, 0xf3]; // matches --color-bg elsewhere in the app
const SUPERSAMPLE = 4;

function bezierPoint(p0, p1, p2, t) {
  const mt = 1 - t;
  return [mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0], mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]];
}
function insideTaperedCurve(x, y, p0, p1, p2, widthStart, widthEnd, steps = 24) {
  let best = Infinity;
  let bestT = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const [bx, by] = bezierPoint(p0, p1, p2, t);
    const d = Math.hypot(x - bx, y - by);
    if (d < best) {
      best = d;
      bestT = t;
    }
  }
  const width = widthStart + (widthEnd - widthStart) * bestT;
  return best <= width / 2;
}
function insideTriangle(x, y, [x1, y1], [x2, y2], [x3, y3]) {
  const d = (x1 - x3) * (y2 - y3) - (x2 - x3) * (y1 - y3);
  const a = ((y2 - y3) * (x - x3) + (x3 - x2) * (y - y3)) / d;
  const b = ((y3 - y1) * (x - x3) + (x1 - x3) * (y - y3)) / d;
  const c = 1 - a - b;
  return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
}
function insideCircle(x, y, cx, cy, r) {
  return Math.hypot(x - cx, y - cy) <= r;
}

// Local coordinate system: a 70x70 box matching the in-app "mark" viewBox
// crop of Hud's head+crest, translated so (0,0) is the box's top-left.
const CREST_TERRACOTTA = [
  [[39, 36], [35, 15], [44, 31]],
  [[48, 32], [48, 9], [55, 29]],
  [[57, 36], [62, 17], [60, 32]],
];
const CREST_BLACK_TIPS = [
  [[35, 16], [31, 8], [39, 14]],
  [[48, 10], [45, 2], [51, 8]],
  [[61, 18], [65, 9], [58, 14]],
];
const HEAD = { cx: 48, cy: 52, r: 19 };
const BEAK = { p0: [28, 54], p1: [10, 57], p2: [2, 60], wStart: 8, wEnd: 0.8 };
const EYE = { cx: 42, cy: 50, r: 3.6 };
const EYE_HIGHLIGHT = { cx: 43.2, cy: 48.8, r: 1 };

function pixelHud(x, y, size, cx, cy, contentRadius, { background = null, maskable = false } = {}) {
  let rgb = background;

  const boxSize = maskable ? 70 / 0.72 : 70; // maskable: shrink content into the ~72% safe zone
  // Transparent icons can bleed to the edge for less dead space; icons with
  // a background fill need breathing room so the mark doesn't look cropped.
  const fill = maskable ? 0.92 : background ? 0.86 : 1.12;
  const scale = (contentRadius * 2 * fill) / boxSize;
  const offsetX = cx - (boxSize * scale) / 2;
  const offsetY = cy - (boxSize * scale) / 2;
  const localExtra = maskable ? (boxSize - 70) / 2 : 0;
  const lx = (x - offsetX) / scale - localExtra;
  const ly = (y - offsetY) / scale - localExtra;

  if (insideCircle(lx, ly, HEAD.cx, HEAD.cy, HEAD.r)) rgb = CREAM;
  for (const tri of CREST_TERRACOTTA) if (insideTriangle(lx, ly, ...tri)) rgb = TERRACOTTA;
  for (const tri of CREST_BLACK_TIPS) if (insideTriangle(lx, ly, ...tri)) rgb = BLACK;
  if (insideTaperedCurve(lx, ly, BEAK.p0, BEAK.p1, BEAK.p2, BEAK.wStart, BEAK.wEnd)) rgb = BLACK;
  if (insideCircle(lx, ly, EYE.cx, EYE.cy, EYE.r)) rgb = BLACK;
  if (insideCircle(lx, ly, EYE_HIGHLIGHT.cx, EYE_HIGHLIGHT.cy, EYE_HIGHLIGHT.r)) rgb = WHITE;

  return rgb;
}

function drawIcon(size, opts) {
  const ss = size * SUPERSAMPLE;
  const cx = ss / 2;
  const cy = ss / 2;
  const contentRadius = ss / 2;

  const big = new Uint8ClampedArray(ss * ss * 4);
  for (let y = 0; y < ss; y++) {
    for (let x = 0; x < ss; x++) {
      const idx = (ss * y + x) * 4;
      const rgb = pixelHud(x, y, ss, cx, cy, contentRadius, opts);
      if (!rgb) continue;
      big[idx] = rgb[0];
      big[idx + 1] = rgb[1];
      big[idx + 2] = rgb[2];
      big[idx + 3] = 255;
    }
  }

  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      for (let sy = 0; sy < SUPERSAMPLE; sy++) {
        for (let sx = 0; sx < SUPERSAMPLE; sx++) {
          const srcIdx = (ss * (y * SUPERSAMPLE + sy) + (x * SUPERSAMPLE + sx)) * 4;
          const alpha = big[srcIdx + 3] / 255;
          r += big[srcIdx] * alpha;
          g += big[srcIdx + 1] * alpha;
          b += big[srcIdx + 2] * alpha;
          a += alpha;
        }
      }
      const n = SUPERSAMPLE * SUPERSAMPLE;
      const dstIdx = (size * y + x) << 2;
      if (a > 0) {
        png.data[dstIdx] = Math.round(r / a);
        png.data[dstIdx + 1] = Math.round(g / a);
        png.data[dstIdx + 2] = Math.round(b / a);
      }
      png.data[dstIdx + 3] = Math.round((a / n) * 255);
    }
  }
  return png;
}

function save(png, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outDir, filename);
    png.pack().pipe(createWriteStream(dest)).on('finish', resolve).on('error', reject);
  });
}

const jobs = [
  // favicon: off-white (matches the app's own parchment background) instead
  // of navy, at the user's request. apple-touch-icon keeps navy - iOS
  // renders transparent touch icons as solid black regardless (Apple
  // platform limitation), so better to choose the fill intentionally than
  // let the OS pick an ugly default. icon-192/icon-512 (the actual
  // PWA/home-screen icons on Android and everywhere else) stay transparent.
  [32, 'favicon-32.png', { background: OFFWHITE }],
  [180, 'apple-touch-icon.png', { background: NAVY }],
  [192, 'icon-192.png', { background: null }],
  [512, 'icon-512.png', { background: null }],
  [512, 'icon-maskable-512.png', { background: NAVY, maskable: true }],
];

for (const [size, filename, opts] of jobs) {
  const png = drawIcon(size, opts);
  await save(png, filename);
  console.log(`Wrote ${filename}`);
}
