import {
  MilitaryStack,
  UnitType,
  BranchTechRating,
} from "@/domain/military/military.schema";
import { MILITARY_UNIT_STATS } from "@/domain/military/military-unit-stats.config";

export class MilitaryDistributionEngine {
  public static readonly MAX_ARMY_GDP_RATIO = 0.2;
  public static readonly INITIAL_GDP_ARMY_RATIO = 0.15;
  public static readonly MIN_INITIAL_GDP_ARMY_RATIO = 0.05;

  public static calculateArmyBudgetRatio(
    domesticTechLevel: number,
    equipmentTechLevel: number,
  ): number {
    const nativeTech = Number(Math.max(1.0, domesticTechLevel).toFixed(2));
    const fieldTech = Number(
      Math.max(nativeTech, equipmentTechLevel).toFixed(2),
    );
    const techGap = Math.max(0, fieldTech - nativeTech);
    const penalty = techGap * 0.05;
    const ratio = Math.max(
      this.MIN_INITIAL_GDP_ARMY_RATIO,
      this.INITIAL_GDP_ARMY_RATIO - penalty,
    );
    return Math.min(this.MAX_ARMY_GDP_RATIO, ratio);
  }

  public static calculateStartingStack(
    gdp: number,
    domesticTechLevel = 1.0,
    equipmentTechLevel = 1.0,
  ): MilitaryStack {
    const safeGdp = Math.max(1_000_000_000, gdp);
    const nativeTech = Number(Math.max(1.0, domesticTechLevel).toFixed(2));
    const fieldTech = Number(
      Math.max(nativeTech, equipmentTechLevel).toFixed(2),
    );

    const budgetRatio = this.calculateArmyBudgetRatio(nativeTech, fieldTech);
    const totalArmyBudget = Math.floor(safeGdp * budgetRatio);

    const initialBranchTech: BranchTechRating = {
      infantry: nativeTech,
      armor: nativeTech,
      airDefense: nativeTech,
      airForce: nativeTech,
      droneMissile: fieldTech,
    };

    const quotaRatios: Record<UnitType, number> = {
      ARMOR: 0.3,
      AIR_FORCE: 0.3,
      INFANTRY: 0.15,
      AIR_DEFENSE: 0.15,
      DRONE_MISSILE: 0.1,
    };

    const priorities: UnitType[] = [
      "AIR_FORCE",
      "AIR_DEFENSE",
      "ARMOR",
      "DRONE_MISSILE",
      "INFANTRY",
    ];

    let remainingBudget = totalArmyBudget;
    const quantities: Record<UnitType, number> = {
      INFANTRY: 0,
      ARMOR: 0,
      AIR_DEFENSE: 0,
      AIR_FORCE: 0,
      DRONE_MISSILE: 0,
    };

    for (const type of priorities) {
      const stat = MILITARY_UNIT_STATS[type];
      const allocatedForType = Math.floor(totalArmyBudget * quotaRatios[type]);
      const spendable = Math.min(remainingBudget, allocatedForType);
      const count = Math.floor(spendable / stat.moneyCost);

      if (count > 0) {
        quantities[type] = count;
        remainingBudget -= count * stat.moneyCost;
      }
    }

    if (remainingBudget > 0) {
      for (const type of priorities) {
        const stat = MILITARY_UNIT_STATS[type];
        const count = Math.floor(remainingBudget / stat.moneyCost);
        if (count > 0) {
          quantities[type] += count;
          remainingBudget -= count * stat.moneyCost;
        }
      }
    }

    if (quantities.INFANTRY < 1) {
      quantities.INFANTRY = 1;
    }

    return {
      infantry: quantities.INFANTRY,
      armor: quantities.ARMOR,
      airDefense: quantities.AIR_DEFENSE,
      airForce: quantities.AIR_FORCE,
      droneMissile: quantities.DRONE_MISSILE,
      techLevel: nativeTech,
      branchTech: initialBranchTech,
    };
  }
}
