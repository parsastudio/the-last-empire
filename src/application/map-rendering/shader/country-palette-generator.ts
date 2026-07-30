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
    const palette: Record<number, ColorPair> = {};

    countries.forEach((c) => {
      if (c.id >= 11) {
        const index = (c.id * 37) % MAP_PALETTE_172.length;
        const base = MAP_PALETTE_172[index];
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
      r1: 158,
      g1: 150,
      b1: 140,
      r2: 138,
      g2: 130,
      b2: 120,
    };

    return palette;
  }
}
