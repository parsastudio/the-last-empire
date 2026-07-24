import { STATIC_ADJACENCY_LIST } from "./map-data.config";

export interface AbstractProvince {
  id: string;
  name: string;
  countryCode: string;
  x: number;
  y: number;
  isCoastal: boolean;
  isOccupied: boolean;
  neighbors: string[];
}

export function generateProvinces(
  countryCode: string,
  name: string,
  centerX: number,
  centerY: number,
  hasSeaAccess: boolean,
  numProvinces = 5,
): AbstractProvince[] {
  const provinces: AbstractProvince[] = [];
  const isCoastalCount = hasSeaAccess
    ? Math.max(1, Math.floor(numProvinces * 0.4))
    : 0;

  provinces.push({
    id: `${countryCode}_P1`,
    name: `${name} - Capital Region`,
    countryCode,
    x: centerX,
    y: centerY,
    isCoastal: hasSeaAccess && isCoastalCount > 0,
    isOccupied: false,
    neighbors: [],
  });

  const outerCount = numProvinces - 1;
  if (outerCount > 0) {
    for (let i = 0; i < outerCount; i++) {
      const angle = (i * 2 * Math.PI) / outerCount;
      const radius = 40 + (i % 2) * 10;
      const px = centerX + Math.cos(angle) * radius;
      const py = centerY + Math.sin(angle) * radius;

      provinces.push({
        id: `${countryCode}_P${i + 2}`,
        name: `${name} - Sector ${i + 1}`,
        countryCode,
        x: px,
        y: py,
        isCoastal: i < isCoastalCount - 1,
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

    for (let i = 0; i < outerCount; i++) {
      const current = provinces[i + 1];
      const nextIdx = ((i + 1) % outerCount) + 1;
      const next = provinces[nextIdx];
      if (current && next) {
        current.neighbors.push(next.id);
        next.neighbors.push(current.id);
      }
    }
  }

  return provinces;
}

export function linkCountryProvinces(
  allProvinces: Record<string, AbstractProvince[]>,
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
      let closestA: AbstractProvince | null = null;
      let closestB: AbstractProvince | null = null;

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

export function executeProvinceAttack(
  targetCountryCode: string,
  allProvinces: Record<string, AbstractProvince[]>,
  attackerCountryCode?: string,
): { newlyConqueredProvIds: string[] } {
  const targetProvs = allProvinces[targetCountryCode];
  if (!targetProvs || targetProvs.length === 0) {
    return { newlyConqueredProvIds: [] };
  }

  const defenderTotal = targetProvs.length;
  const targetCount = Math.max(1, Math.floor(defenderTotal * 0.25));

  let startProvince: AbstractProvince | null = null;

  if (attackerCountryCode) {
    const attackerAdjacency =
      STATIC_ADJACENCY_LIST[`${attackerCountryCode}_P1`] || [];
    const hasLandBorder = attackerAdjacency.some((id) =>
      id.startsWith(targetCountryCode),
    );

    if (hasLandBorder) {
      const attackerCapital = allProvinces[attackerCountryCode]?.[0];
      if (attackerCapital) {
        let minDistance = Infinity;
        for (const p of targetProvs) {
          if (!p.isOccupied) {
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
        (p) => p.isCoastal && !p.isOccupied,
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
            }
          }
        }
      }
    }
  }

  if (!startProvince) {
    const unOccupied = targetProvs.filter((p) => !p.isOccupied);
    startProvince = unOccupied[0] || null;
  }

  if (!startProvince) {
    return { newlyConqueredProvIds: [] };
  }

  const newlyConqueredProvIds: string[] = [];
  const queue: AbstractProvince[] = [startProvince];
  const visited = new Set<string>([startProvince.id]);

  while (queue.length > 0 && newlyConqueredProvIds.length < targetCount) {
    const current = queue.shift();
    if (!current) continue;

    current.isOccupied = true;
    newlyConqueredProvIds.push(current.id);

    for (const neighborId of current.neighbors) {
      if (
        neighborId.startsWith(targetCountryCode) &&
        !visited.has(neighborId)
      ) {
        const neighbor = targetProvs.find((p) => p.id === neighborId);
        if (neighbor && !neighbor.isOccupied) {
          visited.add(neighborId);
          queue.push(neighbor);
        }
      }
    }
  }

  return { newlyConqueredProvIds };
}
