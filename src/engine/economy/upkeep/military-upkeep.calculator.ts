import { Nation } from "@/domain/nation/nation.schema";

export class MilitaryUpkeepCalculator {
  public calculateMilitaryCost(
    nation: Nation,
    traitMultiplier: number,
    militaryUpkeepMultiplier: number,
  ): number {
    const baseWeight =
      nation.military.infantry * 1.0 +
      nation.military.airForce * 3.0 +
      nation.military.droneMissile * 0.2;

    return Math.floor(
      baseWeight *
        12 *
        nation.military.techLevel *
        traitMultiplier *
        militaryUpkeepMultiplier,
    );
  }
}
