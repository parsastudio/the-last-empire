import { getBoundingBox } from "./polygon-geometry";

export function areCountriesAdjacent(
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
      const ptA = pA[i];
      if (!ptA) continue;
      for (const pB of polyB) {
        for (let j = 0; j < pB.length; j += 3) {
          const ptB = pB[j];
          if (!ptB) continue;
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

export function checkSeaAccessAndGetCoastalPoints(
  codeA: string,
  polygonsCache: Record<string, [number, number][][]>,
): { hasSeaAccess: boolean; coastalVertices: [number, number][] } {
  const polyA = polygonsCache[codeA];
  if (!polyA) return { hasSeaAccess: false, coastalVertices: [] };
  const coastalVertices: [number, number][] = [];
  const keys = Object.keys(polygonsCache).filter((k) => k !== codeA);

  for (const pA of polyA) {
    for (let i = 0; i < pA.length; i += 5) {
      const ptA = pA[i];
      if (!ptA) continue;
      let minDistanceToAnyOther = Infinity;

      for (const codeB of keys) {
        const polyB = polygonsCache[codeB];
        if (!polyB) continue;
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
            const ptB = pB[j];
            if (!ptB) continue;
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

export function computeAdjacencyList(
  polygonsCache: Record<string, [number, number][][]>,
): Record<string, string[]> {
  const adjacency: Record<string, string[]> = {};
  const keys = Object.keys(polygonsCache);
  for (const key of keys) {
    adjacency[`${key}_P1`] = [];
  }
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const codeA = keys[i];
      const codeB = keys[j];
      if (codeA && codeB) {
        const polyA = polygonsCache[codeA];
        const polyB = polygonsCache[codeB];
        if (polyA && polyB && areCountriesAdjacent(polyA, polyB)) {
          adjacency[`${codeA}_P1`].push(`${codeB}_P1`);
          adjacency[`${codeB}_P1`].push(`${codeA}_P1`);
        }
      }
    }
  }
  return adjacency;
}
