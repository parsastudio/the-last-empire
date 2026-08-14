import type { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentTraits {
  stabilityDeltaPerTurn: number;
  militaryPowerMultiplier: number;
}

export class GovernmentSystem {
  public static getTraits(type: GovernmentType): GovernmentTraits {
    switch (type) {
      case "DEMOCRACY":
        return {
          stabilityDeltaPerTurn: 1.0,
          militaryPowerMultiplier: 0.85,
        };
      case "DICTATORSHIP":
        return {
          stabilityDeltaPerTurn: -1.0,
          militaryPowerMultiplier: 1.2,
        };
      case "MONARCHY":
        return {
          stabilityDeltaPerTurn: 0.5,
          militaryPowerMultiplier: 1.0,
        };
      case "COMMUNISM":
        return {
          stabilityDeltaPerTurn: 0.0,
          militaryPowerMultiplier: 1.0,
        };
      case "FASCISM":
        return {
          stabilityDeltaPerTurn: -1.5,
          militaryPowerMultiplier: 1.35,
        };
      default:
        return {
          stabilityDeltaPerTurn: 0.0,
          militaryPowerMultiplier: 1.0,
        };
    }
  }
}
