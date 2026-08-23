import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";

export class NationGeographySyncer {
  public static sync(
    nation: Nation,
    ownedProvinces: Province[],
  ): { isAlive: boolean; syncedNation: Nation } {
    if (ownedProvinces.length === 0) {
      return {
        isAlive: false,
        syncedNation: {
          ...nation,
          isAlive: false,
          population: 0,
          maxPopulationCapacity: 0,
          treasury: 0,
          nationalDebt: 0,
          warFocusTargetId: null,
          provinceIds: [],
          recruitmentQueue: [],
          executedEspionageTiers: [],
          military: {
            ...nation.military,
            infantry: 0,
            armor: 0,
            airDefense: 0,
            airForce: 0,
            droneMissile: 0,
            navalFleet: 0,
            inventory: {},
          },
          geography: {
            ...nation.geography,
            territoryPixelCount: 0,
            hasSeaAccess: false,
            landNeighbors: [],
            seaNeighbors: [],
          },
          relations: {},
        },
      };
    }

    let totalProvincePixels = 0;
    let totalPopulation = 0;
    let totalMaxCapacity = 0;
    let totalWeightedProductivitySum = 0;
    let hasSeaAccess = false;
    const provinceIds: number[] = [];

    for (let pIdx = 0; pIdx < ownedProvinces.length; pIdx++) {
      const p = ownedProvinces[pIdx]!;
      totalProvincePixels += p.pixelCount;
      totalPopulation += p.population;
      totalMaxCapacity += p.maxPopulationCapacity;
      totalWeightedProductivitySum += p.population * p.perCapitaProductivity;
      provinceIds.push(p.provinceId);
      if (p.hasSeaAccess) {
        hasSeaAccess = true;
      }
    }

    const averageProductivity =
      totalPopulation > 0
        ? Math.round(totalWeightedProductivitySum / totalPopulation)
        : nation.perCapitaProductivity || 5000;

    return {
      isAlive: true,
      syncedNation: {
        ...nation,
        isAlive: true,
        population: totalPopulation,
        maxPopulationCapacity: totalMaxCapacity,
        perCapitaProductivity: averageProductivity,
        executedEspionageTiers: [],
        provinceIds,
        geography: {
          ...nation.geography,
          territoryPixelCount: totalProvincePixels,
          hasSeaAccess,
        },
      },
    };
  }
}
