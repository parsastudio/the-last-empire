export type DiplomaticStance =
  | "PEACE"
  | "WAR"
  | "ALLIANCE"
  | "NON_AGGRESSION_PACT"
  | "DEFENSIVE_PACT"
  | "EMBARGO";

export type DiplomaticProposalType =
  | "PEACE_TREATY"
  | "NON_AGGRESSION_PACT"
  | "DEFENSIVE_PACT"
  | "FULL_ALLIANCE"
  | "MILITARY_ACCESS"
  | "IMPROVE_RELATIONS"
  | "DEMAND_TRIBUTE"
  | "LIFT_EMBARGO";

export interface RelationProfile {
  targetNationId: string;
  stance: DiplomaticStance;
  opinion: number;
  tributePerTurn: number;
  militaryAccess: boolean;
  embargoActive: boolean;
  treatyTurnsRemaining: number;
}
