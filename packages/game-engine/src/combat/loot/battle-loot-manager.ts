import { MilitaryStack } from "@/domain/military/military.schema";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";

export interface ExtraCapturedMilitaryUnits {
  infantry?: number;
  armor?: number;
  airDefense?: number;
  airForce?: number;
  droneMissile?: number;
  navalFleet?: number;
}

export class BattleLootManager {
  public static applyAttackerForcesAndSpoils(
    attackerMilitary: MilitaryStack,
    defenderTechLevel: number,
    calcResult: BattleCalculationResult,
    extraCaptured?: ExtraCapturedMilitaryUnits,
  ): MilitaryStack {
    let updatedMilitary = MilitaryInventoryHelper.applyCasualties(
      attackerMilitary,
      calcResult.attackerCasualties.infantryLost,
      calcResult.attackerCasualties.armorLost,
      calcResult.attackerCasualties.airDefenseLost,
      calcResult.attackerCasualties.airForceLost,
      calcResult.dronesUsed,
      calcResult.attackerCasualties.navalFleetLost,
    );

    const totalInfantry =
      calcResult.capturedInfantry + (extraCaptured?.infantry || 0);
    const totalArmor = calcResult.capturedArmor + (extraCaptured?.armor || 0);
    const totalAirDefense =
      calcResult.capturedAirDefense + (extraCaptured?.airDefense || 0);
    const totalAirForce =
      calcResult.capturedAirForce + (extraCaptured?.airForce || 0);
    const totalDrones =
      calcResult.capturedDrones + (extraCaptured?.droneMissile || 0);
    const totalNavalFleet =
      calcResult.capturedNavalFleet + (extraCaptured?.navalFleet || 0);

    if (totalInfantry > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "INFANTRY",
        totalInfantry,
        defenderTechLevel,
      );
    }
    if (totalArmor > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "ARMOR",
        totalArmor,
        defenderTechLevel,
      );
    }
    if (totalAirDefense > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "AIR_DEFENSE",
        totalAirDefense,
        defenderTechLevel,
      );
    }
    if (totalAirForce > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "AIR_FORCE",
        totalAirForce,
        defenderTechLevel,
      );
    }
    if (totalDrones > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "DRONE_MISSILE",
        totalDrones,
        defenderTechLevel,
      );
    }
    if (totalNavalFleet > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "NAVAL_FLEET",
        totalNavalFleet,
        defenderTechLevel,
      );
    }

    return {
      ...updatedMilitary,
      experience: Math.min(100, updatedMilitary.experience + 5),
    };
  }

  public static applyDefenderCasualties(
    defenderMilitary: MilitaryStack,
    calcResult: BattleCalculationResult,
    isDefenderAlive: boolean,
  ): MilitaryStack {
    if (!isDefenderAlive) {
      return {
        infantry: 0,
        armor: 0,
        airDefense: 0,
        airForce: 0,
        droneMissile: 0,
        navalFleet: 0,
        experience: 0,
        techLevel: defenderMilitary.techLevel,
        branchTech: defenderMilitary.branchTech,
      };
    }

    return MilitaryInventoryHelper.applyCasualties(
      defenderMilitary,
      calcResult.defenderCasualties.infantryLost,
      calcResult.defenderCasualties.armorLost,
      calcResult.defenderCasualties.airDefenseLost,
      calcResult.defenderCasualties.airForceLost,
      0,
      calcResult.defenderCasualties.navalFleetLost,
    );
  }
}
