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
  landDistField: Float32Array;
}

export interface TacticalTerrainOptions {
  enableHillshading: boolean;
  enableBathymetryContours: boolean;
  enableCoastalVignette: boolean;
  enableTacticalGraticule: boolean;
  sunAzimuthDegrees: number;
  sunAltitudeDegrees: number;
  reliefExaggeration: number;
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
