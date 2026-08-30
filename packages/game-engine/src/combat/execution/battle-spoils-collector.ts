import {
  BattleSpoilsDetails,
  CasualtyMetrics,
} from "@/domain/reports/combat-report.schema";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";

export class BattleSpoilsCollector {
  public static collectSpoils(
    conquest: ProvinceConquestResult,
    treasuryLooted: number,
    defenderCasualties: CasualtyMetrics,
  ): BattleSpoilsDetails {
    return {
      conqueredPixels: conquest.conqueredPixels,
      conqueredProvincesCount: conquest.conqueredProvincesList.length,
      conqueredProvincesNames: conquest.conqueredProvincesList.map(
        (p) => p.nameFa,
      ),
      gainedPopulation: conquest.conqueredProvincesList.reduce(
        (sum, p) => sum + (p.population || 0),
        0,
      ),
      gainedGdp: conquest.conqueredProvincesGdp,
      lootedTreasury: treasuryLooted,
      capturedInfantry: Math.floor(
        (defenderCasualties.infantryLost || 0) * 0.1,
      ),
      capturedArmor: Math.floor((defenderCasualties.armorLost || 0) * 0.1),
      capturedAirDefense: Math.floor(
        (defenderCasualties.airDefenseLost || 0) * 0.1,
      ),
      capturedAirForce: Math.floor(
        (defenderCasualties.airForceLost || 0) * 0.1,
      ),
      capturedDrones: Math.floor(
        (defenderCasualties.droneMissileLost || 0) * 0.1,
      ),
    };
  }
}
