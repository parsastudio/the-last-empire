import { NationTrait } from "@/domain/nation/nation.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";

export interface CountryProfile {
  id?: number;
  code: string;
  nameEn: string;
  nameFa: string;
  gdp: number;
  population: number;
  traits: NationTrait[];
  flagCode: string;
  startingInfantry?: number;
  startingAirForce?: number;
  startingDroneMissile?: number;
  startingTechLevel?: number;
  startingGovernment?: GovernmentType;
}
