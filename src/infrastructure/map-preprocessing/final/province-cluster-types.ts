export interface LandComponent {
  id: number;
  pixelIndices: number[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
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

export interface GroupProvinceAllocation {
  group: ArchipelagoGroup;
  provinceCount: number;
}
