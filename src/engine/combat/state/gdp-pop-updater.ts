import { Nation } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { findCountryProfileById } from "@/domain/map/countries";
import { RegionDemographics } from "@/domain/nation/region-demographics.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export class GdpPopUpdater {
  public syncGlobalStats(
    nations: Record<string, Nation>,
    allCells: GridCell[],
  ): Record<string, Nation> {
    if (!allCells || allCells.length === 0) {
      return nations;
    }

    const updated = { ...nations };
    const totalPixelsMap = new Map<string, number>();
    const regionPixelsMap = new Map<string, Map<number, number>>();

    for (const cell of allCells) {
      const owner = cell.ownerId;
      if (owner === "WATER" || owner === "CLOSED_SEA") {
        continue;
      }

      const canonicalOwner = NationIdResolver.resolveCanonicalId(owner);
      const pixels = cell.highResPixelCount > 0 ? cell.highResPixelCount : 16;

      totalPixelsMap.set(
        canonicalOwner,
        (totalPixelsMap.get(canonicalOwner) || 0) + pixels,
      );

      if (!regionPixelsMap.has(canonicalOwner)) {
        regionPixelsMap.set(canonicalOwner, new Map<number, number>());
      }
      const rMap = regionPixelsMap.get(canonicalOwner)!;
      rMap.set(cell.enclaveId, (rMap.get(cell.enclaveId) || 0) + pixels);
    }

    if (totalPixelsMap.size === 0) {
      return nations;
    }

    for (const [id, nation] of Object.entries(updated)) {
      const canonicalId = NationIdResolver.resolveCanonicalId(id);
      const numericId = parseInt(canonicalId.replace("NATION_", ""), 10);
      const profile = findCountryProfileById(numericId);

      const baseGdp = profile
        ? profile.gdp
        : nation.gdp > 0
          ? nation.gdp
          : 5000000000;
      const basePop = profile
        ? profile.population
        : nation.population > 0
          ? nation.population
          : 80000000;

      const ownedPixels = totalPixelsMap.get(canonicalId) || 0;

      if (ownedPixels === 0) {
        if (nation.geography.territorySize === 0) {
          updated[id] = {
            ...nation,
            gdp: 0,
            population: 0,
            isAlive: false,
            regionsDemographics: [],
          };
        }
        continue;
      }

      const expectedPixels = Math.max(
        100,
        Math.round(nation.geography.territorySize / 86.3) || ownedPixels,
      );
      const areaRatio = Math.min(
        2.0,
        Math.max(0.1, ownedPixels / expectedPixels),
      );

      const currentGdp = Math.max(
        baseGdp * 0.1,
        Math.round(baseGdp * areaRatio),
      );
      const currentPop = Math.max(
        basePop * 0.1,
        Math.round(basePop * areaRatio),
      );

      const regionsDemographics: RegionDemographics[] = [];
      const rMap = regionPixelsMap.get(canonicalId);
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
        gdp: currentGdp,
        population: currentPop,
        isAlive: true,
        regionsDemographics,
      };
    }

    return updated;
  }
}
