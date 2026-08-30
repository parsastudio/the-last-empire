import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { ExtraCapturedMilitaryUnits } from "@/engine/combat/loot/battle-loot-manager";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";

export interface SpoilsCollectionResult {
  extraCapturedUnits?: ExtraCapturedMilitaryUnits;
  extraTreasuryLooted: number;
  spoilsData: BattleSpoilsDetails;
}

export class BattleSpoilsCollector {
  public static collect(
    defender: Nation,
    calcResult: BattleCalculationResult,
    conquest: ProvinceConquestResult,
    isTotalAnnexation: boolean,
  ): SpoilsCollectionResult {
    let extraCapturedUnits: ExtraCapturedMilitaryUnits | undefined = undefined;
    let extraTreasuryLooted = 0;

    if (isTotalAnnexation) {
      const survivingDefenderInf = Math.max(
        0,
        (defender.military.infantry || 0) -
          calcResult.defenderCasualties.infantryLost,
      );
      const survivingDefenderArmor = Math.max(
        0,
        (defender.military.armor || 0) -
          calcResult.defenderCasualties.armorLost,
      );
      const survivingDefenderAD = Math.max(
        0,
        (defender.military.airDefense || 0) -
          calcResult.defenderCasualties.airDefenseLost,
      );
      const survivingDefenderAir = Math.max(
        0,
        (defender.military.airForce || 0) -
          calcResult.defenderCasualties.airForceLost,
      );
      const survivingDefenderDrones = Math.max(
        0,
        defender.military.droneMissile || 0,
      );

      extraCapturedUnits = {
        infantry: survivingDefenderInf,
        armor: survivingDefenderArmor,
        airDefense: survivingDefenderAD,
        airForce: survivingDefenderAir,
        droneMissile: survivingDefenderDrones,
      };

      extraTreasuryLooted = Math.max(
        0,
        defender.treasury - calcResult.treasuryLooted,
      );
    }

    let gainedPop = 0;
    let gainedGdp = 0;
    for (let i = 0; i < conquest.conqueredProvincesList.length; i++) {
      const p = conquest.conqueredProvincesList[i]!;
      gainedPop += p.population || 0;
      gainedGdp += getProvinceGdp(p);
    }

    const totalLootedTreasury =
      calcResult.treasuryLooted + (extraTreasuryLooted || 0);

    const spoilsData: BattleSpoilsDetails = {
      conqueredPixels: conquest.conqueredPixels,
      conqueredProvincesCount: conquest.conqueredProvincesList.length,
      conqueredProvincesNames: conquest.conqueredProvincesList.map(
        (p) => p.nameFa,
      ),
      gainedPopulation: gainedPop,
      gainedGdp: gainedGdp,
      lootedTreasury: totalLootedTreasury,
      capturedInfantry: extraCapturedUnits?.infantry || 0,
      capturedArmor: extraCapturedUnits?.armor || 0,
      capturedAirDefense: extraCapturedUnits?.airDefense || 0,
      capturedAirForce: extraCapturedUnits?.airForce || 0,
      capturedDrones: extraCapturedUnits?.droneMissile || 0,
    };

    return {
      extraCapturedUnits,
      extraTreasuryLooted,
      spoilsData,
    };
  }
}
