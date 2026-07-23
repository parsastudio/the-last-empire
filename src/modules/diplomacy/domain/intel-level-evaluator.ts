export type QualitativeLabel = "Weak" | "Medium" | "Strong";

export class IntelLevelEvaluator {
  public getInfantryLabel(infantryCount: number): QualitativeLabel {
    if (infantryCount < 50) {
      return "Weak";
    }
    if (infantryCount <= 150) {
      return "Medium";
    }
    return "Strong";
  }

  public maskMilitary(
    infantryCount: number,
    intelLevel: number,
  ): string | number {
    if (intelLevel >= 2) {
      return infantryCount;
    }
    if (intelLevel === 1) {
      return this.getInfantryLabel(infantryCount);
    }
    return "UNKNOWN";
  }

  public getGdpDirection(
    currentGdp: number,
    previousGdp: number,
  ): "UP" | "DOWN" | "STEADY" {
    if (currentGdp > previousGdp) {
      return "UP";
    }
    if (currentGdp < previousGdp) {
      return "DOWN";
    }
    return "STEADY";
  }
}
