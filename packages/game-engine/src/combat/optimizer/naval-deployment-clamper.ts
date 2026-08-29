export interface NavalClampResult {
  inf: number;
  arm: number;
  maxNavalCap: number;
}

export class NavalDeploymentClamper {
  public static calculateMaxCapacity(
    attackType: "LAND" | "NAVAL",
    navalFleetCount: number,
  ): number {
    return attackType === "NAVAL"
      ? Math.max(0, navalFleetCount * 60)
      : Infinity;
  }

  public static clamp(
    inf: number,
    arm: number,
    attackType: "LAND" | "NAVAL",
    navalFleetCount: number,
  ): NavalClampResult {
    const maxNavalCap = this.calculateMaxCapacity(attackType, navalFleetCount);
    let curInf = inf;
    let curArm = arm;

    if (attackType === "NAVAL" && maxNavalCap < Infinity) {
      while (curInf * 1 + curArm * 4 > maxNavalCap) {
        if (curArm > 0 && curArm * 4 >= curInf) {
          curArm = Math.max(0, curArm - 1);
        } else if (curInf > 1) {
          curInf = Math.max(1, curInf - 1);
        } else if (curArm > 0) {
          curArm = Math.max(0, curArm - 1);
        } else {
          break;
        }
      }
    }

    return { inf: curInf, arm: curArm, maxNavalCap };
  }
}
