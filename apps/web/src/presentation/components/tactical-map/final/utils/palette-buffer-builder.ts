import {
  TacticalPaletteGenerator,
  CountryRegistry,
  Province,
  Nation,
  getProvinceGdp,
} from "@geopolitics/domain";
import { GdpGradientInterpolator } from "@/presentation/components/tactical-map/final/utils/gdp-gradient-interpolator";
import { DiplomaticColorModulator } from "@/presentation/components/tactical-map/final/utils/diplomatic-color-modulator";

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
      const rawPair =
        TacticalPaletteGenerator.generateColorForGpuIndex(gpuIndex);

      const u = pid & 255;
      const v = (pid >> 8) & 255;
      const idx = (v * 256 + u) * 4;

      data[idx] = rawPair.r1;
      data[idx + 1] = rawPair.g1;
      data[idx + 2] = rawPair.b1;
      data[idx + 3] = gpuIndex & 255;
    }
  }

  public static fillDiplomaticBuffer(
    data: Uint8Array,
    provincesMap?: Record<string, Province>,
    nationsMap?: Record<string, Nation>,
    humanNationId?: string,
  ): void {
    if (!provincesMap) return;

    for (const prov of Object.values(provincesMap)) {
      const pid = prov.provinceId;
      if (pid <= 0 || pid >= 65536) continue;

      const glow = DiplomaticColorModulator.resolveDiplomaticGlow(
        prov.ownerNationId,
        humanNationId,
        nationsMap,
      );

      const u = pid & 255;
      const v = (pid >> 8) & 255;
      const idx = (v * 256 + u) * 4;

      data[idx] = glow.r;
      data[idx + 1] = glow.g;
      data[idx + 2] = glow.b;
      data[idx + 3] = Math.round(glow.intensity * 255);
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
