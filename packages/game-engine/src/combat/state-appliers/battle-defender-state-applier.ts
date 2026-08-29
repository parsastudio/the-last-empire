import { Nation, CountryRegistry } from "@geopolitics/domain";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleLootManager } from "@/engine/combat/loot/battle-loot-manager";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export interface DefenderStateApplierInput {
  defender: Nation;
  attackerId: string;
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
      (conquest.conqueredPixels > 0 || Boolean(calcResult.isFullCapitulation));

    if (isDefenderAlive) {
      updatedRelations[cleanAttackerId] = {
        targetNationId: cleanAttackerId,
        stance: "WAR",
        alignment: -100,
        tension: 100,
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

    let updatedDebt = defender.nationalDebt;
    if (
      isDefenderAlive &&
      conquest.conqueredProvincesList.length > 0 &&
      defender.nationalDebt > 0
    ) {
      const totalGdpBefore = Math.max(1, conquest.totalDefenderGdpBefore);
      const lostGdp = conquest.conqueredProvincesGdp || 0;
      const share = Math.min(1.0, Math.max(0, lostGdp / totalGdpBefore));
      const debtRelief = Math.floor(defender.nationalDebt * share);
      updatedDebt = Math.max(0, defender.nationalDebt - debtRelief);
    }

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
      nationalDebt: isDefenderAlive ? updatedDebt : 0,
      military: updatedMilitary,
      relations: isDefenderAlive ? updatedRelations : {},
      warFocusTargetId: isDefenderAlive ? nextWarFocus : null,
    };
  }
}
