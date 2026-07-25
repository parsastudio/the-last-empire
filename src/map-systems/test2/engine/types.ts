export interface InputFeature {
  type: "Feature";
  id?: string | number;
  properties?: {
    adm0_a3?: string | number;
    ISO_A3?: string | number;
    iso_a3?: string | number;
    name?: string;
    NAME?: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface SubdividedRegion {
  id: string;
  countryCode: string;
  countryName: string;
  polygons: [number, number][][];
  neighbors: string[];
  isCoastal: boolean;
  area: number;
  center: [number, number];
}

export interface GridBox {
  box: [number, number, number, number];
  clippedPolygons: [number, number][][];
  area: number;
}

export interface GeoJsonData {
  type: string;
  features: InputFeature[];
}
