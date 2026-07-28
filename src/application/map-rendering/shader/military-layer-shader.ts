import { CountryProfileLookupCache } from "./country-profile-lookup-cache";

export class MilitaryLayerShader {
  public calculateMilitaryColor(
    id: number,
    cache: CountryProfileLookupCache,
  ): { r: number; g: number; b: number } {
    const infantry = cache.getInfantry(id);
    if (infantry > 300) {
      return { r: 220, g: 38, b: 38 };
    }
    return { r: 71, g: 85, b: 105 };
  }
}
