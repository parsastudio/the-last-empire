export interface RowSpansMapHeader {
  magic: number;
  version: number;
  width: number;
  height: number;
  totalRows: number;
  totalSpans: number;
  headerByteSize: number;
}

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
