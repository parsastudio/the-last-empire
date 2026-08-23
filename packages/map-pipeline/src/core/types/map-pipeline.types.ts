export interface LandComponent {
  pixelIndices: number[];
  size: number;
  centerX: number;
  centerY: number;
}

export interface ArchipelagoGroup {
  id: number;
  countryNumericId: number;
  components: LandComponent[];
  totalPixels: number;
  centerX: number;
  centerY: number;
}

export interface ProvinceClusterInfo {
  provinceId: number;
  countryNumericId: number;
  pixelCount: number;
  hasSeaAccess: boolean;
  centerCoordinates: { x: number; y: number };
  landNeighbors: Set<number>;
}

export interface MajorLandMass {
  id: number;
  components: LandComponent[];
  totalPixels: number;
}

export interface ProvinceBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}
