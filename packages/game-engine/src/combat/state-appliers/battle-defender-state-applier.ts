import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";

export interface BattleDefenderStateInput {
  defender: Nation;
  attackerId: string;
  calcResult: BattleCalculationResult;
  spoilsData?: BattleSpoilsDetails;
}

export class BattleDefenderStateApplier {
  public static apply(input: BattleDefenderStateInput): Nation {
    const { defender, attackerId, calcResult, spoilsData } = input;
    const canonicalAttacker = CountryRegistry.resolveCanonicalId(attackerId);
    const casualties = calcResult.defenderCasualties;

    const nextInfantry = Math.max(
      0,
      defender.military.infantry - casualties.infantryLost,
    );
    const nextArmor = Math.max(
      0,
      (defender.military.armor || 0) - casualties.armorLost,
    );
    const nextAirDefense = Math.max(
      0,
      (defender.military.airDefense || 0) - casualties.airDefenseLost,
    );
    const nextAirForce = Math.max(
      0,
      defender.military.airForce - casualties.airForceLost,
    );
    const nextDrones = Math.max(
      0,
      defender.military.droneMissile - casualties.droneMissileLost,
    );

    const looted = spoilsData?.lootedTreasury ?? calcResult.treasuryLooted ?? 0;
    const nextTreasury = Math.max(0, defender.treasury - looted);

    let nextStability = defender.government.stability;
    if (calcResult.isAttackerVictory) {
      nextStability = Math.max(0, nextStability - 8);
    } else {
      nextStability = Math.min(100, nextStability + 4);
    }

    const updatedRelations: Record<string, RelationProfile> = {
      ...(defender.relations || {}),
      [canonicalAttacker]: {
        targetNationId: canonicalAttacker,
        stance: "WAR",
        alignment: -100,
        tension: 100,
      },
    };

    return {
      ...defender,
      treasury: nextTreasury,
      warFocusTargetId: defender.warFocusTargetId || canonicalAttacker,
      relations: updatedRelations,
      government: {
        ...defender.government,
        stability: nextStability,
      },
      military: {
        ...defender.military,
        infantry: nextInfantry,
        armor: nextArmor,
        airDefense: nextAirDefense,
        airForce: nextAirForce,
        droneMissile: nextDrones,
      },
    };
  }
}
