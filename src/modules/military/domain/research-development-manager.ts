import type { Nation } from "@/core/types/nation.types";
import { GameError } from "@/core/errors/game-error";

export class ResearchDevelopmentManager {
  public getResearchCost(currentTechLevel: number): number {
    return Math.floor(100000 * Math.pow(2.0, currentTechLevel - 1));
  }

  public investInResearch(nation: Nation): Nation {
    const cost = this.getResearchCost(nation.military.techLevel);

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
