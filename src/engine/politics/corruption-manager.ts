import type { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";

export class CorruptionManager {
  public static updateCorruptionLevel(nation: Nation): number {
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

    if (newCorruption <= 0.01) return 0;
    return Math.max(0, Math.min(100, Number(newCorruption.toFixed(2))));
  }

  public static antiCorruptionDrive(
    nation: Nation,
    investmentAmount: number,
  ): Nation {
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

    const exactReduction = Math.round(
      (investmentAmount / (nation.gdp || 1)) * 100,
    );
    const corruptionReduction = Math.max(1, exactReduction);

    const rawCorruption = nation.government.corruption - corruptionReduction;
    const newCorruption =
      rawCorruption <= 0.01 ? 0 : Number(rawCorruption.toFixed(2));

    return {
      ...nation,
      treasury: nation.treasury - investmentAmount,
      government: {
        ...nation.government,
        corruption: Math.max(0, newCorruption),
      },
    };
  }
}
