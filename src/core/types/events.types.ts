import { GameModifier } from "./modifiers.types";

export interface GameEventChoice {
  id: string;
  description: string;
  effects: {
    treasuryDelta?: number;
    stabilityDelta?: number;
    manpowerDelta?: number;
    reputationDelta?: number;
    relationsDelta?: { targetNationId: string; delta: number }[];
    addModifier?: GameModifier;
  };
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  triggerCondition: {
    minStability?: number;
    maxStability?: number;
    isAtWar?: boolean;
    minTreasury?: number;
    maxTreasury?: number;
    specificNationId?: string;
  };
  choices: GameEventChoice[];
}
