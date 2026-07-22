export type GovernmentType =
  | "DEMOCRACY"
  | "DICTATORSHIP"
  | "MONARCHY"
  | "COMMUNISM"
  | "FASCISM";

export interface GovernmentState {
  type: GovernmentType;
  stability: number;
  corruption: number;
  socialFreedom: number;
  turnsInPower: number;
  lastElectionTurn?: number;
}
