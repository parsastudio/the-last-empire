import { PowerScoreCalculator } from "./power-score-calculator";

export interface NationRankInput {
  id: string;
  gdp: number;
  treasury: number;
  infantry: number;
  airForce: number;
  drone: number;
  techLevel?: number;
  militaryPowerMultiplier?: number;
}

export interface NationRankOutput {
  id: string;
  score: number;
  rank: number;
}

export class PowerScoreRanker {
  private calculator = new PowerScoreCalculator();

  public rankNations(nations: NationRankInput[]): NationRankOutput[] {
    const scores = nations.map((n) => {
      const details = this.calculator.calculatePowerScore(
        n.gdp,
        n.treasury,
        n.infantry,
        n.airForce,
        n.drone,
        n.techLevel ?? 1,
        n.militaryPowerMultiplier ?? 1.0,
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
