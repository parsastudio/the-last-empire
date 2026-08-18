import { Nation } from "@/domain/nation/nation.schema";

export interface DemographicsTransferResult {
  transferredPopulation: number;
  transferredCapacity: number;
}

export class DemographicsTransferCalculator {
  public static calculateTransfer(
    defender: Nation,
    isAttackerVictory: boolean,
    isFullCapitulation: boolean,
    conqueredPixels: number,
    defenderTotalPixels: number,
  ): DemographicsTransferResult {
    if (!isAttackerVictory) {
      return { transferredPopulation: 0, transferredCapacity: 0 };
    }

    const transferredRatio = isFullCapitulation
      ? 1.0
      : Math.min(1.0, conqueredPixels / (defenderTotalPixels || 1));

    const transferredPopulation = Math.floor(
      defender.population * transferredRatio,
    );

    const baseCapacity =
      defender.maxPopulationCapacity || Math.floor(defender.population / 0.95);
    const transferredCapacity = Math.floor(baseCapacity * transferredRatio);

    return {
      transferredPopulation,
      transferredCapacity,
    };
  }
}
