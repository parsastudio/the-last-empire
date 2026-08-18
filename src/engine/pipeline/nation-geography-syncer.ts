import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";

export class NationGeographySyncer {
  public static sync(
    nation: Nation,
    ownedProvinces: Province[],
  ): { isAlive: boolean; syncedNation: Nation } {
    if (ownedProvinces.length === 0) {
      const isAlive =
        nation.isAlive &&
        (nation.geography.territoryPixelCount > 0 || nation.population > 0);

      if (!isAlive) {
        return {
          isAlive: false,
          syncedNation: {
            ...nation,
            isAlive: false,
            population: 0,
            executedEspionageTiers: [],
            provinceIds: [],
            geography: {
              ...nation.geography,
              territoryPixelCount: 0,
              hasSeaAccess: false,
            },
          },
        };
      }

      return {
        isAlive: true,
        syncedNation: {
          ...nation,
          isAlive: true,
          executedEspionageTiers: [],
          provinceIds: [],
        },
      };
    }

    let totalProvincePixels = 0;
    let hasSeaAccess = false;
    const provinceIds: number[] = [];

    for (let pIdx = 0; pIdx < ownedProvinces.length; pIdx++) {
      const p = ownedProvinces[pIdx]!;
      totalProvincePixels += p.pixelCount;
      provinceIds.push(p.provinceId);
      if (p.hasSeaAccess) {
        hasSeaAccess = true;
      }
    }

    return {
      isAlive: true,
      syncedNation: {
        ...nation,
        isAlive: true,
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
