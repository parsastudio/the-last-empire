import { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentStabilityTraits {
  peaceRecoveryRate: number;
  attackerVictoryBonus: number;
  attackerDefeatPenalty: number;
  defenderLossPenalty: number;
}

const NEUTRAL_TRAITS: GovernmentStabilityTraits = {
  peaceRecoveryRate: 1.0,
  attackerVictoryBonus: 3.0,
  attackerDefeatPenalty: 3.0,
  defenderLossPenalty: 3.0,
};

export const GOVERNMENT_TRAITS_MAP: Record<
  GovernmentType,
  GovernmentStabilityTraits
> = {
  FASCISM: NEUTRAL_TRAITS,
  DICTATORSHIP: NEUTRAL_TRAITS,
  MONARCHY: NEUTRAL_TRAITS,
  COMMUNISM: NEUTRAL_TRAITS,
  DEMOCRACY: NEUTRAL_TRAITS,
};
