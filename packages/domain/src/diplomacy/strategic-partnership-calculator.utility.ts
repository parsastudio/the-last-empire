export class StrategicPartnershipCalculatorUtility {
  public static readonly ENTRY_FEE_RATIO = 0.03;
  public static readonly DIVIDEND_RATIO = 0.006;

  public static calculateSigningCost(targetGdp: number): number {
    return Math.floor(Math.max(0, targetGdp) * this.ENTRY_FEE_RATIO);
  }

  public static calculateTurnDividend(partnerGdp: number): number {
    return Math.floor(Math.max(0, partnerGdp) * this.DIVIDEND_RATIO);
  }
}
