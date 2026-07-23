import type { Nation } from "@/modules/nation/schemas/nation.schema";
import { GameError } from "@/core/errors/game-error";

export class CorruptionManager {
  public updateCorruptionLevel(nation: Nation): number {
    let delta = 0;
    if (nation.government.type === "DICTATORSHIP") {
      delta += 0.5;
    }
    if (nation.government.stability < 40) {
      delta += 0.8;
    } else if (nation.government.stability > 70) {
      delta -= 0.3;
    }
    const current = nation.government.corruption;
    return Math.max(0, Math.min(100, Math.floor(current + delta)));
  }

  public calculateTaxWastage(
    grossTaxIncome: number,
    corruptionLevel: number,
  ): number {
    return Math.floor(grossTaxIncome * (corruptionLevel / 100));
  }

  public antiCorruptionDrive(nation: Nation, investmentAmount: number): Nation {
    if (investmentAmount <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Anti-corruption investment must be greater than zero",
      );
    }
    if (nation.treasury < investmentAmount) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "Not enough treasury to fund anti-corruption drive",
      );
    }
    const corruptionReduction = Math.floor(investmentAmount / 10000);
    const newCorruption = Math.max(
      0,
      nation.government.corruption - corruptionReduction,
    );
    return {
      ...nation,
      treasury: nation.treasury - investmentAmount,
      government: {
        ...nation.government,
        corruption: newCorruption,
      },
    };
  }
}
