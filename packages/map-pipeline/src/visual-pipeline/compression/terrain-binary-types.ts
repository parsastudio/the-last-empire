export interface TerrainColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface RawPalettedTerrain {
  palette: TerrainColorRGB[];
  rawIndexedGrid: Uint8Array;
}
