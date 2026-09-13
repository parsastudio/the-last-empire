export interface CoastalShorelinePixel {
  x: number;
  y: number;
  provinceId: number;
}

export interface MaritimeDistancePair {
  targetProvinceId: number;
  distancePixels: number;
}

export interface ProvinceMaritimeResolution {
  provinceId: number;
  countryId: string;
  tier1Neighbors: MaritimeDistancePair[];
  tier2Neighbors: MaritimeDistancePair[];
}

export interface MaritimeEnrichmentStats {
  totalCoastalProvinces: number;
  totalTier1Connections: number;
  totalTier2Connections: number;
  avgTier1PerProvince: number;
  avgTier2PerProvince: number;
  executionTimeMs: number;
  resolutions: ProvinceMaritimeResolution[];
}
