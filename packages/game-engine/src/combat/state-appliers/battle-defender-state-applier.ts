import { Nation } from "@/domain/nation/nation.schema";
import { BattleCalculationResult } from "@/engine/combat/battle-calculator";
import { BattleSpoilsDetails } from "@/domain/reports/combat-report.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { RelationProfile } from "@/domain/diplomacy/diplomacy.schema";
import { IndustryCalculator } from "@/domain/economy/industry-calculator.utility";
import { DebtCalculatorUtility } from "@geopolitics/domain";

export interface BattleDefenderStateInput {
  defender: Nation;
  attackerId: string;
  calcResult: BattleCalculationResult;
  spoilsData?: BattleSpoilsDetails;
  lostFactoriesCount?: number;
  destroyedFactoriesCount?: number;
  totalDefenderGdpBefore?: number;
  totalLostGdp?: number;
}

export class BattleDefenderStateApplier {
  public static apply(input: BattleDefenderStateInput): Nation {
    const {
      defender,
      attackerId,
      calcResult,
      spoilsData,
      lostFactoriesCount = 0,
      destroyedFactoriesCount = 0,
      totalDefenderGdpBefore = 0,
      totalLostGdp = 0,
    } = input;
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

    const totalFactoriesToDeduct = lostFactoriesCount + destroyedFactoriesCount;
    let updatedFactoryTiers = defender.factoryTiers;
    let updatedEquipmentTech = defender.equipmentTechLevel;

    if (totalFactoriesToDeduct > 0) {
      updatedFactoryTiers = IndustryCalculator.removeFactories(
        defender.factoryTiers,
        totalFactoriesToDeduct,
      );
      updatedEquipmentTech = IndustryCalculator.calculateWeightedAverageTech(
        updatedFactoryTiers,
        defender.industrialLevel,
      );
    }

    const debtRelief = DebtCalculatorUtility.calculateProportionalDebtRelief(
      defender.nationalDebt,
      totalLostGdp,
      totalDefenderGdpBefore,
    );

    const nextNationalDebt = Math.max(0, defender.nationalDebt - debtRelief);

    return {
      ...defender,
      treasury: nextTreasury,
      nationalDebt: nextNationalDebt,
      warFocusTargetId: defender.warFocusTargetId || canonicalAttacker,
      relations: updatedRelations,
      factoryTiers: updatedFactoryTiers,
      equipmentTechLevel: updatedEquipmentTech,
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
