import {
  TacticalPaletteGenerator,
  CountryRegistry,
  Province,
  getProvinceGdp,
} from "@geopolitics/domain";
import { GdpGradientInterpolator } from "./gdp-gradient-interpolator";

export class PaletteBufferBuilder {
  public static fillPoliticalBuffer(
    data: Uint8Array,
    provincesMap?: Record<string, Province>,
  ): void {
    if (!provincesMap) return;

    for (const prov of Object.values(provincesMap)) {
      const pid = prov.provinceId;
      if (pid <= 0 || pid >= 65536) continue;

      const ownerIso3 = CountryRegistry.resolveCanonicalId(prov.ownerNationId);
      const gpuIndex = CountryRegistry.getGpuColorIndex(ownerIso3);
      const pair = TacticalPaletteGenerator.generateColorForGpuIndex(gpuIndex);

      const u = pid & 255;
      const v = (pid >> 8) & 255;
      const idx = (v * 256 + u) * 4;

      data[idx] = pair.r1;
      data[idx + 1] = pair.g1;
      data[idx + 2] = pair.b1;
      data[idx + 3] = gpuIndex & 255;
    }
  }

  public static fillGdpBuffer(
    data: Uint8Array,
    provincesMap?: Record<string, Province>,
  ): void {
    if (!provincesMap) return;

    const provList = Object.values(provincesMap).filter(
      (p) => p.provinceId > 0 && p.provinceId < 65536,
    );

    if (provList.length === 0) return;

    const gdpEntries = provList.map((prov) => ({
      prov,
      gdp: getProvinceGdp(prov),
    }));

    gdpEntries.sort((a, b) => b.gdp - a.gdp);

    const totalCount = gdpEntries.length;

    for (let rankIndex = 0; rankIndex < totalCount; rankIndex++) {
      const entry = gdpEntries[rankIndex]!;
      const pid = entry.prov.provinceId;
      const ownerIso3 = CountryRegistry.resolveCanonicalId(
        entry.prov.ownerNationId,
      );
      const gpuIndex = CountryRegistry.getGpuColorIndex(ownerIso3);

      const normalized =
        totalCount > 1 ? 1.0 - rankIndex / (totalCount - 1) : 1.0;

      const { r, g, b } = GdpGradientInterpolator.calculateColor(normalized);

      const u = pid & 255;
      const v = (pid >> 8) & 255;
      const idx = (v * 256 + u) * 4;

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = gpuIndex & 255;
    }
  }
}
