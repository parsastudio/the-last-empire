import { Nation, Province } from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";

export interface ThreatEvaluationResult {
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

    return {
      powerRatio: vector.powerRatio,
      vector,
    };
  }
}
