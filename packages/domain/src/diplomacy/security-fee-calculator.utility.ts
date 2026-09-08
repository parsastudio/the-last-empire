export class SecurityFeeCalculatorUtility {
  public static readonly EMERGENCY_FEE_RATIO = 0.05;
  public static readonly DEFENSE_PACT_SIGNING_RATIO = 0.01;

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

  public static calculateRefusalCompensation(guarantorGdp: number): number {
    return Math.floor(guarantorGdp * (this.DEFENSE_PACT_SIGNING_RATIO / 2));
  }
}
