import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { DemographicsTransferResult } from "@/engine/combat/conquest/demographics-transfer-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleLootManager } from "@/engine/combat/loot/battle-loot-manager";
import { NationGeographySyncer } from "@/engine/pipeline/nation-geography-syncer";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";
import { CountryRegistry } from "@/domain/data/countries";

export interface DefenderStateApplierInput {
  defender: Nation;
  attackerId: string;
  canonicalAttackerId: string;
  calcResult: BattleCalculationResult;
  conquest: ProvinceConquestResult;
  transfer: DemographicsTransferResult;
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

    if (isDefenderAlive) {
      const existingRel =
        defender.relations[cleanAttackerId] || defender.relations[attackerId];
      const currentGrudge = existingRel?.grudge ?? 0;
      updatedRelations[cleanAttackerId] = {
        targetNationId: cleanAttackerId,
        stance: "WAR",
        opinion: -100,
        grudge: Math.min(100, currentGrudge + 40),
      };
    }

    const currentFocus = defender.warFocusTargetId;
    const nextWarFocus =
      !currentFocus || currentFocus === cleanAttackerId
        ? cleanAttackerId
        : currentFocus;

    const isProvinceLost =
      calcResult.isAttackerVictory &&
      (conquest.conqueredPixels > 0 || calcResult.isFullCapitulation);

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

    const interimDefender: Nation = {
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

    const { syncedNation } = NationGeographySyncer.sync(
      interimDefender,
      conquest.remainingDefenderProvinces,
    );

    return syncedNation;
  }
}
