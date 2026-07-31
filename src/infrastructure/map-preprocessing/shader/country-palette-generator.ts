import {
  TacticalPaletteGenerator,
  TacticalColorPair,
} from "@/infrastructure/map-preprocessing/color-palette";

interface Country {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
}

export type ColorPair = TacticalColorPair;

export class CountryPaletteGenerator {
  public generatePalette(countries: Country[]): Record<number, ColorPair> {
    const palette: Record<number, ColorPair> = {};

    for (let i = 0; i < countries.length; i++) {
      const c = countries[i]!;
      if (c.id >= 11 && c.id < 250) {
        palette[c.id] = TacticalPaletteGenerator.generateColorForCountry(c.id);
      }
    }

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
