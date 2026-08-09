export interface ProvinceClusterInfo {
  provinceId: number;
  countryNumericId: number;
  pixelCount: number;
  hasSeaAccess: boolean;
  centerCoordinates: { x: number; y: number };
  landNeighbors: Set<number>;
}
