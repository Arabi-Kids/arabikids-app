// One-off script: draws simple brand-colored app icons (blue background,
// gold circle, white "alif" stroke — Alif is Junior Lesson 1) so the PWA
// manifest has real, valid PNGs instead of missing files. Swap these for a
// real logo whenever design assets are ready; this is a placeholder mark,
// not a final brand icon.
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

function drawIcon(size, { padding = 0, roundedBg = true } = {}) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;
  const contentRadius = (size - padding * 2) / 2;
  const cornerRadius = size * 0.18;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Background: rounded-square blue, transparent outside the rounded corners
      // (or outside the content circle, for the maskable padded variant).
      let inBg;
      if (roundedBg) {
        inBg = insideRoundedSquare(x, y, size, cornerRadius);
      } else {
        inBg = Math.hypot(x - cx, y - cy) <= contentRadius;
      }

      if (!inBg) {
        png.data[idx] = 0;
        png.data[idx + 1] = 0;
        png.data[idx + 2] = 0;
        png.data[idx + 3] = 0;
        continue;
      }

      let [r, g, b] = BLUE;

      // Gold circle mark in the center (60% of content radius).
      const distFromCenter = Math.hypot(x - cx, y - cy);
      const goldRadius = contentRadius * 0.62;
      const aBarHalfWidth = contentRadius * 0.09;
      const aBarHalfHeight = contentRadius * 0.4;

      if (distFromCenter <= goldRadius) {
        [r, g, b] = GOLD;
      }
      // White "alif" stroke (a simple rounded vertical bar) on top of the gold circle.
      if (Math.abs(x - cx) <= aBarHalfWidth && Math.abs(y - cy) <= aBarHalfHeight) {
        [r, g, b] = WHITE;
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
  return png;
}

function insideRoundedSquare(x, y, size, radius) {
  const nearestX = Math.min(Math.max(x, radius), size - radius);
  const nearestY = Math.min(Math.max(y, radius), size - radius);
  if (x >= radius && x <= size - radius) return y >= 0 && y <= size; // middle band, full height
  if (y >= radius && y <= size - radius) return x >= 0 && x <= size; // middle band, full width
  return Math.hypot(x - nearestX, y - nearestY) <= radius;
}

function save(png, filename) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outDir, filename);
    png.pack().pipe(createWriteStream(dest)).on('finish', resolve).on('error', reject);
  });
}

const jobs = [
  [192, 'icon-192.png', { roundedBg: true }],
  [512, 'icon-512.png', { roundedBg: true }],
  // Maskable icons need the visual content inside a smaller "safe zone" circle
  // (roughly the center 80%) since the OS may crop to a circle/squircle.
  [512, 'icon-maskable-512.png', { roundedBg: false, padding: 512 * 0.1 }],
  [180, 'apple-touch-icon.png', { roundedBg: true }],
];

for (const [size, filename, opts] of jobs) {
  await save(drawIcon(size, opts), filename);
  console.log(`Wrote ${filename}`);
}
