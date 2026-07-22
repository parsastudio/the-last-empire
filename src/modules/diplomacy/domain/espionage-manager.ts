import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { RelationProfile } from "@/modules/diplomacy/schemas/diplomacy.schema";

export interface EspionageResult {
  success: boolean;
  exposureChance: number;
}

export class EspionageManager {
  public calculateOperationSuccess(
    attacker: Nation,
    defender: Nation,
    relation: RelationProfile,
    operationType:
      | "SABOTAGE_INDUSTRY"
      | "INSTIGATE_UNREST"
      | "MILITARY_INTEL_HEIST",
    randomVal: number,
  ): EspionageResult {
    const baseChance = this.getBaseChance(operationType);
    const networkModifier = relation.spyNetworkStrength * 0.4;
    const techDiff = attacker.military.techLevel - defender.military.techLevel;
    const stabilityPenalty = defender.government.stability * 0.2;

    const finalSuccessChance =
      baseChance + networkModifier + techDiff * 5 - stabilityPenalty;
    const cappedSuccessChance = Math.max(5, Math.min(95, finalSuccessChance));

    const success = randomVal * 100 < cappedSuccessChance;
    const baseExposure = success ? 20 : 50;
    const exposureChance = Math.max(
      10,
      Math.min(
        90,
        baseExposure - relation.spyNetworkStrength * 0.2 + stabilityPenalty,
      ),
    );

    return {
      success,
      exposureChance,
    };
  }

  public applyDecay(relation: RelationProfile): RelationProfile {
    const nextStrength = Math.max(0, relation.spyNetworkStrength - 2);
    let nextIntel = relation.intelLevel;

    if (nextStrength < 15 && relation.intelLevel > 0) {
      nextIntel = 0;
    } else if (nextStrength < 40 && relation.intelLevel > 1) {
      nextIntel = 1;
    } else if (nextStrength < 70 && relation.intelLevel > 2) {
      nextIntel = 2;
    }

    return {
      ...relation,
      spyNetworkStrength: nextStrength,
      intelLevel: nextIntel,
    };
  }

  private getBaseChance(type: string): number {
    switch (type) {
      case "MILITARY_INTEL_HEIST":
        return 55;
      case "INSTIGATE_UNREST":
        return 40;
      case "SABOTAGE_INDUSTRY":
        return 35;
      default:
        return 30;
    }
  }
}
