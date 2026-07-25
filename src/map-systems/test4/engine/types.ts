export interface CountryPhase1 {
  code: string;
  name: string;
  rings: [number, number][][];
  area: number;
}

export interface IslandPhase2 {
  id: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number][];
  area: number;
  center: [number, number];
}

export interface RegionPhase3 {
  id: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number][];
  area: number;
  center: [number, number];
  neighbors: string[];
}

export interface ApiResponse {
  success: boolean;
  phase1: CountryPhase1[];
  phase2: IslandPhase2[];
  phase3: RegionPhase3[];
  phase4: RegionPhase3[];
  error?: string;
}

export interface IsolatedPolygon {
  id: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number][];
  area: number;
  center: [number, number];
}

export interface GridBox {
  box: [number, number, number, number];
  clippedPolygons: [number, number][][];
  area: number;
}
