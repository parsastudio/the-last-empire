import { Province } from "@/domain/map/province.schema";
import { COUNTRY_POLYGONS_CACHE } from "@/engine/map/grid-generator";
import {
  checkSeaAccessAndGetCoastalPoints,
  computeAdjacencyList,
} from "@/engine/map/utils/adjacency-calculator";
import { generateProvinces } from "./province-generator";
import { setStaticAdjacencyList } from "../map-data.config";

export function linkCountryProvinces(
  allProvinces: Record<string, Province[]>,
  adjacencyList: Record<string, string[]>,
): void {
  for (const [countryId, neighbors] of Object.entries(adjacencyList)) {
    const countryCode = countryId.replace("_P1", "");
    const countryProvs = allProvinces[countryCode];
    if (!countryProvs || countryProvs.length === 0) continue;

    for (const neighborId of neighbors) {
      const neighborCode = neighborId.replace("_P1", "");
      const neighborProvs = allProvinces[neighborCode];
      if (!neighborProvs || neighborProvs.length === 0) continue;

      let minDistance = Infinity;
      let closestA: Province | null = null;
      let closestB: Province | null = null;

      for (const a of countryProvs) {
        for (const b of neighborProvs) {
          const dist = Math.sqrt(
            Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2),
          );
          if (dist < minDistance) {
            minDistance = dist;
            closestA = a;
            closestB = b;
          }
        }
      }

      if (closestA && closestB) {
        if (!closestA.neighbors.includes(closestB.id)) {
          closestA.neighbors.push(closestB.id);
        }
        if (!closestB.neighbors.includes(closestA.id)) {
          closestB.neighbors.push(closestA.id);
        }
      }
    }
  }
}

export function expandCountryProvinces(
  rawProvinces: Record<string, Province>,
): Record<string, Province> {
  const totalArea = Object.values(rawProvinces).reduce(
    (sum, p) => sum + p.territorySize,
    0,
  );
  const expanded: Record<string, Province> = {};
  const tempProvsMap: Record<string, Province[]> = {};

  for (const [id, prov] of Object.entries(rawProvinces)) {
    const countryCode = id.replace("_P1", "");
    const center = { x: prov.x, y: prov.y };
    const countryArea = prov.territorySize;
    const provinceShare =
      totalArea > 0 ? Math.round((countryArea / totalArea) * 1000) : 5;
    const numProvinces = Math.max(4, Math.min(60, provinceShare));

    const seaDetails = checkSeaAccessAndGetCoastalPoints(
      countryCode,
      COUNTRY_POLYGONS_CACHE,
    );

    const list = generateProvinces(
      countryCode,
      prov.name.replace(" Region", ""),
      center.x,
      center.y,
      seaDetails.hasSeaAccess,
      numProvinces,
    );

    const subGdp = Math.floor(prov.gdp / numProvinces);
    const subPop = Math.floor(prov.population / numProvinces);
    const subSize = Math.max(1, Math.floor(prov.territorySize / numProvinces));

    list.forEach((p) => {
      p.gdp = subGdp;
      p.population = subPop;
      p.territorySize = subSize;
    });

    tempProvsMap[countryCode] = list;
  }

  const dynamicAdjacency = computeAdjacencyList(COUNTRY_POLYGONS_CACHE);
  setStaticAdjacencyList(dynamicAdjacency);

  linkCountryProvinces(tempProvsMap, dynamicAdjacency);

  for (const list of Object.values(tempProvsMap)) {
    for (const p of list) {
      expanded[p.id] = p;
    }
  }

  return expanded;
}
