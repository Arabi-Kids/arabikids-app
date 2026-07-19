// Draws ArabiKids app/favicon icons with supersampled anti-aliasing (render at
// 4x, box-downsample to target size) so edges/circles are smooth instead of
// the jagged pixel-math version this replaces.
//
// Two variants are generated side by side so they can be previewed before
// picking one — see scripts/preview-icons.html.
//   A: blue rounded-square bg, gold circle, white "alif" bar (original mark)
//   B: gold rounded-square bg, blue open-book glyph (alternate concept)
import { PNG } from 'pngjs';
import { createWriteStream, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', 'frontend', 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const BLUE = [0x1b, 0x4f, 0x8a];
const GOLD = [0xc8, 0x96, 0x0c];
const WHITE = [0xff, 0xff, 0xff];
const SUPERSAMPLE = 4;

function insideRoundedSquare(x, y, size, radius) {
  if (x >= radius && x <= size - radius) return true;
  if (y >= radius && y <= size - radius) return true;
  const nearestX = Math.min(Math.max(x, radius), size - radius);
  const nearestY = Math.min(Math.max(y, radius), size - radius);
  return Math.hypot(x - nearestX, y - nearestY) <= radius;
}

// variant A: blue bg + gold circle + white "alif with hamza above" (أ)
// `maskable`: skip rounded-square clipping (full-bleed background instead) and
// shrink the glyph so it stays inside the ~80% safe zone OSes use when
// masking a maskable icon into their own shape.
function pixelA(x, y, size, cx, cy, contentRadius, maskable = false) {
  if (!maskable && !insideRoundedSquare(x, y, size, size * 0.18)) return null;
  if (maskable) contentRadius *= 0.8;
  let rgb = BLUE;
  const dist = Math.hypot(x - cx, y - cy);
  const goldRadius = contentRadius * 0.62;
  if (dist <= goldRadius) rgb = GOLD;

  // The alif stroke, shifted down slightly to leave headroom for the hamza.
  const barHalfW = contentRadius * 0.085;
  const barHalfH = contentRadius * 0.32;
  const barCenterY = cy + contentRadius * 0.1;
  const barTop = barCenterY - barHalfH;
  if (Math.abs(x - cx) <= barHalfW && y >= barTop && y <= barCenterY + barHalfH) rgb = WHITE;

  // Hamza: a small open hook perched just above/right of the stroke's top —
  // a short arc (not a near-closed ring, or it reads as a dotted "i") so it
  // reads as a curling hook rather than a loop.
  const hamzaCx = cx + contentRadius * 0.05;
  const hamzaCy = barTop - contentRadius * 0.03;
  const hamzaRadius = contentRadius * 0.125;
  const hamzaStroke = contentRadius * 0.05;
  const hdx = x - hamzaCx;
  const hdy = y - hamzaCy;
  const hr = Math.hypot(hdx, hdy);
  if (hr >= hamzaRadius - hamzaStroke / 2 && hr <= hamzaRadius + hamzaStroke / 2) {
    let angle = (Math.atan2(-hdy, hdx) * 180) / Math.PI; // 0=right, 90=up, standard math convention
    if (angle < 0) angle += 360;
    const gapCenter = 205; // gap faces lower-left; visible arc curls from right, over the top
    const gapHalfWidth = 125;
    const diff = Math.min(Math.abs(angle - gapCenter), 360 - Math.abs(angle - gapCenter));
    if (diff > gapHalfWidth) rgb = WHITE;
  }

  return rgb;
}

// variant B: gold bg + blue open-book glyph (two angled pages meeting at a spine)
function pixelB(x, y, size, cx, cy, contentRadius) {
  if (!insideRoundedSquare(x, y, size, size * 0.18)) return null;
  let rgb = GOLD;

  const bookHalfW = contentRadius * 0.72;
  const bookHalfH = contentRadius * 0.48;
  const spineX = cx;
  const top = cy - bookHalfH;
  const bottom = cy + bookHalfH;

  if (y >= top && y <= bottom) {
    // Each page's outer edge curves slightly upward (a simple parabola) away
    // from the spine, giving an open-book silhouette instead of a flat box.
    const t = (y - cy) / bookHalfH; // -1..1
    const curve = (1 - t * t) * (contentRadius * 0.06);
    const leftOuter = spineX - bookHalfW + curve;
    const rightOuter = spineX + bookHalfW - curve;
    const pageGap = contentRadius * 0.025;

    const onLeftPage = x >= leftOuter && x <= spineX - pageGap;
    const onRightPage = x >= spineX + pageGap && x <= rightOuter;
    const nearTopEdge = y - top < contentRadius * 0.05;
    const nearBottomEdge = bottom - y < contentRadius * 0.05;
    const nearOuterEdge =
      (onLeftPage && x - leftOuter < contentRadius * 0.05) ||
      (onRightPage && rightOuter - x < contentRadius * 0.05);

    if (onLeftPage || onRightPage) {
      rgb = nearTopEdge || nearBottomEdge || nearOuterEdge ? BLUE : WHITE;
    }
    // spine
    if (Math.abs(x - spineX) <= pageGap) rgb = BLUE;
  }
  return rgb;
}

function drawIcon(size, pixelFn) {
  const ss = size * SUPERSAMPLE;
  const cx = ss / 2;
  const cy = ss / 2;
  const contentRadius = ss / 2;

  // Render at supersampled resolution into a flat rgba buffer.
  const big = new Uint8ClampedArray(ss * ss * 4);
  for (let y = 0; y < ss; y++) {
    for (let x = 0; x < ss; x++) {
      const idx = (ss * y + x) * 4;
      const rgb = pixelFn(x, y, ss, cx, cy, contentRadius);
      if (!rgb) continue; // leave transparent
      big[idx] = rgb[0];
      big[idx + 1] = rgb[1];
      big[idx + 2] = rgb[2];
      big[idx + 3] = 255;
    }
  }

  // Box-downsample SUPERSAMPLE x SUPERSAMPLE -> 1 pixel, averaging alpha-weighted color.
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

// Final production files — variant A (alif + hamza) won the review.
const jobs = [
  [32, 'favicon-32.png', pixelA, false],
  [180, 'apple-touch-icon.png', pixelA, false],
  [192, 'icon-192.png', pixelA, false],
  [512, 'icon-512.png', pixelA, false],
  [512, 'icon-maskable-512.png', pixelA, true],
];

for (const [size, filename, pixelFn, maskable] of jobs) {
  const png = drawIcon(size, (x, y, s, cx, cy, r) => pixelFn(x, y, s, cx, cy, r, maskable));
  await save(png, filename);
  console.log(`Wrote ${filename}`);
}
