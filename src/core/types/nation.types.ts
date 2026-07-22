import type { Geography } from "./geography.types";
import type { GovernmentState } from "./government.types";
import type { MilitaryStack, RecruitmentOrder } from "./military.types";
import type { RelationProfile } from "./diplomacy.types";
import type { Resources, UpkeepRates } from "./resources.types";

export interface ActiveModifier {
  id: string;
  name: string;
  effectType: string;
  magnitude: number;
  turnsRemaining: number;
}

export interface Nation {
  id: string;
  name: string;
  isAi: boolean;
  isAlive: boolean;
  flagCode: string;
  gdp: number;
  taxRate: number;
  treasury: number;
  debt: number;
  population: number;
  inflation: number;
  warExhaustion: number;
  reputation: number;
  industrialLevel: number;
  government: GovernmentState;
  resources: Resources;
  upkeep: UpkeepRates;
  military: MilitaryStack;
  recruitmentQueue: RecruitmentOrder[];
  geography: Geography;
  relations: Record<string, RelationProfile>;
  activeModifiers: ActiveModifier[];
}
