import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { Nation, RegionDemographics } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export class BitPackedSyncEngine {
  public computeNationRegionsOnDemand(
    nation: Nation,
    buffer: BitPackedBuffer,
  ): RegionDemographics[] {
    const width = buffer.getWidth();
    const height = buffer.getHeight();
    const numericId = NationIdResolver.resolveNumericId(nation.id);

    const enclaveMap = new Map<number, number>();
    let totalPixels = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (buffer.getNationId(x, y) === numericId) {
          totalPixels++;
          const enclaveId = buffer.getEnclaveId(x, y);
          enclaveMap.set(enclaveId, (enclaveMap.get(enclaveId) || 0) + 1);
        }
      }
    }

    if (totalPixels === 0) {
      return [
        {
          regionId: 0,
          name: `خاک اصلی ${nation.name}`,
          pixelCount: nation.geography.territoryPixelCount,
          population: nation.population,
          gdp: nation.gdp,
        },
      ];
    }

    const regionsDemographics: RegionDemographics[] = [];
    const sortedEnclaveIds = Array.from(enclaveMap.keys()).sort(
      (a, b) => a - b,
    );

    for (const rId of sortedEnclaveIds) {
      const regionPixels = enclaveMap.get(rId) || 0;
      const ratio = totalPixels > 0 ? regionPixels / totalPixels : 1;

      const regionPop = Math.round(nation.population * ratio);
      const regionGdp = Math.round(nation.gdp * ratio);

      let name = `خاک اصلی ${nation.name}`;
      if (rId >= 1 && rId <= 10) {
        name = `منطقه فرامرزی ${rId.toLocaleString("fa-IR")}`;
      } else if (rId >= 11) {
        name = `قلمرو برون‌مرزی ${(rId - 10).toLocaleString("fa-IR")}`;
      }

      regionsDemographics.push({
        regionId: rId,
        name,
        pixelCount: regionPixels,
        population: regionPop,
        gdp: regionGdp,
      });
    }

    return regionsDemographics;
  }

  public syncNationsFromBuffer(
    nations: Record<string, Nation>,
  ): Record<string, Nation> {
    return nations;
  }
}
