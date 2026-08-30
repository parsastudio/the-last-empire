import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";
import { CountryRegistry } from "@/domain/data/countries";

export interface BattleAttackerStateInput {
  attacker: Nation;
  defenderId: string;
  calcResult: BattleCalculationResult;
  spoilsData?: BattleSpoilsDetails;
  isDefenderAnnexed?: boolean;
}

export class BattleAttackerStateApplier {
  public static apply(input: BattleAttackerStateInput): Nation {
    const { attacker, defenderId, calcResult, spoilsData } = input;
    const canonicalDefender = CountryRegistry.resolveCanonicalId(defenderId);

    const prevAttacked = attacker.attackedTargetIdsThisTurn || [];
    const attackedTargetIdsThisTurn = Array.from(
      new Set([...prevAttacked, canonicalDefender, defenderId]),
    );

    const casualties = calcResult.attackerCasualties;
    const nextInfantry = Math.max(
      0,
      attacker.military.infantry - casualties.infantryLost,
    );
    const nextArmor = Math.max(
      0,
      (attacker.military.armor || 0) - casualties.armorLost,
    );
    const nextAirDefense = Math.max(
      0,
      (attacker.military.airDefense || 0) - casualties.airDefenseLost,
    );
    const nextAirForce = Math.max(
      0,
      attacker.military.airForce - casualties.airForceLost,
    );
    const nextDrones = Math.max(
      0,
      attacker.military.droneMissile - casualties.droneMissileLost,
    );

    const looted = spoilsData?.lootedTreasury ?? calcResult.treasuryLooted ?? 0;
    const deploymentCost = calcResult.deploymentMoneyCost || 0;
    const nextTreasury = Math.max(
      0,
      attacker.treasury + looted - deploymentCost,
    );

    let nextStability = attacker.government.stability;
    if (calcResult.isAttackerVictory) {
      nextStability = Math.min(100, nextStability + 3);
    } else {
      nextStability = Math.max(0, nextStability - 5);
    }

    return {
      ...attacker,
      treasury: nextTreasury,
      attackedTargetIdsThisTurn,
      government: {
        ...attacker.government,
        stability: nextStability,
      },
      military: {
        ...attacker.military,
        infantry: nextInfantry,
        armor: nextArmor,
        airDefense: nextAirDefense,
        airForce: nextAirForce,
        droneMissile: nextDrones,
      },
    };
  }
}
