import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { Nation, RegionDemographics } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export class BitPackedSyncEngine {
  private readonly pixelAreaKm2 = 86.3;

  public syncNationsFromBuffer(
    nations: Record<string, Nation>,
    buffer: BitPackedBuffer,
  ): Record<string, Nation> {
    const width = buffer.getWidth();
    const height = buffer.getHeight();

    const nationPixelCounts = new Map<number, number>();
    const nationEnclaveCounts = new Map<number, Map<number, number>>();
    const nationCoastalMap = new Map<number, boolean>();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nationId = buffer.getNationId(x, y);

        if (nationId >= 11 && nationId < 250) {
          nationPixelCounts.set(
            nationId,
            (nationPixelCounts.get(nationId) || 0) + 1,
          );

          let enclaveMap = nationEnclaveCounts.get(nationId);
          if (!enclaveMap) {
            enclaveMap = new Map<number, number>();
            nationEnclaveCounts.set(nationId, enclaveMap);
          }

          const enclaveId = buffer.getEnclaveId(x, y);
          enclaveMap.set(enclaveId, (enclaveMap.get(enclaveId) || 0) + 1);

          const coastalAccess = buffer.getCoastalAccess(x, y);
          if (coastalAccess === 1) {
            nationCoastalMap.set(nationId, true);
          }
        }
      }
    }

    const updated = { ...nations };

    for (const [key, nation] of Object.entries(updated)) {
      const canonical = NationIdResolver.resolveCanonicalId(key);
      const numericId = parseInt(canonical.replace("NATION_", ""), 10);

      const pixels = nationPixelCounts.get(numericId) || 0;
      const territorySize = Math.round(pixels * this.pixelAreaKm2);
      const isAlive = pixels > 0;
      const hasSeaAccess = nationCoastalMap.get(numericId) ?? false;

      const enclaveMap = nationEnclaveCounts.get(numericId);
      const regionsDemographics: RegionDemographics[] = [];

      if (enclaveMap) {
        for (const [rId, rPixels] of enclaveMap.entries()) {
          const regionArea = Math.round(rPixels * this.pixelAreaKm2);
          const ratio = pixels > 0 ? rPixels / pixels : 1;
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
            pixelCount: rPixels,
            areaSqKm: regionArea,
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
          territorySize: isAlive ? territorySize : 0,
          contiguousMainlandSize: isAlive ? territorySize : 0,
          hasSeaAccess,
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
