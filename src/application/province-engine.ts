import { Province } from "@/domain/map/province.schema";
import { COUNTRY_POLYGONS_CACHE } from "@/engine/map/grid-generator";
import { setStaticAdjacencyList } from "./map-data.config";

interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function getBoundingBox(polygons: [number, number][][]): Box {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const poly of polygons) {
    for (const pt of poly) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[1] > maxY) maxY = pt[1];
    }
  }
  return { minX, maxX, minY, maxY };
}

function isPointInPolygon(
  point: [number, number],
  vs: [number, number][],
): boolean {
  const x = point[0],
    y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0],
      yi = vs[i][1];
    const xj = vs[j][0],
      yj = vs[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function isPointInCountry(
  point: [number, number],
  polygons: [number, number][][],
): boolean {
  return polygons.some((poly) => isPointInPolygon(point, poly));
}

function checkSeaAccessAndGetCoastalPoints(
  codeA: string,
  polygonsCache: Record<string, [number, number][][]>,
): { hasSeaAccess: boolean; coastalVertices: [number, number][] } {
  const polyA = polygonsCache[codeA];
  if (!polyA) return { hasSeaAccess: false, coastalVertices: [] };
  const coastalVertices: [number, number][] = [];
  const keys = Object.keys(polygonsCache).filter((k) => k !== codeA);

  for (const pA of polyA) {
    for (let i = 0; i < pA.length; i += 5) {
      const ptA = pA[i]!;
      let minDistanceToAnyOther = Infinity;

      for (const codeB of keys) {
        const polyB = polygonsCache[codeB]!;
        const boxB = getBoundingBox(polyB);
        if (
          ptA[0] - 30 > boxB.maxX ||
          boxB.minX - 30 > ptA[0] ||
          ptA[1] - 30 > boxB.maxY ||
          boxB.minY - 30 > ptA[1]
        ) {
          continue;
        }
        for (const pB of polyB) {
          for (let j = 0; j < pB.length; j += 10) {
            const ptB = pB[j]!;
            const dist = Math.hypot(ptA[0] - ptB[0], ptA[1] - ptB[1]);
            if (dist < minDistanceToAnyOther) {
              minDistanceToAnyOther = dist;
            }
          }
        }
      }

      if (minDistanceToAnyOther > 25) {
        coastalVertices.push(ptA);
      }
    }
  }

  return {
    hasSeaAccess: coastalVertices.length > 0,
    coastalVertices,
  };
}

function computeAdjacencyList(
  polygonsCache: Record<string, [number, number][][]>,
): Record<string, string[]> {
  const adjacency: Record<string, string[]> = {};
  const keys = Object.keys(polygonsCache);
  for (const key of keys) {
    adjacency[`${key}_P1`] = [];
  }
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const codeA = keys[i]!;
      const codeB = keys[j]!;
      if (areCountriesAdjacent(polygonsCache[codeA]!, polygonsCache[codeB]!)) {
        adjacency[`${codeA}_P1`].push(`${codeB}_P1`);
        adjacency[`${codeB}_P1`].push(`${codeA}_P1`);
      }
    }
  }
  return adjacency;
}

