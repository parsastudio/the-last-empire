export class DebtCalculatorUtility {
  public static readonly MAX_DEBT_RATIO = 0.8;

  public static getMaxDebtLimit(gdp: number): number {
    return Math.floor(gdp * this.MAX_DEBT_RATIO);
  }

  public static getAvailableLoanHeadroom(
    nationalDebt: number,
    gdp: number,
  ): number {
    const maxLimit = this.getMaxDebtLimit(gdp);
    return Math.max(0, maxLimit - nationalDebt);
  }
}
