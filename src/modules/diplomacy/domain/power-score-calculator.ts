export interface PowerScoreDetails {
  economicScore: number;
  militaryScore: number;
  powerScore: number;
}

export class PowerScoreCalculator {
  public calculateEconomicScore(gdp: number, treasury: number): number {
    return gdp / 100000 + treasury / 10000;
  }

  public calculateMilitaryScore(
    infantry: number,
    airForce: number,
    drone: number,
  ): number {
    return infantry * 1.0 + airForce * 3.0 + drone * 2.5;
  }

  public calculatePowerScore(
    gdp: number,
    treasury: number,
    infantry: number,
    airForce: number,
    drone: number,
  ): PowerScoreDetails {
    const economicScore = this.calculateEconomicScore(gdp, treasury);
    const militaryScore = this.calculateMilitaryScore(
      infantry,
      airForce,
      drone,
    );
    const powerScore = Number((economicScore + militaryScore).toFixed(4));
    return {
      economicScore: Number(economicScore.toFixed(4)),
      militaryScore: Number(militaryScore.toFixed(4)),
      powerScore,
    };
  }

  public rankNations(
    nations: {
      id: string;
      gdp: number;
      treasury: number;
      infantry: number;
      airForce: number;
      drone: number;
    }[],
  ): { id: string; score: number; rank: number }[] {
    const scores = nations.map((n) => {
      const details = this.calculatePowerScore(
        n.gdp,
        n.treasury,
        n.infantry,
        n.airForce,
        n.drone,
      );
      return {
        id: n.id,
        score: details.powerScore,
      };
    });

    scores.sort((a, b) => b.score - a.score);

    return scores.map((item, index) => ({
      id: item.id,
      score: item.score,
      rank: index + 1,
    }));
  }
}
