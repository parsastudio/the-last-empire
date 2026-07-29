import type { Nation } from "@/domain/nation/nation.schema";
import type { GovernmentType } from "@/domain/politics/politics.schema";
import { GameError } from "@/domain/shared/game-error";

export class RegimeChangeManager {
  private readonly stabilityPenalty = 40;

  public changeRegime(nation: Nation, newGovernment: GovernmentType): Nation {
    if (nation.government.type === newGovernment) {
      throw new GameError(
        "INVALID_GOVERNMENT_CHANGE",
        "Nation is already under this government type",
      );
    }
    if (nation.government.turnsInPower < 15) {
      throw new GameError(
        "INVALID_GOVERNMENT_CHANGE",
        `Must wait at least 15 turns between government regime changes. Current turns in power: ${nation.government.turnsInPower}`,
      );
    }
    const changeCost = Math.floor(nation.gdp * 0.01);
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
