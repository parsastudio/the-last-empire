import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export class CorruptionManager {
  public updateCorruptionLevel(nation: Nation): number {
    const stability = nation.government.stability;
    const baseEntropyGrowth = 5.0 * (1.0 - stability / 100);

    let regimePenalty = 0;
    if (nation.government.type === "DICTATORSHIP") {
      regimePenalty = 0.5;
    } else if (nation.government.type === "FASCISM") {
      regimePenalty = 0.3;
    }

    const current = nation.government.corruption;
    const newCorruption = current + baseEntropyGrowth + regimePenalty;

    return Math.max(0, Math.min(100, Number(newCorruption.toFixed(2))));
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

    const corruptionReduction = Math.floor(
      (investmentAmount / (nation.gdp || 1)) * 100,
    );

    const newCorruption = Math.max(
      0,
      nation.government.corruption - corruptionReduction,
    );
    return {
      ...nation,
      treasury: nation.treasury - investmentAmount,
      government: {
        ...nation.government,
        corruption: Number(newCorruption.toFixed(2)),
      },
    };
  }
}
