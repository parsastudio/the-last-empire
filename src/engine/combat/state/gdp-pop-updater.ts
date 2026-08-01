import { Nation, RegionDemographics } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";

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
    const gridState = GridStateProvider.getInstance();

    if (gridState && gridState.getModifiedCells().length === 0) {
      for (const [id, nation] of Object.entries(updated)) {
        if (
          !nation.regionsDemographics ||
          nation.regionsDemographics.length === 0
        ) {
          continue;
        }
        const totalRegionGdp = nation.regionsDemographics.reduce(
          (sum, r) => sum + r.gdp,
          0,
        );
        const totalRegionPop = nation.regionsDemographics.reduce(
          (sum, r) => sum + r.population,
          0,
        );

        const gdpScale = totalRegionGdp > 0 ? nation.gdp / totalRegionGdp : 1;
        const popScale =
          totalRegionPop > 0 ? nation.population / totalRegionPop : 1;

        const updatedRegions = nation.regionsDemographics.map((r) => ({
          ...r,
          gdp: Math.round(r.gdp * gdpScale),
          population: Math.round(r.population * popScale),
        }));

        updated[id] = {
          ...nation,
          regionsDemographics: updatedRegions,
        };
      }
      return updated;
    }

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
