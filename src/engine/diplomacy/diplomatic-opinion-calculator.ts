import type { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

export class DiplomaticOpinionCalculator {
  public calculateOpinion(
    currentOpinion: number,
    globalReputation: number,
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
    const baseline = globalReputation + treatyModifier + govFrictionValue * 5;
    const target = Math.max(-100, Math.min(100, baseline));
    const nextOpinion = currentOpinion + (target - currentOpinion) * 0.2;
    return Math.max(-100, Math.min(100, Math.round(nextOpinion)));
  }
}
