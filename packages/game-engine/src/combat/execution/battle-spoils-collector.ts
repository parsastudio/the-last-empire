import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";

export class BattleSpoilsCollector {
  public static collectSpoils(
    conquestResult: ProvinceConquestResult,
    defender: Nation,
    calcResult: BattleCalculationResult,
  ): BattleSpoilsDetails {
    const conqueredProvs = conquestResult.conqueredProvincesList || [];
    const conqueredProvincesCount = conqueredProvs.length;
    const conqueredProvincesNames = conqueredProvs.map((p) => p.nameFa);
    const conqueredPixels = conquestResult.conqueredPixels;
    const gainedGdp = conquestResult.conqueredProvincesGdp;

    let gainedPopulation = 0;
    for (let i = 0; i < conqueredProvs.length; i++) {
      gainedPopulation += conqueredProvs[i]!.population || 0;
    }

    return {
      conqueredPixels,
      conqueredProvincesCount,
      conqueredProvincesNames,
      gainedPopulation,
      gainedGdp,
      lootedTreasury: calcResult.treasuryLooted || 0,
      capturedInfantry: 0,
      capturedArmor: 0,
      capturedAirDefense: 0,
      capturedAirForce: 0,
      capturedDrones: 0,
    };
  }
}
