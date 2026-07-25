import { MAP_PALETTE_172 } from "./color-palette";

interface Country {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
}

export class MapShader {
  public static applyShading(
    srcData: Uint8ClampedArray,
    destData: Uint8ClampedArray,
    width: number,
    height: number,
    maskData: Uint8Array,
    countries: Country[],
  ): void {
    const shuffledPalette = [...MAP_PALETTE_172];
    for (let i = shuffledPalette.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffledPalette[i];
      const target = shuffledPalette[j];
      if (temp && target) {
        shuffledPalette[i] = target;
        shuffledPalette[j] = temp;
      }
    }

    const palette: Record<
      number,
      { r1: number; g1: number; b1: number; r2: number; g2: number; b2: number }
    > = {};

    countries.forEach((c, index) => {
      if (c.id >= 11) {
        const base = shuffledPalette[index % shuffledPalette.length];
        if (base) {
          const r1 = base[0];
          const g1 = base[1];
          const b1 = base[2];

          const r2 = Math.max(160, Math.floor(r1 * 0.93));
          const g2 = Math.max(160, Math.floor(g1 * 0.93));
          const b2 = Math.max(160, Math.floor(b1 * 0.93));

          palette[c.id] = { r1, g1, b1, r2, g2, b2 };
        }
      }
    });

    const dist = new Int32Array(width * height);
    dist.fill(9999);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const val = maskData[idx];
        if (val && val >= 11) {
          dist[idx] = 0;
        } else {
          if (x > 0) dist[idx] = Math.min(dist[idx], dist[idx - 1] + 1);
          if (y > 0) dist[idx] = Math.min(dist[idx], dist[idx - width] + 1);
        }
      }
    }

    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        if (x < width - 1) dist[idx] = Math.min(dist[idx], dist[idx + 1] + 1);
        if (y < height - 1)
          dist[idx] = Math.min(dist[idx], dist[idx + width] + 1);
      }
    }

    const shoreR = 198;
    const shoreG = 216;
    const shoreB = 214;

    const midR = 175;
    const midG = 196;
    const midB = 202;

    const deepR = 142;
    const deepG = 166;
    const deepB = 180;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const id = srcData[idx + 2] || 0;

        let r = 255;
        let g = 255;
        let b = 255;

        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const grain = (noise - 0.5) * 1.5;

        if (id < 11) {
          const d = dist[y * width + x] || 0;
          const t = 1.0 - Math.exp(-d * 0.12);

          if (t < 0.5) {
            const ratio = t / 0.5;
            r = Math.floor(shoreR * (1.0 - ratio) + midR * ratio);
            g = Math.floor(shoreG * (1.0 - ratio) + midG * ratio);
            b = Math.floor(shoreB * (1.0 - ratio) + midB * ratio);
          } else {
            const ratio = (t - 0.5) / 0.5;
            r = Math.floor(midR * (1.0 - ratio) + deepR * ratio);
            g = Math.floor(midG * (1.0 - ratio) + deepG * ratio);
            b = Math.floor(midB * (1.0 - ratio) + deepB * ratio);
          }

          if (d >= 1 && d <= 12) {
            const shadow = 0.82 + 0.18 * ((d - 1) / 11);
            r = Math.floor(r * shadow);
            g = Math.floor(g * shadow);
            b = Math.floor(b * shadow);
          }
        } else {
          const pair = palette[id];
          if (pair) {
            const ratio = (x / width + y / height) * 0.5;
            const invRatio = 1.0 - ratio;

            r = Math.floor(pair.r1 * invRatio + pair.r2 * ratio);
            g = Math.floor(pair.g1 * invRatio + pair.g2 * ratio);
            b = Math.floor(pair.b1 * invRatio + pair.b2 * ratio);

            const idLeft = x > 2 ? srcData[idx - 8 + 2] || 0 : id;
            const idTop = y > 2 ? srcData[idx - width * 8 + 2] || 0 : id;
            const idRight = x < width - 2 ? srcData[idx + 8 + 2] || 0 : id;
            const idBottom =
              y < height - 2 ? srcData[idx + width * 8 + 2] || 0 : id;

            let bevel = 1.0;
            if (idLeft !== id || idTop !== id) {
              bevel += 0.02;
            }
            if (idRight !== id || idBottom !== id) {
              bevel -= 0.02;
            }

            r = Math.floor(r * bevel);
            g = Math.floor(g * bevel);
            b = Math.floor(b * bevel);
          }
        }

        let isBorder = false;
        if (x < width - 1) {
          const rightId = srcData[idx + 4 + 2] || 0;
          if (rightId !== id && (id >= 11 || rightId >= 11)) {
            isBorder = true;
          }
        }
        if (y < height - 1) {
          const bottomId = srcData[idx + width * 4 + 2] || 0;
          if (bottomId !== id && (id >= 11 || bottomId >= 11)) {
            isBorder = true;
          }
        }

        if (isBorder) {
          r = 80;
          g = 72;
          b = 65;
        }

        r = Math.max(0, Math.min(255, r + grain));
        g = Math.max(0, Math.min(255, g + grain));
        b = Math.max(0, Math.min(255, b + grain));

        destData[idx] = r;
        destData[idx + 1] = g;
        destData[idx + 2] = b;
        destData[idx + 3] = 255;
      }
    }
  }
}
