import { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentStabilityTraits {
  peaceRecoveryRate: number;
  attackerVictoryBonus: number;
  attackerDefeatPenalty: number;
  defenderLossPenalty: number;
  blockadePenalty: number;
  militaryPowerMultiplier: number;
}

export const GOVERNMENT_TRAITS_MAP: Record<
  GovernmentType,
  GovernmentStabilityTraits
> = {
  FASCISM: {
    peaceRecoveryRate: 0.3,
    attackerVictoryBonus: 4.5,
    attackerDefeatPenalty: 5.0,
    defenderLossPenalty: 5.0,
    blockadePenalty: 0.0,
    militaryPowerMultiplier: 1.25,
  },
  DICTATORSHIP: {
    peaceRecoveryRate: 0.6,
    attackerVictoryBonus: 4.0,
    attackerDefeatPenalty: 3.5,
    defenderLossPenalty: 4.5,
    blockadePenalty: 0.0,
    militaryPowerMultiplier: 1.15,
  },
  MONARCHY: {
    peaceRecoveryRate: 1.1,
    attackerVictoryBonus: 3.0,
    attackerDefeatPenalty: 3.0,
    defenderLossPenalty: 3.0,
    blockadePenalty: 0.0,
    militaryPowerMultiplier: 1.0,
  },
  COMMUNISM: {
    peaceRecoveryRate: 0.8,
    attackerVictoryBonus: 3.5,
    attackerDefeatPenalty: 1.5,
    defenderLossPenalty: 2.5,
    blockadePenalty: 0.0,
    militaryPowerMultiplier: 1.05,
  },
  DEMOCRACY: {
    peaceRecoveryRate: 1.6,
    attackerVictoryBonus: 2.0,
    attackerDefeatPenalty: 3.0,
    defenderLossPenalty: 3.5,
    blockadePenalty: 0.0,
    militaryPowerMultiplier: 0.85,
  },
};
