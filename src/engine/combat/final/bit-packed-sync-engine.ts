import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { Nation, RegionDemographics } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "@/domain/shared/domain-utilities";
import { BitPackedNeighborDetector } from "@/engine/combat/final/bit-packed-neighbor-detector";

export class BitPackedSyncEngine {
  private neighborDetector = new BitPackedNeighborDetector();

  public syncNationsFromBuffer(
    nations: Record<string, Nation>,
    buffer: BitPackedBuffer,
  ): Record<string, Nation> {
    const width = buffer.getWidth();
    const height = buffer.getHeight();

    const nationPixelsMap = new Map<number, number>();
    const nationEnclavePixelsMap = new Map<number, Map<number, number>>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nationId = buffer.getNationId(x, y);

        if (nationId >= 11 && nationId < 250) {
          nationPixelsMap.set(
            nationId,
            (nationPixelsMap.get(nationId) || 0) + 1,
          );

          let enclaveMap = nationEnclavePixelsMap.get(nationId);
          if (!enclaveMap) {
            enclaveMap = new Map<number, number>();
            nationEnclavePixelsMap.set(nationId, enclaveMap);
          }

          const enclaveId = buffer.getEnclaveId(x, y);
          enclaveMap.set(enclaveId, (enclaveMap.get(enclaveId) || 0) + 1);
        }
      }
    }

    const { landNeighborsMap, oceanAccessMap } =
      this.neighborDetector.detectNeighbors(buffer);

    const updated = { ...nations };

    for (const [key, nation] of Object.entries(updated)) {
      const numericId = NationIdResolver.resolveNumericId(key);

      const totalPixels = nationPixelsMap.get(numericId) || 0;
      const isAlive = totalPixels > 0;

      const hasSeaAccess = oceanAccessMap.get(numericId) ?? false;
      const rawLandNeighbors = landNeighborsMap.get(numericId) || new Set();
      const landNeighbors = this.neighborDetector.resolveCanonicalNeighbors(
        rawLandNeighbors,
        updated,
      );

      const enclaveMap = nationEnclavePixelsMap.get(numericId);
      const regionsDemographics: RegionDemographics[] = [];

      if (enclaveMap) {
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
      }

      updated[key] = {
        ...nation,
        isAlive,
        geography: {
          ...nation.geography,
          territoryPixelCount: isAlive ? totalPixels : 0,
          contiguousMainlandPixelCount: isAlive ? totalPixels : 0,
          hasSeaAccess,
          landNeighbors:
            landNeighbors.length > 0
              ? landNeighbors
              : nation.geography.landNeighbors,
        },
        regionsDemographics:
          regionsDemographics.length > 0
            ? regionsDemographics
            : nation.regionsDemographics,
      };
    }

    return updated;
  }
}
