import sharp from 'sharp';
import path from 'path';

const INPUT = 'C:/Users/USER/.gemini/antigravity/brain/3990b80a-8ae5-4e98-a32d-161e4ba901c6/.user_uploaded/media_1795510754206_f03f3622.jpg';
const OUTPUT = path.resolve('public/profile-hero.png');

const { data, info } = await sharp(INPUT)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const lum = new Float32Array(width * height);
for (let i = 0; i < width * height; i++) {
  const o = i * channels;
  lum[i] = (data[o] + data[o + 1] + data[o + 2]) / 3;
}

// Compute Sobel gradient magnitude to detect subject edges
const grad = new Float32Array(width * height);
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = y * width + x;
    const gx =
      -lum[idx - width - 1] + lum[idx - width + 1] +
      -2 * lum[idx - 1] + 2 * lum[idx + 1] +
      -lum[idx + width - 1] + lum[idx + width + 1];
    const gy =
      -lum[idx - width - 1] - 2 * lum[idx - width] - lum[idx - width + 1] +
      lum[idx + width - 1] + 2 * lum[idx + width] + lum[idx + width + 1];
    grad[idx] = Math.sqrt(gx * gx + gy * gy) / 4;
  }
}

const visited = new Uint8Array(width * height);
const isBg = new Uint8Array(width * height);
const queue = new Int32Array(width * height);
let head = 0;
let tail = 0;

// Protect interior face/neck region so bright skin highlights are never touched
function isProtectedFace(x, y) {
  // Face + neck + ears interior (for 768x1024 portrait)
  const cx = width * 0.505;
  const cy = height * 0.38;
  const rx = width * 0.175;
  const ry = height * 0.21;
  const dx = (x - cx) / rx;
  const dy = (y - cy) / ry;
  if (dx * dx + dy * dy <= 1.0) return true;

  // Neck region (tight to neck width)
  if (x >= width * 0.40 && x <= width * 0.61 && y >= height * 0.51 && y <= height * 0.64) {
    return true;
  }
  return false;
}

function enqueue(x, y, prevLum) {
  if (x < 0 || x >= width || y < 0 || y >= height) return;
  const idx = y * width + x;
  if (visited[idx]) return;
  if (isProtectedFace(x, y)) return;

  const l = lum[idx];
  // Background studio gray is smooth and in [148..225]
  if (l < 145 || l > 225) return;
  // Stop at edges (hair strands, ear outline, shirt collar/shoulders)
  if (grad[idx] > 12) return;
  if (prevLum !== null && Math.abs(l - prevLum) > 6) return;

  visited[idx] = 1;
  isBg[idx] = 1;
  queue[tail++] = idx;
}

for (let x = 0; x < width; x++) {
  enqueue(x, 0, null);
  enqueue(x, height - 1, null);
}
for (let y = 0; y < height; y++) {
  enqueue(0, y, null);
  enqueue(width - 1, y, null);
}

while (head < tail) {
  const idx = queue[head++];
  const x = idx % width;
  const y = (idx - x) / width;
  const curLum = lum[idx];
  enqueue(x + 1, y, curLum);
  enqueue(x - 1, y, curLum);
  enqueue(x, y + 1, curLum);
  enqueue(x, y - 1, curLum);
}

// Dilate background 1px into bright edge pixels (l > 165) to remove gray fringe around hair/ears
const dilateBg = new Uint8Array(isBg);
for (let y = 1; y < height - 1; y++) {
  for (let x = 1; x < width - 1; x++) {
    const idx = y * width + x;
    if (isBg[idx] || isProtectedFace(x, y)) continue;
    if (
      lum[idx] > 165 &&
      (isBg[idx - 1] || isBg[idx + 1] || isBg[idx - width] || isBg[idx + width])
    ) {
      dilateBg[idx] = 1;
    }
  }
}

for (let i = 0; i < width * height; i++) {
  if (dilateBg[i]) {
    data[i * channels + 3] = 0;
  }
}

// Soften 2px edge alpha
for (let pass = 0; pass < 2; pass++) {
  const alphaCopy = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) alphaCopy[i] = data[i * channels + 3];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      if (dilateBg[idx]) continue;
      const bgNeighbors =
        (dilateBg[idx - 1] ? 1 : 0) +
        (dilateBg[idx + 1] ? 1 : 0) +
        (dilateBg[idx - width] ? 1 : 0) +
        (dilateBg[idx + width] ? 1 : 0);
      if (bgNeighbors > 0) {
        const avgAlpha =
          (alphaCopy[idx - 1] +
            alphaCopy[idx + 1] +
            alphaCopy[idx - width] +
            alphaCopy[idx + width] +
            alphaCopy[idx] * 2) /
          6;
        data[idx * channels + 3] = Math.round(avgAlpha);
      }
    }
  }
}

await sharp(data, { raw: { width, height, channels } })
  .png({ compressionLevel: 9 })
  .toFile(OUTPUT);

console.log(`Saved ${OUTPUT} (${width}x${height}), bg pixels: ${tail}/${width * height}`);
