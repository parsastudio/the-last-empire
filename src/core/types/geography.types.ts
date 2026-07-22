export interface Geography {
  landNeighbors: string[];
  seaNeighbors: string[];
  hasSeaAccess: boolean;
  territorySize: number;
  infrastructureLevel: number;
}
