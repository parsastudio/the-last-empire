import { Nation, CountryRegistry } from "@geopolitics/domain";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleLootManager } from "@/engine/combat/loot/battle-loot-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export interface DefenderStateApplierInput {
  defender: Nation;
  attackerId: string;
  canonicalAttackerId: string;
  calcResult: BattleCalculationResult;
  conquest: ProvinceConquestResult;
  isDefenderAlive: boolean;
}

export class BattleDefenderStateApplier {
  public static apply(input: DefenderStateApplierInput): Nation {
    const { defender, attackerId, calcResult, conquest, isDefenderAlive } =
      input;

    const cleanAttackerId = CountryRegistry.resolveCanonicalId(attackerId);

    const updatedMilitary = BattleLootManager.applyDefenderCasualties(
      defender.military,
      calcResult,
      isDefenderAlive,
    );

    const updatedRelations = { ...defender.relations };

    const isProvinceLost =
      calcResult.isAttackerVictory &&
      (conquest.conqueredPixels > 0 || calcResult.isFullCapitulation);

    if (isDefenderAlive) {
      const existingRel =
        defender.relations[cleanAttackerId] || defender.relations[attackerId];
      const currentGrudge = existingRel?.grudge ?? 0;
      const currentLostProvinces = existingRel?.lostProvincesCount ?? 0;
      const nextLostProvinces = isProvinceLost
        ? currentLostProvinces + (conquest.conqueredProvincesList.length || 1)
        : currentLostProvinces;

      updatedRelations[cleanAttackerId] = {
        targetNationId: cleanAttackerId,
        stance: "WAR",
        alignment: -100,
        tension: 100,
        grudge: Math.min(100, currentGrudge + 40),
        lostProvincesCount: nextLostProvinces,
      };
    }

    const currentFocus = defender.warFocusTargetId;
    const nextWarFocus =
      !currentFocus || currentFocus === cleanAttackerId
        ? cleanAttackerId
        : currentFocus;

    const combatStabilityDelta =
      StabilityCalculator.calculateDefenderBattleStabilityDelta(
        defender.government.type,
        isProvinceLost,
      );

    const nextStability = isDefenderAlive
      ? StabilityCalculator.clampStability(
          defender.government.stability + combatStabilityDelta,
        )
      : 0;

    return {
      ...defender,
      isAlive: isDefenderAlive,
      government: {
        ...defender.government,
        stability: nextStability,
      },
      treasury: isDefenderAlive
        ? Math.max(0, defender.treasury - calcResult.treasuryLooted)
        : 0,
      military: updatedMilitary,
      relations: isDefenderAlive ? updatedRelations : {},
      warFocusTargetId: isDefenderAlive ? nextWarFocus : null,
    };
  }
}
