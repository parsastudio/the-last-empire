import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { NationRelationResolver } from "@geopolitics/domain";
import { DiplomaticBetrayalCalculator } from "@/engine/diplomacy/diplomacy-engine";

export interface BattleAttackerStateInput {
  attacker: Nation;
  defenderId: string;
  calcResult: BattleCalculationResult;
  spoilsData?: BattleSpoilsDetails;
  isDefenderAnnexed?: boolean;
  conqueredFactoriesCount?: number;
  defenderTechLevel?: number;
}

export class BattleAttackerStateApplier {
  public static apply(input: BattleAttackerStateInput): Nation {
    const {
      attacker,
      defenderId,
      calcResult,
      spoilsData,
      isDefenderAnnexed,
      conqueredFactoriesCount = 0,
      defenderTechLevel = 1.0,
    } = input;
    const canonicalDefender = CountryRegistry.resolveCanonicalId(defenderId);

    const prevStance = NationRelationResolver.getStance(
      attacker.relations,
      canonicalDefender,
    );

    const betrayalEvaluation =
      DiplomaticBetrayalCalculator.calculatePenalty(prevStance);
    const nextReputation = Math.max(
      -100,
      attacker.globalReputation - betrayalEvaluation.reputationPenalty,
    );

    const updatedRelations: Record<string, RelationProfile> = {
      ...(attacker.relations || {}),
    };

    if (!isDefenderAnnexed) {
      updatedRelations[canonicalDefender] = {
        targetNationId: canonicalDefender,
        stance: "WAR",
        alignment: -100,
        tension: 100,
      };
    } else {
      delete updatedRelations[canonicalDefender];
      delete updatedRelations[defenderId];
    }

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

    let updatedFactoryTiers = attacker.factoryTiers;
    let updatedEquipmentTech = attacker.equipmentTechLevel;

    if (conqueredFactoriesCount > 0) {
      const effectiveTech = Math.max(
        defenderTechLevel,
        IndustryCalculator.getIndustrialFloor(attacker.industrialLevel),
      );
      updatedFactoryTiers = IndustryCalculator.addFactories(
        attacker.factoryTiers,
        conqueredFactoriesCount,
        effectiveTech,
      );
      updatedFactoryTiers = IndustryCalculator.applyIndustrialFloor(
        updatedFactoryTiers,
        attacker.industrialLevel,
      );
      updatedEquipmentTech = IndustryCalculator.calculateWeightedAverageTech(
        updatedFactoryTiers,
        attacker.industrialLevel,
      );
    }

    return {
      ...attacker,
      treasury: nextTreasury,
      globalReputation: nextReputation,
      warFocusTargetId: isDefenderAnnexed
        ? attacker.warFocusTargetId === canonicalDefender
          ? null
          : attacker.warFocusTargetId
        : canonicalDefender,
      relations: updatedRelations,
      factoryTiers: updatedFactoryTiers,
      equipmentTechLevel: updatedEquipmentTech,
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
