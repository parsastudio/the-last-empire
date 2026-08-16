import type { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentStabilityTraits {
  peaceRecoveryRate: number;
  attackerVictoryBonus: number;
  attackerDefeatPenalty: number;
  defenderLossPenalty: number;
  blockadePenalty: number;
  militaryPowerMultiplier: number;
}

export class GovernmentSystem {
  public static getTraits(type: GovernmentType): GovernmentStabilityTraits {
    switch (type) {
      case "FASCISM":
        return {
          peaceRecoveryRate: 0.4,
          attackerVictoryBonus: 6.0,
          attackerDefeatPenalty: 5.0,
          defenderLossPenalty: 6.0,
          blockadePenalty: 0.5,
          militaryPowerMultiplier: 1.35,
        };
      case "DICTATORSHIP":
        return {
          peaceRecoveryRate: 0.6,
          attackerVictoryBonus: 4.0,
          attackerDefeatPenalty: 4.0,
          defenderLossPenalty: 5.0,
          blockadePenalty: 0.8,
          militaryPowerMultiplier: 1.2,
        };
      case "MONARCHY":
        return {
          peaceRecoveryRate: 1.0,
          attackerVictoryBonus: 3.0,
          attackerDefeatPenalty: 3.0,
          defenderLossPenalty: 4.0,
          blockadePenalty: 1.0,
          militaryPowerMultiplier: 1.0,
        };
      case "COMMUNISM":
        return {
          peaceRecoveryRate: 0.8,
          attackerVictoryBonus: 3.0,
          attackerDefeatPenalty: 2.5,
          defenderLossPenalty: 3.5,
          blockadePenalty: 0.8,
          militaryPowerMultiplier: 1.0,
        };
      case "DEMOCRACY":
      default:
        return {
          peaceRecoveryRate: 1.5,
          attackerVictoryBonus: 2.5,
          attackerDefeatPenalty: 2.5,
          defenderLossPenalty: 3.5,
          blockadePenalty: 1.5,
          militaryPowerMultiplier: 0.85,
        };
    }
  }
}
