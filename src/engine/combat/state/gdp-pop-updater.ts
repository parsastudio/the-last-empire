import { Nation, RegionDemographics } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

interface OwnerAccumulator {
  canonicalId: string;
  totalGdp: number;
  totalPop: number;
  rMap: Map<number, { pixelCount: number; gdp: number; pop: number }>;
}

interface InitOwnerConfig {
  gdpDensity: number;
  popDensity: number;
}

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
    const canonicalCache = new Map<string, string>();

    const getCanonical = (id: string): string => {
      let cached = canonicalCache.get(id);
      if (!cached) {
        cached = NationIdResolver.resolveCanonicalId(id);
        canonicalCache.set(id, cached);
      }
      return cached;
    };

    if (!this.initialPixelsMapCache) {
      const initialPixelsMap = new Map<string, number>();
      for (let i = 0; i < allCells.length; i++) {
        const cell = allCells[i]!;
        const initOwner = cell.initialOwnerId || cell.ownerId;
        if (initOwner === "WATER" || initOwner === "CLOSED_SEA") {
          continue;
        }
        const canonicalInit = getCanonical(initOwner);
        const pixels = cell.highResPixelCount > 0 ? cell.highResPixelCount : 16;
        initialPixelsMap.set(
          canonicalInit,
          (initialPixelsMap.get(canonicalInit) || 0) + pixels,
        );
      }
      this.initialPixelsMapCache = initialPixelsMap;
    }

    const initConfigCache = new Map<string, InitOwnerConfig>();

    const getInitConfig = (ownerId: string): InitOwnerConfig => {
      let config = initConfigCache.get(ownerId);
      if (!config) {
        const canonicalId = getCanonical(ownerId);
        const nation = updated[canonicalId] || updated[ownerId];

        const baseGdp = nation && nation.gdp > 0 ? nation.gdp : 5000000000;
        const basePop =
          nation && nation.population > 0 ? nation.population : 80000000;

        const initPixels = this.initialPixelsMapCache!.get(canonicalId) || 0;
        const gdpDensity = initPixels > 0 ? baseGdp / initPixels : 0;
        const popDensity = initPixels > 0 ? basePop / initPixels : 0;

        config = { gdpDensity, popDensity };
        initConfigCache.set(ownerId, config);
      }
      return config;
    };

    const accumulatorsMap = new Map<string, OwnerAccumulator>();

    const getAccumulator = (ownerId: string): OwnerAccumulator => {
      let acc = accumulatorsMap.get(ownerId);
      if (!acc) {
        const canonicalId = getCanonical(ownerId);
        acc = {
          canonicalId,
          totalGdp: 0,
          totalPop: 0,
          rMap: new Map(),
        };
        accumulatorsMap.set(ownerId, acc);
      }
      return acc;
    };

    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i]!;
      const currentOwner = cell.ownerId;
      if (currentOwner === "WATER" || currentOwner === "CLOSED_SEA") {
        continue;
      }

      const initOwner = cell.initialOwnerId || currentOwner;
      const initConfig = getInitConfig(initOwner);
      const acc = getAccumulator(currentOwner);

      const pixels = cell.highResPixelCount > 0 ? cell.highResPixelCount : 16;
      const cellGdp = pixels * initConfig.gdpDensity;
      const cellPop = pixels * initConfig.popDensity;

      acc.totalGdp += cellGdp;
      acc.totalPop += cellPop;

      const enclaveId = cell.enclaveId;
      const existingR = acc.rMap.get(enclaveId);

      if (existingR) {
        existingR.pixelCount += pixels;
        existingR.gdp += cellGdp;
        existingR.pop += cellPop;
      } else {
        acc.rMap.set(enclaveId, {
          pixelCount: pixels,
          gdp: cellGdp,
          pop: cellPop,
        });
      }
    }

    const currentGdpMap = new Map<string, number>();
    const currentPopMap = new Map<string, number>();
    const regionDataMap = new Map<
      string,
      Map<number, { pixelCount: number; gdp: number; pop: number }>
    >();

    for (const acc of accumulatorsMap.values()) {
      const cId = acc.canonicalId;
      currentGdpMap.set(cId, (currentGdpMap.get(cId) || 0) + acc.totalGdp);
      currentPopMap.set(cId, (currentPopMap.get(cId) || 0) + acc.totalPop);

      let targetRMap = regionDataMap.get(cId);
      if (!targetRMap) {
        targetRMap = new Map();
        regionDataMap.set(cId, targetRMap);
      }

      for (const [rId, rData] of acc.rMap.entries()) {
        const existing = targetRMap.get(rId);
        if (existing) {
          existing.pixelCount += rData.pixelCount;
          existing.gdp += rData.gdp;
          existing.pop += rData.pop;
        } else {
          targetRMap.set(rId, { ...rData });
        }
      }
    }

    for (const [id, nation] of Object.entries(updated)) {
      const canonicalId = getCanonical(id);
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
        const sortedEnclaveIds = Array.from(rMap.keys()).sort((a, b) => a - b);

        let totalPixels = 0;
        for (const rId of sortedEnclaveIds) {
          totalPixels += rMap.get(rId)!.pixelCount;
        }

        const nationTotalArea =
          nation.geography.territorySize > 0
            ? nation.geography.territorySize
            : Math.round(totalPixels * 86.3);

        const nationTotalPop = roundedPop > 0 ? roundedPop : nation.population;
        const nationTotalGdp = roundedGdp > 0 ? roundedGdp : nation.gdp;

        let totalGdpWeightedArea = 0;
        let totalPopWeightedArea = 0;

        for (const rId of sortedEnclaveIds) {
          const rData = rMap.get(rId)!;
          const areaFraction =
            totalPixels > 0 ? rData.pixelCount / totalPixels : 1;

          let gdpWeight = 1.15;
          let popWeight = 1.1;

          if (rId === 1) {
            gdpWeight = 0.75;
            popWeight = 0.8;
          } else if (rId === 2) {
            gdpWeight = 0.65;
            popWeight = 0.7;
          } else if (rId >= 3) {
            gdpWeight = 0.5;
            popWeight = 0.6;
          }

          totalGdpWeightedArea += areaFraction * gdpWeight;
          totalPopWeightedArea += areaFraction * popWeight;
        }

        for (const rId of sortedEnclaveIds) {
          const rData = rMap.get(rId)!;
          let name = "خاک اصلی";
          if (rId >= 1 && rId <= 10) {
            name = `منطقه فرامرزی ${rId.toLocaleString("fa-IR")}`;
          } else if (rId >= 11) {
            name = `قلمرو برون‌مرزی ${(rId - 10).toLocaleString("fa-IR")}`;
          }

          const areaShare =
            totalPixels > 0 ? rData.pixelCount / totalPixels : 1;
          const gdpShare =
            totalGdpWeightedArea > 0
              ? (areaShare * 1.15) / totalGdpWeightedArea
              : areaShare;
          const popShare =
            totalPopWeightedArea > 0
              ? (areaShare * 1.1) / totalPopWeightedArea
              : areaShare;

          const regionAreaSqKm = Math.round(nationTotalArea * areaShare);
          const regionPop = Math.round(nationTotalPop * popShare);
          const regionGdp = Math.round(nationTotalGdp * gdpShare);

          regionsDemographics.push({
            regionId: rId,
            name,
            pixelCount: rData.pixelCount,
            areaSqKm: regionAreaSqKm,
            population: regionPop,
            gdp: regionGdp,
          });
        }
      }

      updated[id] = {
        ...nation,
        gdp: roundedGdp > 0 ? roundedGdp : nation.gdp,
        population: roundedPop > 0 ? roundedPop : nation.population,
        isAlive: (roundedGdp > 0 ? roundedGdp : nation.gdp) > 0,
        regionsDemographics:
          regionsDemographics.length > 0
            ? regionsDemographics
            : nation.regionsDemographics,
      };
    }

    return updated;
  }
}
