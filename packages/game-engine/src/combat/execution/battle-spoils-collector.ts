import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";
import { MapTopologyRegistry } from "@geopolitics/domain";

export class BattleSpoilsCollector {
  public static collectSpoils(
    conquestResult: ProvinceConquestResult,
    calcResult: BattleCalculationResult,
  ): BattleSpoilsDetails {
    const conqueredProvs = conquestResult.conqueredProvincesList || [];
    const conqueredProvincesCount = conqueredProvs.length;
    const conqueredProvinceIds = conqueredProvs.map((p) => p.provinceId);
    const conqueredPixels = conquestResult.conqueredPixels;
    const gainedGdp = conquestResult.conqueredProvincesGdp;

    let gainedPopulation = 0;
    for (let i = 0; i < conqueredProvs.length; i++) {
      gainedPopulation += MapTopologyRegistry.getPopulation(
        conqueredProvs[i]!.provinceId,
        0,
      );
    }

    return {
      conqueredPixels,
      conqueredProvincesCount,
      conqueredProvinceIds,
      gainedPopulation,
      gainedGdp,
      lootedTreasury: calcResult.treasuryLooted || 0,
    };
  }
}
