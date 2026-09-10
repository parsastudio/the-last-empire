export class DebtCalculatorUtility {
  public static readonly MAX_DEBT_RATIO = 0.3;
  public static readonly BANKRUPTCY_THRESHOLD_RATIO = 0.45;
  public static readonly INTEREST_RATE = 0.1;

  public static getMaxDebtLimit(gdp: number): number {
    return Math.floor(gdp * this.MAX_DEBT_RATIO);
  }

  public static getBankruptcyLimit(gdp: number): number {
    return Math.floor(gdp * this.BANKRUPTCY_THRESHOLD_RATIO);
  }

  public static calculateInterest(debt: number): number {
    return Math.floor(debt * this.INTEREST_RATE);
  }

  public static getAvailableLoanHeadroom(
    nationalDebt: number,
    gdp: number,
  ): number {
    const maxLimit = this.getMaxDebtLimit(gdp);
    return Math.max(0, maxLimit - nationalDebt);
  }

  public static isDebtLimitExceeded(
    currentDebt: number,
    additionalLoan: number,
    gdp: number,
  ): boolean {
    const maxLimit = this.getMaxDebtLimit(gdp);
    return currentDebt + additionalLoan > maxLimit;
  }

  public static toBillionUnits(amount: number): number {
    return Math.floor(Math.max(0, amount) / 1e9);
  }

  public static fromBillionUnits(billionAmount: number): number {
    return Math.max(0, billionAmount) * 1e9;
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
