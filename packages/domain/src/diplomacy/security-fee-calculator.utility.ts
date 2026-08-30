export class SecurityFeeCalculatorUtility {
  public static readonly NORMAL_FEE_RATIO = 0.1;
  public static readonly EMERGENCY_FEE_RATIO = 0.3;

  public static getFeeRatio(isEmergency = false): number {
    return isEmergency ? this.EMERGENCY_FEE_RATIO : this.NORMAL_FEE_RATIO;
  }

  public static calculateSecurityFee(
    clientGdp: number,
    isEmergency = false,
  ): number {
    return Math.floor(clientGdp * this.getFeeRatio(isEmergency));
  }
}
