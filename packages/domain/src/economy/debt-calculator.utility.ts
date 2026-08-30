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

  public static calculateProportionalDebtRelief(
    currentDebt: number,
    lostProvincesGdp: number,
    totalGdpBefore: number,
  ): number {
    if (currentDebt <= 0 || totalGdpBefore <= 0 || lostProvincesGdp <= 0) {
      return 0;
    }
    const share = Math.min(1.0, Math.max(0, lostProvincesGdp / totalGdpBefore));
    return Math.floor(currentDebt * share);
  }
}
