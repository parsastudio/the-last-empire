import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { Nation, RegionDemographics } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "@/domain/shared/domain-utilities";
import { CellAreaCalibrator } from "@/engine/combat/state/cell-area-calibrator";
import { BitPackedNeighborDetector } from "@/engine/combat/final/bit-packed-neighbor-detector";

export class BitPackedSyncEngine {
  private calibrator = new CellAreaCalibrator(2048, 4096);
  private neighborDetector = new BitPackedNeighborDetector();

  public syncNationsFromBuffer(
    nations: Record<string, Nation>,
    buffer: BitPackedBuffer,
  ): Record<string, Nation> {
    const width = buffer.getWidth();
    const height = buffer.getHeight();

    const nationAreaMap = new Map<number, number>();
    const nationEnclaveAreaMap = new Map<number, Map<number, number>>();

    for (let y = 0; y < height; y++) {
      const pixelArea = this.calibrator.getCalibratedPixelArea(y);

      for (let x = 0; x < width; x++) {
        const nationId = buffer.getNationId(x, y);

        if (nationId >= 11 && nationId < 250) {
          nationAreaMap.set(
            nationId,
            (nationAreaMap.get(nationId) || 0) + pixelArea,
          );

          let enclaveMap = nationEnclaveAreaMap.get(nationId);
          if (!enclaveMap) {
            enclaveMap = new Map<number, number>();
            nationEnclaveAreaMap.set(nationId, enclaveMap);
          }

          const enclaveId = buffer.getEnclaveId(x, y);
          enclaveMap.set(
            enclaveId,
            (enclaveMap.get(enclaveId) || 0) + pixelArea,
          );
        }
      }
    }

    const { landNeighborsMap, oceanAccessMap } =
      this.neighborDetector.detectNeighbors(buffer);

    const updated = { ...nations };

    for (const [key, nation] of Object.entries(updated)) {
      const canonical = NationIdResolver.resolveCanonicalId(key);
      const numericId = parseInt(canonical.replace("NATION_", ""), 10);

      const totalCalibratedArea = nationAreaMap.get(numericId) || 0;
      const territorySize = Math.round(totalCalibratedArea);
      const isAlive = territorySize > 0;

      const hasSeaAccess = oceanAccessMap.get(numericId) ?? false;
      const rawLandNeighbors = landNeighborsMap.get(numericId) || new Set();
      const landNeighbors = this.neighborDetector.resolveCanonicalNeighbors(
        rawLandNeighbors,
        updated,
      );

      const enclaveMap = nationEnclaveAreaMap.get(numericId);
      const regionsDemographics: RegionDemographics[] = [];

      if (enclaveMap) {
        const sortedEnclaveIds = Array.from(enclaveMap.keys()).sort(
          (a, b) => a - b,
        );

        for (const rId of sortedEnclaveIds) {
          const regionAreaRaw = enclaveMap.get(rId) || 0;
          const regionArea = Math.round(regionAreaRaw);
          const ratio =
            totalCalibratedArea > 0 ? regionAreaRaw / totalCalibratedArea : 1;

          const regionPop = Math.round(nation.population * ratio);
          const regionGdp = Math.round(nation.gdp * ratio);

          let name = `خاک اصلی ${nation.name}`;
          if (rId === 1 && (canonical === "NATION_USA" || key === "USA")) {
            name = "جزایر هاوایی (منطقه فرامرزی ۱)";
          } else if (
            rId === 1 &&
            (canonical === "NATION_FRA" || key === "FRA")
          ) {
            name = "گویان فرانسه (منطقه فرامرزی ۱)";
          } else if (rId >= 1 && rId <= 10) {
            name = `منطقه فرامرزی ${rId.toLocaleString("fa-IR")}`;
          } else if (rId >= 11) {
            name = `قلمرو برون‌مرزی ${(rId - 10).toLocaleString("fa-IR")}`;
          }

          regionsDemographics.push({
            regionId: rId,
            name,
            pixelCount: Math.round(regionArea / 86.3),
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
