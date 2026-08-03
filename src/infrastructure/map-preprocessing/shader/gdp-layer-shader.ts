import { findCountryProfileById } from "@/domain/data/countries";

export class CountryProfileLookupCache {
  private gdpCache = new Float32Array(256);
  private infantryCache = new Uint32Array(256);

  constructor() {
    this.buildCache();
  }

  public buildCache(): void {
    for (let id = 0; id < 256; id++) {
      const profile = findCountryProfileById(id);
      this.gdpCache[id] = profile ? profile.gdp : 10000000000;
      this.infantryCache[id] = profile?.startingInfantry ?? 40;
    }
  }

  public getGdp(id: number): number {
    return this.gdpCache[id] ?? 10000000000;
  }

  public getInfantry(id: number): number {
    return this.infantryCache[id] ?? 40;
  }
}

export class GdpLayerShader {
  public calculateGdpColor(
    id: number,
    cache: CountryProfileLookupCache,
  ): { r: number; g: number; b: number } {
    const realGdp = cache.getGdp(id);
    const logGdp = Math.log10(Math.max(1000000, realGdp));
    const normalizedScale = Math.max(0, Math.min(1.0, (logGdp - 9.0) / 4.5));

    const r = Math.floor(10 + (1.0 - normalizedScale) * 180);
    const g = Math.floor(80 + normalizedScale * 160);
    const b = Math.floor(50 + normalizedScale * 50);

    return { r, g, b };
  }
}
