import { Province } from "@/domain/map/province.schema";
import { STATIC_ADJACENCY_LIST } from "./map-data.config";

export function generateProvinces(
  countryCode: string,
  name: string,
  centerX: number,
  centerY: number,
  hasSeaAccess: boolean,
  numProvinces = 5,
): Province[] {
  const provinces: Province[] = [];
  const isCoastalCount = hasSeaAccess
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
        ownerNationId: countryCode,
        gdp: 0,
        population: 0,
        isCapital: false,
        territorySize: 10,
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
    const hasSeaAccess = [
      "USA",
      "CAN",
      "RUS",
      "CHN",
      "IRN",
      "SAU",
      "DEU",
      "IRQ",
      "MYS",
      "MAR",
      "DZA",
    ].includes(countryCode);
    const center = { x: prov.x, y: prov.y };
    const countryArea = prov.territorySize;
    const provinceShare =
      totalArea > 0 ? Math.round((countryArea / totalArea) * 1000) : 5;
    const numProvinces = Math.max(4, Math.min(60, provinceShare));

    const list = generateProvinces(
      countryCode,
      prov.name.replace(" Region", ""),
      center.x,
      center.y,
      hasSeaAccess,
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

  linkCountryProvinces(tempProvsMap, STATIC_ADJACENCY_LIST);

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
    const attackerAdjacency =
      STATIC_ADJACENCY_LIST[`${attackerCountryCode}_P1`] || [];
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
