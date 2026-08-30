import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class GameStateMetricsUtility {
  public static getTotalWorldTerritoryPixels(
    provinces?: Record<string, Province> | Province[],
  ): number {
    if (!provinces) return 0;
    const list = Array.isArray(provinces)
      ? provinces
      : Object.values(provinces);
    let total = 0;
    for (let i = 0; i < list.length; i++) {
      total += list[i]!.pixelCount || 0;
    }
    return total;
  }

  public static getTotalGlobalGdp(
    nations: Record<string, Nation> | Nation[],
    provinces?: Record<string, Province> | Province[],
    provincesByOwnerMap?: Map<string, Province[]>,
  ): number {
    const list = Array.isArray(nations) ? nations : Object.values(nations);
    let total = 0;
    for (let i = 0; i < list.length; i++) {
      const n = list[i]!;
      if (n.isAlive) {
        total += getNationGdp(n, provinces, undefined, provincesByOwnerMap);
      }
    }
    return total;
  }
}
