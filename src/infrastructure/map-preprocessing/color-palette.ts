export interface TacticalColorPair {
  r1: number;
  g1: number;
  b1: number;
}

export class TacticalPaletteGenerator {
  private static readonly STRATEGIC_HUE_FAMILIES: number[] = [
    12, 32, 48, 135, 158, 182, 205, 222, 248, 268, 350, 25,
  ];

  private static readonly REAL_WORLD_LAND_NEIGHBORS: Record<number, number[]> =
    {
      118: [120, 135, 98, 113, 114, 117, 156],
      120: [118, 135, 156, 29],
      135: [118, 120, 156, 119, 134, 133, 98],
      156: [118, 120, 135, 29],
      29: [156, 122, 123, 16, 108, 150, 106, 121, 162, 116, 117],
      150: [29, 108, 106, 109, 110, 113, 114, 115, 116, 105, 102],
      109: [150, 113, 110, 114, 149],
      113: [118, 109, 114, 150],
      114: [118, 113, 117, 116, 115, 150],
      98: [118, 135, 119, 94, 169, 97],
      119: [135, 98, 88, 87, 94],
      169: [98, 94, 95, 96, 97, 99, 168],
      123: [29, 122, 124, 128, 126, 163],
      124: [123, 122, 132, 164, 163, 29],
      132: [124, 164, 125, 138, 54, 140, 141, 153],
      54: [132, 138, 152, 143, 140, 125],
      152: [54, 138, 125, 137],
      143: [54, 142],
      16: [29, 17, 116, 117, 150],
      17: [16, 116, 117, 114, 115],
      108: [29, 150],
      107: [106],
      106: [29, 150, 107],
      15: [14, 38],
      14: [15, 33],
      38: [15, 49],
      40: [20, 41, 42, 43, 51, 55, 185],
      20: [40, 21, 41, 42],
      21: [20, 41, 42],
    };

  private static assignedFamilies = new Map<number, number>();

  private static hashInt(x: number): number {
    let h = (x ^ 0x61c88647) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
    return (h ^ (h >>> 16)) >>> 0;
  }

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
    const totalFamilies = this.STRATEGIC_HUE_FAMILIES.length;
    const hash1 = this.hashInt(countryId);
    const hash2 = this.hashInt(hash1);

    let chosenFamily = hash1 % totalFamilies;

    const neighbors = this.REAL_WORLD_LAND_NEIGHBORS[countryId] || [];
    const usedNeighborFamilies = new Set<number>();

    for (let i = 0; i < neighbors.length; i++) {
      const neighborId = neighbors[i]!;
      if (this.assignedFamilies.has(neighborId)) {
        usedNeighborFamilies.add(this.assignedFamilies.get(neighborId)!);
      }
    }

    let attempts = 0;
    while (usedNeighborFamilies.has(chosenFamily) && attempts < totalFamilies) {
      chosenFamily = (chosenFamily + 1) % totalFamilies;
      attempts++;
    }

    this.assignedFamilies.set(countryId, chosenFamily);

    const baseHue = this.STRATEGIC_HUE_FAMILIES[chosenFamily]!;
    const hueOffset = (hash2 % 11) - 5;
    const hue = (baseHue + hueOffset + 360) % 360;

    const saturation = 0.24 + (hash2 % 14) / 100;
    const lightness = 0.38 + ((hash1 >>> 8) % 12) / 100;

    const [r1, g1, b1] = this.hslToRgb(hue, saturation, lightness);

    return { r1, g1, b1 };
  }
}
