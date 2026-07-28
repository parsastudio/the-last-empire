import { CountryProfileLookupCache } from "./country-profile-lookup-cache";

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
