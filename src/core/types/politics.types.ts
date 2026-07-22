export interface ElectionProfile {
  lastElectionTurn: number;
  electionInterval: number;
  incumbentWinChance: number;
}

export interface CorruptionProfile {
  level: number;
  taxWastageRate: number;
}

export interface SocialFreedomProfile {
  index: number;
  brainDrainRate: number;
}

export interface RebellionStatus {
  hasRebellionTriggered: boolean;
  rebelInfantryCount: number;
}
