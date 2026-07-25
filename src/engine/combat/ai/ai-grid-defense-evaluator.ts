import { Nation } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class AiGridDefenseEvaluator {
  private readonly maxReinforcementBudgetRatio = 0.4;

  public shouldReinforceEnclave(
    defender: Nation,
    enclaveCells: GridCell[],
    logisticsCost: number,
  ): boolean {
    if (defender.treasury < logisticsCost) {
      return false;
    }

    const enclaveValue = enclaveCells.reduce(
      (sum, c) => sum + c.highResPixelCount * 250000,
      0,
    );

    if (enclaveValue < logisticsCost) {
      return false;
    }

    const costRatio = logisticsCost / defender.treasury;
    return costRatio <= this.maxReinforcementBudgetRatio;
  }
}
