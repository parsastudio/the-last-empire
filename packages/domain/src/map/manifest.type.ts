export interface FinalManifestProvince {
  provinceId: number;
  nameFa: string;
  countryId: string;
  originalCountryId?: string;
  pixelCount: number;
  hasSeaAccess: boolean;
  landNeighbors: number[];
  maritimeNeighborsTier1?: number[];
  maritimeNeighborsTier2?: number[];
  centerCoordinates: { x: number; y: number };
  population: number;
  perCapitaProductivity: number;
  maxPopulationCapacity: number;
}

export interface FinalManifestNation {
  id: string;
  code: string;
  flagCode: string;
  nameFa: string;
  nameEn: string;
  gdp: number;
  perCapitaProductivity: number;
  population: number;
  maxPopulationCapacity: number;
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
  startingNavalFleet?: number;
  startingTechLevel: number;
  industrialLevel: number;
  startingStability: number;
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
