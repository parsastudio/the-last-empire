export interface RowSpansBuildStats {
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatioPercent: number;
  totalSpansCount: number;
  minSpansPerRow: number;
  maxSpansPerRow: number;
  avgSpansPerRow: number;
  totalRows: number;
}

export interface BuiltRowSpans {
  rowOffsets: Uint32Array;
  packedSpans: Uint32Array;
  minSpansPerRow: number;
  maxSpansPerRow: number;
  totalSpans: number;
}
