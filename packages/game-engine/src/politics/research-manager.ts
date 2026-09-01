import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class ResearchManager {
  public static readonly MILITARY_RESEARCH_BASE_COST = 200_000_000_000;
  public static readonly MILITARY_RESEARCH_GROWTH_BASE = 2.5;
  public static readonly RESEARCH_STEP = 0.1;

  public static getMilitaryTechCost(techLevel: number = 1.0): number {
    const currentTech = Math.max(1.0, techLevel);
    const k = Math.floor(currentTech);
    const fullTierCost =
      this.MILITARY_RESEARCH_BASE_COST *
      Math.pow(this.MILITARY_RESEARCH_GROWTH_BASE, k - 1);
    return Math.floor(fullTierCost / 10);
  }

  public investInMilitaryTech(nation: Nation): Nation {
    const currentTech = nation.military.techLevel || 1.0;
    const cost = ResearchManager.getMilitaryTechCost(currentTech);

    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای پژوهش ارتقای فناوری نظامی کافی نیست.",
      );
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
