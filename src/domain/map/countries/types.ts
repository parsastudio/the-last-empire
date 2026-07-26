import { NationTrait } from "@/domain/nation/nation.schema";

export interface CountryProfile {
  id: number;
  code: string;
  nameEn: string;
  nameFa: string;
  gdp: number;
  population: number;
  areaSqKm: number;
  traits: NationTrait[];
  flagCode: string;
  startingTreasury: number;
}
