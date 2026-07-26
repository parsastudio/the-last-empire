import { MAP_PALETTE_172 } from "../color-palette";

interface Country {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
}

export interface ColorPair {
  r1: number;
  g1: number;
  b1: number;
  r2: number;
  g2: number;
  b2: number;
}

export class CountryPaletteGenerator {
  public generatePalette(countries: Country[]): Record<number, ColorPair> {
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

    const palette: Record<number, ColorPair> = {};
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

    palette[250] = {
      r1: 205,
      g1: 198,
      b1: 185,
      r2: 180,
      g2: 173,
      b2: 160,
    };

    return palette;
  }
}
