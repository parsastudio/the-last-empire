import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { Nation } from "@/domain/nation/nation.schema";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { BitPackedNeighborDetector } from "@/engine/combat/final/bit-packed-neighbor-detector";

export class BitPackedSyncEngine {
  private neighborDetector = new BitPackedNeighborDetector();

  public syncTargetNations(
    targetNationIds: string[],
    stateNations: Record<string, Nation>,
    buffer: BitPackedBuffer,
  ): Record<string, Nation> {
    if (targetNationIds.length === 0) return stateNations;

    const width = buffer.getWidth();
    const height = buffer.getHeight();
    const rawBuffer = buffer.getRawBuffer();
    const totalPixels = width * height;

    const targetNumericMap = new Map<number, string>();
    for (const nationId of targetNationIds) {
      const numId = CountryRegistry.resolveNumericId(nationId);
      if (numId > 0) {
        targetNumericMap.set(numId, nationId);
      }
    }

    if (targetNumericMap.size === 0) return stateNations;

    const enclaveCountsMap = new Map<number, Map<number, number>>();
    for (const numId of targetNumericMap.keys()) {
      enclaveCountsMap.set(numId, new Map<number, number>());
    }

    for (let i = 0; i < totalPixels; i++) {
      const packed = rawBuffer[i]!;
      const nationId = packed & 0x00ff;

      const enclaveCounts = enclaveCountsMap.get(nationId);
      if (enclaveCounts) {
        const enclaveId = (packed & 0x1f00) >> 8;
        enclaveCounts.set(enclaveId, (enclaveCounts.get(enclaveId) || 0) + 1);
      }
    }

    const { landNeighborsMap, oceanAccessMap } =
      this.neighborDetector.detectNeighbors(buffer);

    const updatedNations = { ...stateNations };

    for (const [numId, stringId] of targetNumericMap.entries()) {
      const nation = stateNations[stringId];
      if (!nation) continue;

      const enclaveCounts = enclaveCountsMap.get(numId)!;
      let totalPixelsCount = 0;
      let maxMainlandPixels = 0;

      for (const count of enclaveCounts.values()) {
        totalPixelsCount += count;
        if (count > maxMainlandPixels) {
          maxMainlandPixels = count;
        }
      }

      const detectedNeighbors = landNeighborsMap.get(numId) || new Set();
      const landNeighbors = this.neighborDetector.resolveCanonicalNeighbors(
        detectedNeighbors,
        stateNations,
      );
      const hasSeaAccess = oceanAccessMap.get(numId) ?? false;

      if (totalPixelsCount === 0) {
        updatedNations[stringId] = {
          ...nation,
          isAlive: false,
          population: 0,
          gdp: 0,
          geography: {
            ...nation.geography,
            territoryPixelCount: 0,
            contiguousMainlandPixelCount: 0,
            landNeighbors,
            hasSeaAccess,
          },
          regionsDemographics: [],
        };
        continue;
      }

      const regionsDemographics: RegionDemographics[] = [];
      const sortedEnclaveIds = Array.from(enclaveCounts.keys()).sort(
        (a, b) => a - b,
      );

      for (const rId of sortedEnclaveIds) {
        const regionPixels = enclaveCounts.get(rId) || 0;
        const ratio =
          totalPixelsCount > 0 ? regionPixels / totalPixelsCount : 1;
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

      updatedNations[stringId] = {
        ...nation,
        geography: {
          ...nation.geography,
          territoryPixelCount: totalPixelsCount,
          contiguousMainlandPixelCount: maxMainlandPixels,
          landNeighbors,
          hasSeaAccess,
        },
        regionsDemographics,
      };
    }

    return updatedNations;
  }
}
