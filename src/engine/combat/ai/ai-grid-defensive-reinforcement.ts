import { Nation } from "@/domain/nation/nation.schema";

export class AiGridDefensiveReinforcement {
  private readonly riskLimit = 0.5;

  public evaluateDefenseFeasibility(
    defender: Nation,
    logisticsCost: number,
    enclaveGdp: number,
  ): boolean {
    if (defender.treasury < logisticsCost) {
      return false;
    }

    const valueRatio = enclaveGdp / (logisticsCost || 1);
    if (valueRatio < 1.0) {
      return false;
    }

    const budgetRatio = logisticsCost / defender.treasury;
    return budgetRatio <= this.riskLimit;
  }
}
