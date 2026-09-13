import { AiDoctrineType } from "@/domain/nation/nation-doctrine.schema";

export interface FinalManifestProvince {
  provinceId: number;
  provinceIndex?: number;
  nameFa?: string;
  countryId: string;
  originalCountryId?: string;
  pixelCount: number;
  hasSeaAccess: boolean;
  landNeighbors: number[];
  maritimeNeighborsTier1?: number[];
  maritimeNeighborsTier2?: number[];
  centerCoordinates: { x: number; y: number };
  population: number;
  maxSlots: number;
  factoriesCount: number;
}

export interface FinalManifestNation {
  id: string;
  code: string;
  flagCode: string;
  nameFa?: string;
  nameEn?: string;
  gdp: number;
  population: number;
  territoryPixelCount: number;
  provinceIds: number[];
  hasSeaAccess: boolean;
  startingTreasury: number;
  initialRank: number;
  defaultGovernment: string;
  startingInfantry: number;
  startingArmor?: number;
  startingAirDefense?: number;
  startingAirForce: number;
  startingDroneMissile: number;
  startingTechLevel: number;
  industrialLevel: number;
  equipmentTechLevel?: number;
  startingStability: number;
  aiDoctrine?: AiDoctrineType;
}

export interface FinalMapManifest {
  mapId: string;
  totalProvincesCount: number;
  totalNationsCount: number;
  width: number;
  height: number;
  provinces: FinalManifestProvince[];
  nations: FinalManifestNation[];
}
