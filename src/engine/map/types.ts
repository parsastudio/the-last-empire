import { Province } from "@/domain/map/province.schema";

export interface GeoJsonFeature {
  type: string;
  id?: string;
  properties: {
    ISO_A3?: string;
    iso_a3?: string;
    adm0_a3?: string;
    NAME?: string;
    name?: string;
    POP_EST?: number;
    pop_est?: number;
    GDP_MD?: number;
    gdp_md?: number;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

export interface VectorProvince {
  id: string;
  countryCode: string;
  name: string;
  pathData: string;
}

export interface GeneratedVectorMapPayload {
  provinces: Record<string, Province>;
  vectorProvinces: VectorProvince[];
}
