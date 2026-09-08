export class SecurityFeeCalculatorUtility {
  public static readonly EMERGENCY_FEE_RATIO = 0.05;
  public static readonly DEFENSE_PACT_SIGNING_RATIO = 0.03;

  public static calculateSecurityFee(
    clientGdp: number,
    isEmergency = false,
  ): number {
    if (!isEmergency) {
      return 0;
    }
    return Math.floor(clientGdp * this.EMERGENCY_FEE_RATIO);
  }

  public static calculateSigningCost(guarantorGdp: number): number {
    return Math.floor(guarantorGdp * this.DEFENSE_PACT_SIGNING_RATIO);
  }
}
