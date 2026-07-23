import type { DiplomaticStance } from "../schemas/diplomacy.schema";

export class DiplomaticOpinionCalculator {
  public calculateOpinion(
    globalReputation: number,
    globalAggression: number,
    stance: DiplomaticStance,
    isLandNeighbor: boolean,
    govFrictionValue = 0,
  ): number {
    let treatyModifier = 0;
    if (isLandNeighbor) {
      treatyModifier -= 10;
    }
    if (stance === "NON_AGGRESSION_PACT") {
      treatyModifier += 30;
    } else if (stance === "ALLIANCE") {
      treatyModifier += 50;
    }
    const calculated =
      globalReputation -
      globalAggression +
      treatyModifier +
      govFrictionValue * 5;
    return Math.max(-100, Math.min(100, calculated));
  }
}
