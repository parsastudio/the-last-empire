import { Nation } from "@/domain/nation/nation.schema";

export class TributeCapCalculator {
  private readonly maxTreasuryRatio = 0.1;

  public calculateMaxTribute(targetNation: Nation): number {
    const treasury = Math.max(0, targetNation.treasury);
    return Math.floor(treasury * this.maxTreasuryRatio);
  }

  public isWithinCap(targetNation: Nation, amount: number): boolean {
    const maxAllowed = this.calculateMaxTribute(targetNation);
    return amount <= maxAllowed;
  }
}
