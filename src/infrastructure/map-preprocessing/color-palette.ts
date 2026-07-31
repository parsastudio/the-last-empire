export interface TacticalColorPair {
  r1: number;
  g1: number;
  b1: number;
  r2: number;
  g2: number;
  b2: number;
}

export class TacticalPaletteGenerator {
  private static hslToRgb(
    h: number,
    s: number,
    l: number,
  ): [number, number, number] {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;

    if (h >= 0 && h < 60) {
      r = c;
      g = x;
      b = 0;
    } else if (h >= 60 && h < 120) {
      r = x;
      g = c;
      b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0;
      g = c;
      b = x;
    } else if (h >= 180 && h < 240) {
      r = 0;
      g = x;
      b = c;
    } else if (h >= 240 && h < 300) {
      r = x;
      g = 0;
      b = c;
    } else if (h >= 300 && h < 360) {
      r = c;
      g = 0;
      b = x;
    }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    ];
  }

  public static generateColorForCountry(countryId: number): TacticalColorPair {
    const goldenAngle = 137.50776405003785;
    const hue = (countryId * goldenAngle) % 360;

    const saturation = 0.28 + ((countryId * 17) % 18) / 100;
    const lightness = 0.46 + ((countryId * 31) % 15) / 100;

    const [r1, g1, b1] = this.hslToRgb(hue, saturation, lightness);

    const [r2, g2, b2] = this.hslToRgb(
      hue,
      Math.max(0.2, saturation * 0.9),
      Math.max(0.35, lightness * 0.88),
    );

    return { r1, g1, b1, r2, g2, b2 };
  }
}
