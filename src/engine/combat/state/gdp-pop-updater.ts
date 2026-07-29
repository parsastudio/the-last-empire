import { Nation } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { findCountryProfileById } from "@/domain/map/countries";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";

export class GdpPopUpdater {
  public syncGlobalStats(
    nations: Record<string, Nation>,
    allCells: GridCell[],
  ): Record<string, Nation> {
    const updated = { ...nations };

    const totalPixelsMap = new Map<string, number>();
    const regionPixelsMap = new Map<string, Map<number, number>>();

    for (const cell of allCells) {
      const owner = cell.ownerId;
      if (owner === "WATER" || owner === "CLOSED_SEA") {
        continue;
      }

      const pixels = cell.highResPixelCount;
      totalPixelsMap.set(owner, (totalPixelsMap.get(owner) || 0) + pixels);

      if (!regionPixelsMap.has(owner)) {
        regionPixelsMap.set(owner, new Map<number, number>());
      }
      const rMap = regionPixelsMap.get(owner)!;
      rMap.set(cell.enclaveId, (rMap.get(cell.enclaveId) || 0) + pixels);
    }

    for (const [id, nation] of Object.entries(updated)) {
      const numericId = parseInt(id.replace("NATION_", ""), 10);
      const profile = findCountryProfileById(numericId);

      const baseGdp = profile ? profile.gdp : nation.gdp || 5000000000;
      const basePop = profile
        ? profile.population
        : nation.population || 80000000;

      const ownedPixels = totalPixelsMap.get(id) || 0;

      if (ownedPixels === 0) {
        updated[id] = {
          ...nation,
          gdp: 0,
          population: 0,
          isAlive: false,
          regionsDemographics: [],
        };
        continue;
      }

      const initialTotalPixels = Math.max(
        1,
        Math.round(baseGdp / 1000000 / 86.3) || ownedPixels,
      );
      const areaRatio = ownedPixels / initialTotalPixels;

      const currentGdp = Math.round(baseGdp * areaRatio);
      const currentPop = Math.round(basePop * areaRatio);

      const regionsDemographics: RegionDemographics[] = [];
      const rMap = regionPixelsMap.get(id);
      if (rMap) {
        for (const [rId, rPixels] of rMap.entries()) {
          const rShare = rPixels / ownedPixels;
          const rPop = Math.round(currentPop * rShare);
          const rGdp = Math.round(currentGdp * rShare);

          let name = "خاک اصلی";
          if (rId >= 1 && rId <= 10) {
            name = `منطقه فرامرزی ${rId}`;
          } else if (rId >= 11) {
            name = `مستعمره ${rId - 10}`;
          }

          regionsDemographics.push({
            regionId: rId,
            name,
            pixelCount: rPixels,
            areaSqKm: Math.round(rPixels * 86.3),
            population: rPop,
            gdp: rGdp,
          });
        }
      }

      updated[id] = {
        ...nation,
        gdp: Math.max(0, currentGdp),
        population: Math.max(0, currentPop),
        isAlive: ownedPixels > 0,
        regionsDemographics,
      };
    }

    return updated;
  }
}
