import type { DiplomaticStance } from "@/domain/diplomacy/diplomacy.schema";

export class DiplomaticOpinionCalculator {
  public calculateOpinion(
    currentOpinion: number,
    globalReputation: number,
    stance: DiplomaticStance,
    isLandNeighbor: boolean,
    govFrictionValue = 0,
  ): number {
    let stanceModifier = 0;
    if (isLandNeighbor) {
      stanceModifier -= 10;
    }

    switch (stance) {
      case "WAR":
        stanceModifier -= 80;
        break;
      case "SEVERED_RELATIONS":
        stanceModifier -= 30;
        break;
      case "NON_AGGRESSION_PACT":
        stanceModifier += 30;
        break;
      case "ALLIANCE":
        stanceModifier += 50;
        break;
      case "NORMAL_DIPLOMACY":
      default:
        break;
    }

    const baseline = globalReputation + stanceModifier + govFrictionValue * 5;
    const target = Math.max(-100, Math.min(100, baseline));
    const nextOpinion = currentOpinion + (target - currentOpinion) * 0.2;
    return Math.max(-100, Math.min(100, Math.round(nextOpinion)));
  }
}
