import type { Nation, GovernmentType } from "@/core/types";
import { GameError } from "@/core/errors/game-error";

export class RegimeChangeManager {
  private readonly changeCost = 150000;
  private readonly stabilityPenalty = 40;

  public changeRegime(nation: Nation, newGovernment: GovernmentType): Nation {
    if (nation.government.type === newGovernment) {
      throw new GameError(
        "INVALID_GOVERNMENT_CHANGE",
        "Nation is already under this government type",
      );
    }

    if (nation.treasury < this.changeCost) {
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
      treasury: nation.treasury - this.changeCost,
      government: {
        ...nation.government,
        type: newGovernment,
        stability: updatedStability,
        turnsInPower: 0,
      },
    };
  }
}
