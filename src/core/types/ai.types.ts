export type AIPersonalityType =
  | "AGGRESSIVE"
  | "PACIFIST"
  | "ECONOMIC"
  | "ISOLATIONIST";

export interface AINeedEvaluation {
  needTreasury: number;
  needMilitary: number;
  needDiplomacy: number;
  needStability: number;
}

export interface AIPersonalityWeights {
  personality: AIPersonalityType;
  aggressionMultiplier: number;
  defenseMultiplier: number;
  economicFocus: number;
  diplomaticFocus: number;
}
