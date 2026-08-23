import { MilitaryStack } from "@/domain/military/military.schema";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";

export class BattleLootManager {
  public static applyAttackerForcesAndSpoils(
    attackerMilitary: MilitaryStack,
    defenderTechLevel: number,
    calcResult: BattleCalculationResult,
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

    if (calcResult.capturedInfantry > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "INFANTRY",
        calcResult.capturedInfantry,
        defenderTechLevel,
      );
    }
    if (calcResult.capturedArmor > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "ARMOR",
        calcResult.capturedArmor,
        defenderTechLevel,
      );
    }
    if (calcResult.capturedAirDefense > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "AIR_DEFENSE",
        calcResult.capturedAirDefense,
        defenderTechLevel,
      );
    }
    if (calcResult.capturedAirForce > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "AIR_FORCE",
        calcResult.capturedAirForce,
        defenderTechLevel,
      );
    }
    if (calcResult.capturedDrones > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "DRONE_MISSILE",
        calcResult.capturedDrones,
        defenderTechLevel,
      );
    }
    if (calcResult.capturedNavalFleet > 0) {
      updatedMilitary = MilitaryInventoryHelper.addUnits(
        updatedMilitary,
        "NAVAL_FLEET",
        calcResult.capturedNavalFleet,
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
