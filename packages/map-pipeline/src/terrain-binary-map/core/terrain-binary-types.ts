export interface TerrainColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface BuiltTerrainSpans {
  palette: TerrainColorRGB[];
  rawIndexedGrid: Uint8Array;
  rowOffsets: Uint32Array;
  packedSpans: Uint32Array;
  minSpansPerRow: number;
  maxSpansPerRow: number;
  totalSpans: number;
}

export interface TerrainBinaryBuildStats {
  pngSizeBytes: number;
  rawBinarySizeBytes: number;
  compressedBinarySizeBytes: number;
  rawSavingsPercent: number;
  compressedSavingsPercent: number;
  totalPaletteColors: number;
  totalSpansCount: number;
  avgSpansPerRow: number;
  totalPixelsVerified: number;
  mismatchCount: number;
  isLosslessMatch: boolean;
}
