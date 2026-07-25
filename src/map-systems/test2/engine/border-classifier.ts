import { getDistance } from "./geometry-utils";
import { CountryCoastalEdge } from "./coastal-classifier";

export interface CountryData {
  code: string;
  name: string;
  polygons: [number, number][][];
  area: number;
  originalEdges: {
    p1: [number, number];
    p2: [number, number];
    mid: [number, number];
  }[];
  originalCoastalEdges: CountryCoastalEdge[];
}

export function classifyCountryBorders(countries: CountryData[]): void {
  countries.forEach((c1) => {
    c1.originalEdges.forEach((e1) => {
      let isLandBorder = false;
      for (const c2 of countries) {
        if (c1.code !== c2.code) {
          for (const e2 of c2.originalEdges) {
            if (getDistance(e1.mid, e2.mid) < 0.05) {
              isLandBorder = true;
              break;
            }
          }
        }
        if (isLandBorder) break;
      }
      if (!isLandBorder) {
        c1.originalCoastalEdges.push({ p1: e1.p1, p2: e1.p2 });
      }
    });
  });
}
