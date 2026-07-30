import { findCountryProfileById } from "@/infrastructure/data/countries";

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
