import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import {
  BattleSpoilsDetails,
  AuxiliaryGuarantorDefense,
} from "@/domain/reports/combat-report.schema";

export class BattleStateMutator {
  public static mutateAfterBattle(
    nations: Record<string, Nation>,
    attacker: Nation,
    defender: Nation,
    calcResult: BattleCalculationResult,
    spoilsData: BattleSpoilsDetails,
    isDefenderAnnexed: boolean,
    auxiliaryGuarantor?: AuxiliaryGuarantorDefense,
    _currentTurn = 1,
  ): Record<string, Nation> {
    const updatedNations: Record<string, Nation> = { ...nations };

    const attCasualties = calcResult.attackerCasualties;
    const defCasualties = calcResult.defenderCasualties;

    const newAttMil = {
      ...attacker.military,
      infantry: Math.max(
        0,
        attacker.military.infantry -
          attCasualties.infantryLost +
          spoilsData.capturedInfantry,
      ),
      armor: Math.max(
        0,
        (attacker.military.armor || 0) -
          attCasualties.armorLost +
          spoilsData.capturedArmor,
      ),
      airForce: Math.max(
        0,
        attacker.military.airForce -
          attCasualties.airForceLost +
          spoilsData.capturedAirForce,
      ),
      airDefense: Math.max(
        0,
        (attacker.military.airDefense || 0) + spoilsData.capturedAirDefense,
      ),
      droneMissile: Math.max(
        0,
        attacker.military.droneMissile -
          calcResult.dronesUsed +
          spoilsData.capturedDrones,
      ),
    };

    const newDefMil = {
      ...defender.military,
      infantry: Math.max(
        0,
        defender.military.infantry - defCasualties.infantryLost,
      ),
      armor: Math.max(
        0,
        (defender.military.armor || 0) - defCasualties.armorLost,
      ),
      airForce: Math.max(
        0,
        defender.military.airForce - defCasualties.airForceLost,
      ),
      airDefense: Math.max(
        0,
        (defender.military.airDefense || 0) - defCasualties.airDefenseLost,
      ),
      droneMissile: Math.max(
        0,
        defender.military.droneMissile - defCasualties.droneMissileLost,
      ),
    };

    const attTreasury = Math.max(
      0,
      attacker.treasury -
        calcResult.deploymentMoneyCost +
        calcResult.treasuryLooted,
    );
    const defTreasury = Math.max(
      0,
      defender.treasury - calcResult.treasuryLooted,
    );

    const attStabilityDelta = calcResult.isAttackerVictory ? 3 : -5;
    const defStabilityDelta = calcResult.isAttackerVictory ? -8 : 4;

    updatedNations[attacker.id] = {
      ...attacker,
      military: newAttMil,
      treasury: attTreasury,
      government: {
        ...attacker.government,
        stability: Math.min(
          100,
          Math.max(10, attacker.government.stability + attStabilityDelta),
        ),
      },
    };

    if (!isDefenderAnnexed) {
      updatedNations[defender.id] = {
        ...defender,
        military: newDefMil,
        treasury: defTreasury,
        government: {
          ...defender.government,
          stability: Math.min(
            100,
            Math.max(10, defender.government.stability + defStabilityDelta),
          ),
        },
      };
    }

    if (auxiliaryGuarantor && auxiliaryGuarantor.damageCostIncurred > 0) {
      const gNation = updatedNations[auxiliaryGuarantor.guarantorId];
      if (gNation) {
        updatedNations[auxiliaryGuarantor.guarantorId] = {
          ...gNation,
          treasury: Math.max(
            0,
            gNation.treasury - auxiliaryGuarantor.damageCostIncurred,
          ),
        };
      }
    }

    return updatedNations;
  }
}
