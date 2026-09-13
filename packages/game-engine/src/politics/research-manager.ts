import { Nation } from "@/domain/nation/nation.schema";
import { GameError, GovernmentTraitsUtility } from "@geopolitics/domain";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class ResearchManager {
  public static readonly MILITARY_RESEARCH_BASE_COST = 100_000_000_000;
  public static readonly MILITARY_RESEARCH_GROWTH_BASE = 2.5;
  public static readonly RESEARCH_STEP = 0.1;

  public static getMilitaryTechCost(
    techLevel: number = 1.0,
    governmentType?: string,
  ): number {
    const currentTech = Math.max(1.0, techLevel);
    const k = Math.floor(currentTech);
    const fullTierCost =
      this.MILITARY_RESEARCH_BASE_COST *
      Math.pow(this.MILITARY_RESEARCH_GROWTH_BASE, k - 1);

    const modifier = governmentType
      ? GovernmentTraitsUtility.getModifiers(governmentType)
          .militaryResearchCostMultiplier
      : 1.0;

    return Math.floor((fullTierCost / 10) * modifier);
  }

  public investInMilitaryTech(nation: Nation): Nation {
    const currentTech = nation.military.techLevel || 1.0;
    const cost = ResearchManager.getMilitaryTechCost(
      currentTech,
      nation.government?.type,
    );

    if (nation.treasury < cost) {
      throw new GameError("INSUFFICIENT_FUNDS");
    }

    const nextTechLevel = Number(
      (currentTech + ResearchManager.RESEARCH_STEP).toFixed(1),
    );

    const updatedMilitary = MilitaryInventoryHelper.syncBranchTechOnUpgrade(
      nation.military,
      nextTechLevel,
    );

    return {
      ...nation,
      treasury: nation.treasury - cost,
      military: updatedMilitary,
    };
  }
}
