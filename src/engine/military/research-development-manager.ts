import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";

export class ResearchDevelopmentManager {
  public getResearchCost(nation: Nation): number {
    const baseCost = Math.floor(nation.gdp * 0.12);
    return Math.max(1500000000, baseCost);
  }

  public investInResearch(nation: Nation): Nation {
    const cost = this.getResearchCost(nation);

    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        `Not enough treasury to research military tech level ${nation.military.techLevel + 1}`,
      );
    }

    return {
      ...nation,
      treasury: nation.treasury - cost,
      military: {
        ...nation.military,
        techLevel: nation.military.techLevel + 1,
      },
    };
  }
}
