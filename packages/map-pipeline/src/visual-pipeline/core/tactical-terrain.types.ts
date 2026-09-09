export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface TerrainProcessingContext {
  width: number;
  height: number;
  landMask: Uint8Array;
  oceanDistField: Float32Array;
}

export interface TacticalTerrainOptions {
  enableCoastalVignette: boolean;
  enableTacticalGraticule: boolean;
}

export interface TacticalTerrainStats {
  width: number;
  height: number;
  totalPixels: number;
  landPixels: number;
  oceanPixels: number;
  outputSizeBytes: number;
  executionTimeMs: number;
}
