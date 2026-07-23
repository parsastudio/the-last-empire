import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { GovernmentType } from "@/modules/politics/schemas/politics.schema";
import { GameError } from "@/core/errors/game-error";

export class RegimeChangeManager {
  private readonly stabilityPenalty = 40;

  public changeRegime(nation: Nation, newGovernment: GovernmentType): Nation {
    if (nation.government.type === newGovernment) {
      throw new GameError(
        "INVALID_GOVERNMENT_CHANGE",
        "Nation is already under this government type",
      );
    }
    const changeCost = Math.floor(nation.gdp * 0.05);
    if (nation.treasury < changeCost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough treasury to execute regime change",
      );
    }
    const updatedStability = Math.max(
      0,
      nation.government.stability - this.stabilityPenalty,
    );
    return {
      ...nation,
      treasury: nation.treasury - changeCost,
      government: {
        ...nation.government,
        type: newGovernment,
        stability: updatedStability,
        turnsInPower: 0,
      },
    };
  }
}
