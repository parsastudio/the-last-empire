import { GovernmentType } from "@/domain/politics/politics.schema";
import { AiDoctrineType } from "@/domain/nation/nation-doctrine.schema";

export interface CountryProfile {
  code: string;
  gdp: number;
  population: number;
  flagCode: string;
  domesticTechLevel: number;
  equipmentTechLevel: number;
  industrialLevel: number;
  startingGovernment?: GovernmentType;
  startingTechLevel?: number;
  aiDoctrine?: AiDoctrineType;
}
