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
          const r1 = Math.floor(base[0] * 0.45 + 110);
          const g1 = Math.floor(base[1] * 0.45 + 110);
          const b1 = Math.floor(base[2] * 0.45 + 110);

          const r2 = Math.max(15, Math.floor(r1 * 0.85 - 15));
          const g2 = Math.max(15, Math.floor(g1 * 0.85 - 15));
          const b2 = Math.max(15, Math.floor(b1 * 0.85 - 15));

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

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const id = srcData[idx + 2] || 0;

        let r = 0;
        let g = 0;
        let b = 0;

        const noise = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
        const grain = (noise - 0.5) * 4;

        if (id < 11) {
          const d = dist[y * width + x] || 0;
          const depthFactor = 1.0 - Math.exp(-d * 0.015);

          r = Math.floor(34 * (1.0 - depthFactor) + 20 * depthFactor);
          g = Math.floor(62 * (1.0 - depthFactor) + 32 * depthFactor);
          b = Math.floor(88 * (1.0 - depthFactor) + 48 * depthFactor);

          const wave =
            Math.sin(x * 0.02 + y * 0.015) * Math.cos(x * 0.015 - y * 0.02);
          const satinIntensity = Math.floor(wave * 2.5);
          r = Math.max(0, Math.min(255, r + satinIntensity));
          g = Math.max(0, Math.min(255, g + satinIntensity));
          b = Math.max(0, Math.min(255, b + satinIntensity));

          let shadowFactor = 1.0;
          if (id === 10) {
            shadowFactor = 0.85;
          } else if (id === 9) {
            shadowFactor = 0.92;
          }

          r = Math.floor(r * shadowFactor);
          g = Math.floor(g * shadowFactor);
          b = Math.floor(b * shadowFactor);
        } else {
          const pair = palette[id];
          if (pair) {
            const ratio = (x / width + y / height) * 0.5;
            const invRatio = 1.0 - ratio;

            r = Math.floor(pair.r1 * invRatio + pair.r2 * ratio);
            g = Math.floor(pair.g1 * invRatio + pair.g2 * ratio);
            b = Math.floor(pair.b1 * invRatio + pair.b2 * ratio);

            let borderDist = 999;
            const offsets = [4, 8, 16, 24];
            for (let i = 0; i < offsets.length; i++) {
              const off = offsets[i];
              if (off !== undefined) {
                const rightId =
                  x < width - off ? srcData[idx + off * 4 + 2] || 0 : id;
                const leftId = x > off ? srcData[idx - off * 4 + 2] || 0 : id;
                const bottomId =
                  y < height - off
                    ? srcData[idx + width * off * 4 + 2] || 0
                    : id;
                const topId =
                  y > off ? srcData[idx - width * off * 4 + 2] || 0 : id;

                if (
                  rightId !== id ||
                  leftId !== id ||
                  bottomId !== id ||
                  topId !== id
                ) {
                  borderDist = off;
                  break;
                }
              }
            }

            if (borderDist < 999) {
              const shadowFactor = 0.9 + (borderDist / 24) * 0.1;
              r = Math.floor(r * shadowFactor);
              g = Math.floor(g * shadowFactor);
              b = Math.floor(b * shadowFactor);
            }

            const idFarRight = x < width - 3 ? srcData[idx + 12 + 2] || 0 : id;
            const idFarBottom =
              y < height - 3 ? srcData[idx + width * 12 + 2] || 0 : id;
            const idFarLeft = x > 3 ? srcData[idx - 12 + 2] || 0 : id;
            const idFarTop = y > 3 ? srcData[idx - width * 12 + 2] || 0 : id;

            let bevel = 1.0;
            if (idFarRight !== id) bevel -= 0.05;
            if (idFarBottom !== id) bevel -= 0.05;
            if (idFarLeft !== id) bevel += 0.05;
            if (idFarTop !== id) bevel += 0.05;

            r = Math.floor(r * bevel);
            g = Math.floor(g * bevel);
            b = Math.floor(b * bevel);

            let lightHighlight = 0;
            if (idFarLeft !== id || idFarTop !== id) {
              lightHighlight = 5;
            } else if (idFarRight !== id || idFarBottom !== id) {
              lightHighlight = -5;
            }

            r = Math.max(0, Math.min(255, r + lightHighlight));
            g = Math.max(0, Math.min(255, g + lightHighlight));
            b = Math.max(0, Math.min(255, b + lightHighlight));
          }
        }

        let isBorder = false;

        if (x < width - 1) {
          const rightId = srcData[idx + 4 + 2] || 0;
          if (rightId !== id) {
            if (id >= 11 || rightId >= 11) {
              isBorder = true;
            }
          }
        }
        if (y < height - 1) {
          const bottomId = srcData[idx + width * 4 + 2] || 0;
          if (bottomId !== id) {
            if (id >= 11 || bottomId >= 11) {
              isBorder = true;
            }
          }
        }

        if (isBorder) {
          r = 40;
          g = 48;
          b = 64;
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
