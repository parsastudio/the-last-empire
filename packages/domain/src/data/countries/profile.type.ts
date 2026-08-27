import { GovernmentType } from "@/domain/politics/politics.schema";

export interface CountryProfile {
  code: string;
  nameEn: string;
  nameFa: string;
  gdp: number;
  population: number;
  flagCode: string;
  domesticTechLevel: number;
  equipmentTechLevel: number;
  startingGovernment?: GovernmentType;
  startingTechLevel?: number;
  militaryTier?: number;
}
