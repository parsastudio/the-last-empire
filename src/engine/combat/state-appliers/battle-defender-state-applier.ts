import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { DemographicsTransferResult } from "@/engine/combat/conquest/demographics-transfer-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BattleLootManager } from "@/engine/combat/loot/battle-loot-manager";
import { GdpCalculator } from "@/engine/economy/calculators/gdp-calculator";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

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
    const {
      defender,
      attackerId,
      canonicalAttackerId,
      calcResult,
      conquest,
      transfer,
      isDefenderAlive,
    } = input;

    const defenderRemainingPixels = conquest.remainingDefenderProvinces.reduce(
      (sum, p) => sum + p.pixelCount,
      0,
    );
    const defenderProvIds = conquest.remainingDefenderProvinces.map(
      (p) => p.provinceId,
    );

    const newPop = isDefenderAlive
      ? Math.max(0, defender.population - transfer.transferredPopulation)
      : 0;
    const newCap = isDefenderAlive
      ? Math.max(
          0,
          (defender.maxPopulationCapacity ||
            Math.floor(defender.population / 0.95)) -
            transfer.transferredCapacity,
        )
      : 0;

    const updatedMilitary = BattleLootManager.applyDefenderCasualties(
      defender.military,
      calcResult,
      isDefenderAlive,
    );

    const updatedDefender = GdpCalculator.syncNationGdpAndDemographics(
      {
        ...defender,
        maxPopulationCapacity: newCap,
        geography: {
          ...defender.geography,
          territoryPixelCount: defenderRemainingPixels,
        },
      },
      newPop,
    );

    const targetKey = updatedDefender.relations[attackerId]
      ? attackerId
      : canonicalAttackerId;

    const existingRel = updatedDefender.relations[targetKey];
    const currentGrudge = existingRel?.grudge ?? 0;
    const grudgeSurge = calcResult.isFullCapitulation ? 50 : 40;

    const updatedRelations = { ...updatedDefender.relations };
    if (updatedRelations[targetKey]) {
      updatedRelations[targetKey] = {
        ...updatedRelations[targetKey]!,
        stance: "WAR",
        isTradeEmbargoed: true,
        opinion: -100,
        grudge: Math.min(100, currentGrudge + grudgeSurge),
      };
    }

    const currentFocus = updatedDefender.warFocusTargetId;
    const nextWarFocus =
      !currentFocus || currentFocus === attackerId ? attackerId : currentFocus;

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

    return {
      ...updatedDefender,
      isAlive: isDefenderAlive,
      provinceIds: defenderProvIds,
      government: {
        ...updatedDefender.government,
        stability: nextStability,
      },
      treasury: isDefenderAlive
        ? Math.max(0, defender.treasury - calcResult.treasuryLooted)
        : 0,
      military: updatedMilitary,
      relations: updatedRelations,
      warFocusTargetId: isDefenderAlive ? nextWarFocus : null,
    };
  }
}
