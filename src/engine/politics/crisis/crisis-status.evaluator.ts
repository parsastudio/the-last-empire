import { Nation } from "@/domain/nation/nation.schema";

export type CrisisStatus = "STABLE" | "RESTLESS" | "CRISIS" | "REVOLT" | "COUP";

export class CrisisStatusEvaluator {
  public evaluateCrisisStatus(nation: Nation): {
    status: CrisisStatus;
    rebelStrength: number;
  } {
    const stability = nation.government.stability;
    const corruption = nation.government.corruption;

    if (stability < 10) {
      const rebelStrength = Math.max(
        50,
        Math.floor(nation.population * 0.0001),
      );
      const totalMilitaryPower =
        nation.military.infantry * 1.0 +
        nation.military.airForce * 3.0 +
        nation.military.droneMissile * 2.5;

      if (totalMilitaryPower === 0 || rebelStrength > totalMilitaryPower) {
        return { status: "COUP", rebelStrength };
      }

      return { status: "REVOLT", rebelStrength };
    }

    if (stability < 30 || corruption > 60) {
      return { status: "CRISIS", rebelStrength: 0 };
    }

    if (stability < 50 || corruption > 35) {
      return { status: "RESTLESS", rebelStrength: 0 };
    }

    return { status: "STABLE", rebelStrength: 0 };
  }
}
