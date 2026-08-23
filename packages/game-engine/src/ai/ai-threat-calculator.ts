import { Nation, Province } from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";

export interface ThreatEvaluationResult {
  threatScore: number;
  opportunityScore: number;
  isNeighbor: boolean;
  isLandNeighbor: boolean;
  isNavalReachable: boolean;
  powerRatio: number;
  vector: GeopoliticalVector;
}

export class AIThreatCalculator {
  public static evaluate(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    allNations?: Record<string, Nation>,
  ): ThreatEvaluationResult {
    const vector = GeopoliticalVectorCalculator.calculate(
      source,
      target,
      allNations,
      provincesMap,
    );

    const threatScore =
      vector.powerRatio > 1.1
        ? Math.min(
            100,
            Math.round(vector.tension * 0.8 + (vector.powerRatio - 1.0) * 30),
          )
        : Math.round(vector.tension * 0.5);

    const opportunityScore =
      vector.powerRatio < 0.8
        ? Math.min(
            100,
            Math.round(vector.tension * 0.6 + (1.0 - vector.powerRatio) * 50),
          )
        : 0;

    return {
      threatScore,
      opportunityScore,
      isNeighbor: vector.isNeighbor,
      isLandNeighbor: vector.isLandNeighbor,
      isNavalReachable: vector.isNavalReachable,
      powerRatio: vector.powerRatio,
      vector,
    };
  }
}
