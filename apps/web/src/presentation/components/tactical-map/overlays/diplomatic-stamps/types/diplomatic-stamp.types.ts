export type DiplomaticStampVariant =
  | "PLAYER"
  | "WAR"
  | "STRATEGIC_PARTNERSHIP"
  | "NON_AGGRESSION_PACT"
  | "SECURITY_GUARANTEE"
  | "NEUTRAL";

export interface DiplomaticStampItem {
  id: string;
  nationId: string;
  nationName: string;
  flagCode: string;
  variant: DiplomaticStampVariant;
  worldX: number;
  worldY: number;
  territoryPixels: number;
  effectiveRadius: number;
  minZoomScale: number;
  rank: number;
  isSuperpower: boolean;
}
