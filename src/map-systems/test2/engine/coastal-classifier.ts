import { getPointToSegmentDistance } from "./geometry-utils";

export const LANDLOCKED_COUNTRIES = new Set([
  "MNG", "KAZ", "UZB", "TKM", "TJK", "KGZ", "AFG", "NPL", "BTN", "LAO", "ARM", "AZE",
  "CHE", "AUT", "HUN", "SVK", "CZE", "BLR", "BOL", "PRY", "ETH", "SSD", "TCD", "NER",
  "MLI", "RWA", "BDI", "UGA", "MWI", "ZMB", "ZWE", "BWA", "LSO", "SWZ", "AND", "LUX", "MDA"
]);

export interface CountryCoastalEdge {
  p1: [number, number];
  p2: [number, number];
}

export function classifyCoastalRegion(
  mid: [number, number],
  countryCode: string,
  originalCoastalEdges: CountryCoastalEdge[],
): boolean {
  if (LANDLOCKED_COUNTRIES.has(countryCode)) {
    return false;
  }

  let matchesCoast = false;
  for (const cEdge of originalCoastalEdges) {
    if (getPointToSegmentDistance(mid, cEdge.p1, cEdge.p2) < 0.005) {
      matchesCoast = true;
      break;
    }
  }

  if (matchesCoast) {
    const isCaspianEdge =
      mid[0] >= 45.0 && mid[0] <= 56.0 && mid[1] >= 35.5 && mid[1] <= 48.0;

    return !isCaspianEdge;
  }

  return false;
}
