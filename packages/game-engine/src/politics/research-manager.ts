import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { MilitaryInventoryHelper } from "@/domain/military/military-inventory-helper";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class ResearchManager {
  public static getMajorLevelCost(baseLevel: number, gdp = 0): number {
    const level = Math.floor(Math.max(1, baseLevel));
    switch (level) {
      case 1:
        return 15_000_000_000;
      case 2:
        return 75_000_000_000;
      case 3:
        return 300_000_000_000;
      case 4:
        return 1_200_000_000_000;
      default: {
        const baseCost = Math.floor(
          2_500_000_000_000 * Math.pow(1.6, level - 5),
        );
        const gdpComponent = Math.floor(gdp * 0.1);
        return baseCost + gdpComponent;
      }
    }
  }

  public static getMilitaryTechCost(
    nation: Nation,
    provincesMap?: Record<string, Province> | Province[],
    overrideGdp?: number,
  ): number {
    const currentTech = nation.military.techLevel || 1.0;
    const majorLevel = Math.floor(currentTech);
    const effectiveGdp =
      overrideGdp !== undefined
        ? overrideGdp
        : getNationGdp(nation, provincesMap);
    const fullTierCost = this.getMajorLevelCost(majorLevel, effectiveGdp);
    return Math.floor(fullTierCost / 10);
  }

  public investInMilitaryTech(
    nation: Nation,
    provincesMap?: Record<string, Province> | Province[],
    overrideGdp?: number,
  ): Nation {
    const cost = ResearchManager.getMilitaryTechCost(
      nation,
      provincesMap,
      overrideGdp,
    );
    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای پژوهش ارتقای فناوری نظامی کافی نیست.",
      );
    }

    const currentTech = nation.military.techLevel || 1.0;
    const nextTechLevel = Number((currentTech + 0.1).toFixed(1));

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
