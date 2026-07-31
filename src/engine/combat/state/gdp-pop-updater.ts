import { Nation, RegionDemographics } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { findCountryProfileById } from "@/domain/map/countries";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export class GdpPopUpdater {
  private initialPixelsMapCache: Map<string, number> | null = null;

  public syncGlobalStats(
    nations: Record<string, Nation>,
    allCells: GridCell[],
  ): Record<string, Nation> {
    if (!allCells || allCells.length === 0) {
      return nations;
    }

    const updated = { ...nations };

    if (!this.initialPixelsMapCache) {
      const initialPixelsMap = new Map<string, number>();
      for (let i = 0; i < allCells.length; i++) {
        const cell = allCells[i]!;
        const initOwner = cell.initialOwnerId || cell.ownerId;
        if (initOwner === "WATER" || initOwner === "CLOSED_SEA") {
          continue;
        }
        const canonicalInit = NationIdResolver.resolveCanonicalId(initOwner);
        const pixels = cell.highResPixelCount > 0 ? cell.highResPixelCount : 16;
        initialPixelsMap.set(
          canonicalInit,
          (initialPixelsMap.get(canonicalInit) || 0) + pixels,
        );
      }
      this.initialPixelsMapCache = initialPixelsMap;
    }

    const gdpDensityMap = new Map<string, number>();
    const popDensityMap = new Map<string, number>();

    for (const [id, nation] of Object.entries(updated)) {
      const canonicalId = NationIdResolver.resolveCanonicalId(id);
      const numericId = parseInt(canonicalId.replace("NATION_", ""), 10);
      const profile = findCountryProfileById(numericId);

      const baseGdp =
        nation.gdp && nation.gdp > 0
          ? nation.gdp
          : profile
            ? profile.gdp
            : 5000000000;

      const basePop =
        nation.population && nation.population > 0
          ? nation.population
          : profile
            ? profile.population
            : 80000000;

      const initPixels = this.initialPixelsMapCache.get(canonicalId) || 0;
      if (initPixels > 0) {
        gdpDensityMap.set(canonicalId, baseGdp / initPixels);
        popDensityMap.set(canonicalId, basePop / initPixels);
      } else {
        gdpDensityMap.set(canonicalId, 0);
        popDensityMap.set(canonicalId, 0);
      }
    }

    const currentGdpMap = new Map<string, number>();
    const currentPopMap = new Map<string, number>();
    const regionDataMap = new Map<
      string,
      Map<
        number,
        {
          pixelCount: number;
          gdp: number;
          pop: number;
        }
      >
    >();

    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i]!;
      const currentOwner = cell.ownerId;
      if (currentOwner === "WATER" || currentOwner === "CLOSED_SEA") {
        continue;
      }

      const canonicalCurrent =
        NationIdResolver.resolveCanonicalId(currentOwner);
      const initOwner = cell.initialOwnerId || currentOwner;
      const canonicalInit = NationIdResolver.resolveCanonicalId(initOwner);

      const pixels = cell.highResPixelCount > 0 ? cell.highResPixelCount : 16;

      const cellGdpDensity = gdpDensityMap.get(canonicalInit) || 0;
      const cellPopDensity = popDensityMap.get(canonicalInit) || 0;

      const cellGdp = pixels * cellGdpDensity;
      const cellPop = pixels * cellPopDensity;

      currentGdpMap.set(
        canonicalCurrent,
        (currentGdpMap.get(canonicalCurrent) || 0) + cellGdp,
      );
      currentPopMap.set(
        canonicalCurrent,
        (currentPopMap.get(canonicalCurrent) || 0) + cellPop,
      );

      let rMap = regionDataMap.get(canonicalCurrent);
      if (!rMap) {
        rMap = new Map();
        regionDataMap.set(canonicalCurrent, rMap);
      }

      const enclaveId = cell.enclaveId;
      const existingR = rMap.get(enclaveId) || {
        pixelCount: 0,
        gdp: 0,
        pop: 0,
      };

      rMap.set(enclaveId, {
        pixelCount: existingR.pixelCount + pixels,
        gdp: existingR.gdp + cellGdp,
        pop: existingR.pop + cellPop,
      });
    }

    for (const [id, nation] of Object.entries(updated)) {
      const canonicalId = NationIdResolver.resolveCanonicalId(id);
      const totalGdp = currentGdpMap.get(canonicalId);
      const totalPop = currentPopMap.get(canonicalId);

      if (totalGdp === undefined || totalPop === undefined) {
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

      const roundedGdp = Math.round(totalGdp);
      const roundedPop = Math.round(totalPop);

      const regionsDemographics: RegionDemographics[] = [];
      const rMap = regionDataMap.get(canonicalId);

      if (rMap) {
        for (const [rId, rData] of rMap.entries()) {
          let name = "خاک اصلی";
          if (rId >= 1 && rId <= 10) {
            name = `منطقه فرامرزی ${rId}`;
          } else if (rId >= 11) {
            name = `مستعمره ${rId - 10}`;
          }

          regionsDemographics.push({
            regionId: rId,
            name,
            pixelCount: rData.pixelCount,
            areaSqKm: Math.round(rData.pixelCount * 86.3),
            population: Math.round(rData.pop),
            gdp: Math.round(rData.gdp),
          });
        }
      }

      updated[id] = {
        ...nation,
        gdp: roundedGdp,
        population: roundedPop,
        isAlive: roundedGdp > 0 && roundedPop > 0,
        regionsDemographics,
      };
    }

    return updated;
  }
}
