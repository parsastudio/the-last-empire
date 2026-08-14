import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";

export class NationGeographySyncer {
  public static sync(
    nation: Nation,
    ownedProvinces: Province[],
  ): { isAlive: boolean; syncedNation: Nation } {
    const isAlive = ownedProvinces.length > 0;

    if (!isAlive) {
      return {
        isAlive: false,
        syncedNation: {
          ...nation,
          isAlive: false,
          population: 0,
          executedEspionageTiers: [],
          geography: {
            ...nation.geography,
            territoryPixelCount: 0,
            hasSeaAccess: false,
          },
        },
      };
    }

    let totalProvincePixels = 0;
    let hasSeaAccess = false;
    for (let pIdx = 0; pIdx < ownedProvinces.length; pIdx++) {
      const p = ownedProvinces[pIdx]!;
      totalProvincePixels += p.pixelCount;
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
        geography: {
          ...nation.geography,
          territoryPixelCount: totalProvincePixels,
          hasSeaAccess,
        },
      },
    };
  }
}
