export interface PowerScoreDetails {
  economicScore: number;
  militaryScore: number;
  powerScore: number;
}

export class PowerScoreCalculator {
  public calculateEconomicScore(gdp: number, treasury: number): number {
    const rawEco = gdp + treasury * 0.1;
    return rawEco / 1000000000;
  }

  public calculateMilitaryScore(
    infantry: number,
    airForce: number,
    drone: number,
    techLevel = 1,
    militaryPowerMultiplier = 1.0,
  ): number {
    const baseStrength = infantry * 1.0 + airForce * 3.0 + drone * 2.5;
    const techMultiplier = 1 + (techLevel - 1) * 0.2;
    return baseStrength * techMultiplier * militaryPowerMultiplier;
  }

  public calculatePowerScore(
    gdp: number,
    treasury: number,
    infantry: number,
    airForce: number,
    drone: number,
    techLevel = 1,
    militaryPowerMultiplier = 1.0,
  ): PowerScoreDetails {
    const economicScore = this.calculateEconomicScore(gdp, treasury);
    const militaryScore = this.calculateMilitaryScore(
      infantry,
      airForce,
      drone,
      techLevel,
      militaryPowerMultiplier,
    );
    const powerScore = Number((economicScore + militaryScore).toFixed(4));
    return {
      economicScore: Number(economicScore.toFixed(4)),
      militaryScore: Number(militaryScore.toFixed(4)),
      powerScore,
    };
  }
}
