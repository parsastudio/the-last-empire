import { Nation } from "@/domain/nation/nation.schema";
import { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { DemographicsTransferResult } from "@/engine/combat/conquest/demographics-transfer-calculator";
import { ProvinceConquestResult } from "@/engine/combat/conquest/province-conquest-handler";
import { BetrayalEvaluation } from "@/engine/diplomacy/diplomacy-engine";
import { BattleLootManager } from "@/engine/combat/loot/battle-loot-manager";
import { GdpCalculator } from "@/engine/economy/calculators/gdp-calculator";
import { StabilityCalculator } from "@/engine/politics/stability-calculator";

export interface AttackerStateApplierInput {
  attacker: Nation;
  defenderId: string;
  canonicalDefenderId: string;
  defenderTechLevel: number;
  calcResult: BattleCalculationResult;
  conquest: ProvinceConquestResult;
  transfer: DemographicsTransferResult;
  currentStance: DiplomaticStance;
  betrayalResult: BetrayalEvaluation;
}

export class BattleAttackerStateApplier {
  public static apply(input: AttackerStateApplierInput): Nation {
    const {
      attacker,
      defenderId,
      canonicalDefenderId,
      defenderTechLevel,
      calcResult,
      conquest,
      transfer,
      currentStance,
      betrayalResult,
    } = input;

    const attackerTotalPixels = conquest.attackerProvinces.reduce(
      (sum, p) => sum + p.pixelCount,
      0,
    );
    const attackerProvIds = conquest.attackerProvinces.map((p) => p.provinceId);

    const updatedMilitary = BattleLootManager.applyAttackerForcesAndSpoils(
      attacker.military,
      defenderTechLevel,
      calcResult,
    );

    const newMaxCap =
      (attacker.maxPopulationCapacity ||
        Math.floor(attacker.population / 0.95)) + transfer.transferredCapacity;

    const updatedAttacker = GdpCalculator.syncNationGdpAndDemographics(
      {
        ...attacker,
        maxPopulationCapacity: newMaxCap,
        geography: {
          ...attacker.geography,
          territoryPixelCount: attackerTotalPixels,
        },
      },
      attacker.population + transfer.transferredPopulation,
    );

    let baseWarRepPenalty = currentStance !== "WAR" ? 10 : 0;
    if (calcResult.isFullCapitulation) {
      baseWarRepPenalty += 15;
    }
    const totalRepPenalty =
      baseWarRepPenalty +
      (betrayalResult.hasBetrayed ? betrayalResult.reputationPenalty : 0);

    const targetKey = updatedAttacker.relations[defenderId]
      ? defenderId
      : canonicalDefenderId;

    const existingRel = updatedAttacker.relations[targetKey];
    const currentGrudge = existingRel?.grudge ?? 0;

    const updatedRelations = { ...updatedAttacker.relations };
    if (updatedRelations[targetKey]) {
      updatedRelations[targetKey] = {
        ...updatedRelations[targetKey]!,
        stance: "WAR",
        isTradeEmbargoed: true,
        opinion: -100,
        grudge: currentGrudge,
      };
    }

    const combatStabilityDelta =
      StabilityCalculator.calculateAttackerBattleStabilityDelta(
        attacker.government.type,
        calcResult.isAttackerVictory,
      );

    const nextStability = StabilityCalculator.clampStability(
      attacker.government.stability + combatStabilityDelta,
    );

    return {
      ...updatedAttacker,
      government: {
        ...updatedAttacker.government,
        stability: nextStability,
      },
      globalReputation: Math.max(
        -100,
        attacker.globalReputation - totalRepPenalty,
      ),
      provinceIds: attackerProvIds,
      treasury:
        attacker.treasury -
        calcResult.deploymentMoneyCost +
        calcResult.treasuryLooted,
      military: updatedMilitary,
      relations: updatedRelations,
      warFocusTargetId: defenderId,
    };
  }
}
