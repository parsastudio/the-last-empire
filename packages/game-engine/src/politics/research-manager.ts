import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";

export class ResearchManager {
  public static getMilitaryTechCost(nation: Nation): number {
    const level = nation.military.techLevel || 1;
    switch (level) {
      case 1:
        return 15_000_000_000;
      case 2:
        return 75_000_000_000;
      case 3:
        return 300_000_000_000;
      case 4:
        return 1_200_000_000_000;
      default:
        return Math.floor(2_500_000_000_000 * Math.pow(1.5, level - 5));
    }
  }

  public investInMilitaryTech(nation: Nation): Nation {
    const cost = ResearchManager.getMilitaryTechCost(nation);
    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای پژوهش ارتقای فناوری نظامی کافی نیست.",
      );
    }

    const nextTechLevel = nation.military.techLevel + 1;
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