function areCountriesAdjacent(
  polyA: [number, number][][],
  polyB: [number, number][][],
): boolean {
  const boxA = getBoundingBox(polyA);
  const boxB = getBoundingBox(polyB);
  if (
    boxA.minX - 15 > boxB.maxX ||
    boxB.minX - 15 > boxA.maxX ||
    boxA.minY - 15 > boxB.maxY ||
    boxB.minY - 15 > boxA.maxY
  ) {
    return false;
  }
  const threshold = 15;
  for (const pA of polyA) {
    for (let i = 0; i < pA.length; i += 3) {
      const ptA = pA[i]!;
      for (const pB of polyB) {
        for (let j = 0; j < pB.length; j += 3) {
          const ptB = pB[j]!;
          const dist = Math.hypot(ptA[0] - ptB[0], ptA[1] - ptB[1]);
          if (dist < threshold) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function generateProvinces(
  countryCode: string,
  name: string,
  centerX: number,
  centerY: number,
  hasSeaAccess: boolean,
  numProvinces = 5,
): Province[] {
  const provinces: Province[] = [];
  const polygons = COUNTRY_POLYGONS_CACHE[countryCode] || [];

  let capitalX = centerX;
  let capitalY = centerY;

  if (polygons.length > 0 && !isPointInCountry([centerX, centerY], polygons)) {
    let closestPt: [number, number] | null = null;
    let minDist = Infinity;
    for (const poly of polygons) {
      for (const pt of poly) {
        const dist = Math.hypot(pt[0] - centerX, pt[1] - centerY);
        if (dist < minDist) {
          minDist = dist;
          closestPt = pt;
        }
      }
    }
    if (closestPt) {
      capitalX = closestPt[0];
      capitalY = closestPt[1];
    }
  }

  const sampledPoints: [number, number][] = [[capitalX, capitalY]];

  if (polygons.length > 0 && numProvinces > 1) {
    const box = getBoundingBox(polygons);
    const w = box.maxX - box.minX;
    const h = box.maxY - box.minY;
    const minAllowedDist = Math.max(
      5,
      (Math.min(w, h) / Math.sqrt(numProvinces)) * 0.7,
    );

    for (let i = 1; i < numProvinces; i++) {
      let bestPt: [number, number] | null = null;
      let maxMinDist = -1;

      for (let attempt = 0; attempt < 800; attempt++) {
        const rx = box.minX + Math.random() * w;
        const ry = box.minY + Math.random() * h;
        if (isPointInCountry([rx, ry], polygons)) {
          let d = Infinity;
          for (const spt of sampledPoints) {
            const dist = Math.hypot(spt[0] - rx, spt[1] - ry);
            if (dist < d) d = dist;
          }
          if (d > minAllowedDist) {
            bestPt = [rx, ry];
            break;
          }
          if (d > maxMinDist) {
            maxMinDist = d;
            bestPt = [rx, ry];
          }
        }
      }

      if (bestPt) {
        sampledPoints.push(bestPt);
      } else {
        const angle = (i * 2 * Math.PI) / (numProvinces - 1);
        const r = Math.min(w, h) * 0.25;
        sampledPoints.push([
          capitalX + Math.cos(angle) * r,
          capitalY + Math.sin(angle) * r,
        ]);
      }
    }
  }

  const seaDetails = checkSeaAccessAndGetCoastalPoints(
    countryCode,
    COUNTRY_POLYGONS_CACHE,
  );
  const isCoastalCount = seaDetails.hasSeaAccess
    ? Math.max(1, Math.floor(numProvinces * 0.4))
    : 0;

  provinces.push({
    id: `${countryCode}_P1`,
    name: `${name} - Capital Region`,
    ownerNationId: countryCode,
    gdp: 0,
    population: 0,
    isCapital: true,
    territorySize: 10,
    x: sampledPoints[0]![0],
    y: sampledPoints[0]![1],
    isCoastal: seaDetails.hasSeaAccess && isCoastalCount > 0,
    isOccupied: false,
    neighbors: [],
  });

  for (let i = 1; i < numProvinces; i++) {
    const pt = sampledPoints[i]!;
    let isProvCoastal = false;
    if (seaDetails.hasSeaAccess) {
      let isNearSea = false;
      for (const cv of seaDetails.coastalVertices) {
        if (Math.hypot(cv[0] - pt[0], cv[1] - pt[1]) < 35) {
          isNearSea = true;
          break;
        }
      }
      isProvCoastal = isNearSea;
    }

    provinces.push({
      id: `${countryCode}_P${i + 1}`,
      name: `${name} - Sector ${i}`,
      ownerNationId: countryCode,
      gdp: 0,
      population: 0,
      isCapital: false,
      territorySize: 10,
      x: pt[0],
      y: pt[1],
      isCoastal: isProvCoastal,
      isOccupied: false,
      neighbors: [],
    });
  }

  const capital = provinces[0];
  if (capital) {
    for (let i = 1; i < numProvinces; i++) {
      const p = provinces[i];
      if (p) {
        capital.neighbors.push(p.id);
        p.neighbors.push(capital.id);
      }
    }
  }

  for (let i = 1; i < numProvinces; i++) {
    const current = provinces[i];
    if (!current) continue;
    let closestNeighbor: Province | null = null;
    let minDist = Infinity;
    for (let j = 1; j < numProvinces; j++) {
      if (i === j) continue;
      const other = provinces[j];
      if (other) {
        const dist = Math.hypot(current.x - other.x, current.y - other.y);
        if (dist < minDist) {
          minDist = dist;
          closestNeighbor = other;
        }
      }
    }
    if (closestNeighbor) {
      if (!current.neighbors.includes(closestNeighbor.id)) {
        current.neighbors.push(closestNeighbor.id);
      }
      if (!closestNeighbor.neighbors.includes(current.id)) {
        closestNeighbor.neighbors.push(current.id);
      }
    }
  }

  return provinces;
}

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

export function executeProvinceAttack(
  targetCountryCode: string,
  allProvinces: Record<string, Province[]>,
  attackerCountryCode?: string,
): {
  newlyConqueredProvIds: string[];
  attackerSourceId?: string;
  defenderEntryId?: string;
} {
  const targetProvs = allProvinces[targetCountryCode];
  if (!targetProvs || targetProvs.length === 0) {
    return { newlyConqueredProvIds: [] };
  }

  const defenderTotal = targetProvs.length;
  const targetCount = Math.max(1, Math.floor(defenderTotal * 0.25));

  let startProvince: Province | null = null;
  let attackerSourceId: string | undefined;

  if (attackerCountryCode) {
    const dynamicAdjacency = computeAdjacencyList(COUNTRY_POLYGONS_CACHE);
    const attackerAdjacency =
      dynamicAdjacency[`${attackerCountryCode}_P1`] || [];
    const hasLandBorder = attackerAdjacency.some((id) =>
      id.startsWith(targetCountryCode),
    );

    if (hasLandBorder) {
      const attackerCapital = allProvinces[attackerCountryCode]?.[0];
      if (attackerCapital) {
        attackerSourceId = attackerCapital.id;
        let minDistance = Infinity;
        for (const p of targetProvs) {
          const isOccupied = p.ownerNationId === attackerCountryCode;
          if (!isOccupied) {
            const dist = Math.sqrt(
              Math.pow(p.x - attackerCapital.x, 2) +
                Math.pow(p.y - attackerCapital.y, 2),
            );
            if (dist < minDistance) {
              minDistance = dist;
              startProvince = p;
            }
          }
        }
      }
    } else {
      const attackerCoastal =
        allProvinces[attackerCountryCode]?.filter((p) => p.isCoastal) || [];
      const defenderCoastal = targetProvs.filter(
        (p) => p.isCoastal && p.ownerNationId !== attackerCountryCode,
      );

      if (attackerCoastal.length > 0 && defenderCoastal.length > 0) {
        let minDistance = Infinity;
        for (const a of attackerCoastal) {
          for (const d of defenderCoastal) {
            const dist = Math.sqrt(
              Math.pow(d.x - a.x, 2) + Math.pow(d.y - a.y, 2),
            );
            if (dist < minDistance) {
              minDistance = dist;
              startProvince = d;
              attackerSourceId = a.id;
            }
          }
        }
      }
    }
  }

  if (!startProvince) {
    const unOccupied = targetProvs.filter(
      (p) => p.ownerNationId !== attackerCountryCode,
    );
    startProvince = unOccupied[0] || null;
  }

  if (!startProvince) {
    return { newlyConqueredProvIds: [] };
  }

  const newlyConqueredProvIds: string[] = [];
  const queue: Province[] = [startProvince];
  const visited = new Set<string>([startProvince.id]);

  while (queue.length > 0 && newlyConqueredProvIds.length < targetCount) {
    const current = queue.shift();
    if (!current) continue;

    newlyConqueredProvIds.push(current.id);

    for (const neighborId of current.neighbors) {
      if (
        neighborId.startsWith(targetCountryCode) &&
        !visited.has(neighborId)
      ) {
        const neighbor = targetProvs.find((p) => p.id === neighborId);
        if (neighbor && neighbor.ownerNationId !== attackerCountryCode) {
          visited.add(neighborId);
          queue.push(neighbor);
        }
      }
    }
  }

  return {
    newlyConqueredProvIds,
    attackerSourceId,
    defenderEntryId: startProvince.id,
  };
}
