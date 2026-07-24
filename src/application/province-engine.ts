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
): AbstractProvince[] {
  const numProvinces =
    countryCode === "CHN"
      ? 12
      : countryCode === "RUS"
        ? 15
        : countryCode === "USA"
          ? 10
          : countryCode === "IRN"
            ? 6
            : countryCode === "IRQ"
              ? 4
              : 5;

  const provinces: AbstractProvince[] = [];
  const isCoastalCount = hasSeaAccess
    ? Math.max(1, Math.floor(numProvinces * 0.4))
    : 0;

  for (let i = 0; i < numProvinces; i++) {
    const angle = (i * 2 * Math.PI) / numProvinces;
    const radius = 30 + (i % 2) * 12;
    const px = centerX + Math.cos(angle) * radius;
    const py = centerY + Math.sin(angle) * radius;

    provinces.push({
      id: `${countryCode}_P${i + 1}`,
      name: `${name} - Region ${i + 1}`,
      countryCode,
      x: px,
      y: py,
      isCoastal: i < isCoastalCount,
      isOccupied: false,
      neighbors: [],
    });
  }

  for (let i = 0; i < numProvinces; i++) {
    const current = provinces[i];
    const next = provinces[(i + 1) % numProvinces];
    if (current && next) {
      current.neighbors.push(next.id);
      next.neighbors.push(current.id);
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
): { newlyConqueredProvIds: string[] } {
  const targetProvs = allProvinces[targetCountryCode];
  if (!targetProvs) return { newlyConqueredProvIds: [] };

  const totalProvincesCount = targetProvs.length;
  const attackQuantity = Math.max(1, Math.floor(totalProvincesCount * 0.25));
  const conqueredIds: string[] = [];

  for (let step = 0; step < attackQuantity; step++) {
    const unOccupied = targetProvs.filter((p) => !p.isOccupied);
    if (unOccupied.length === 0) break;

    const occupiedProvIds = new Set<string>();
    for (const provs of Object.values(allProvinces)) {
      for (const p of provs) {
        if (p.isOccupied) {
          occupiedProvIds.add(p.id);
        }
      }
    }

    let adjacentToIranProvince: AbstractProvince | null = null;
    for (const p of unOccupied) {
      const hasOccupiedNeighbor = p.neighbors.some((nId) =>
        occupiedProvIds.has(nId),
      );
      if (hasOccupiedNeighbor) {
        adjacentToIranProvince = p;
        break;
      }
    }

    if (adjacentToIranProvince) {
      adjacentToIranProvince.isOccupied = true;
      conqueredIds.push(adjacentToIranProvince.id);
      continue;
    }

    const targetCoastal = unOccupied.filter((p) => p.isCoastal);
    const iranCoastal: AbstractProvince[] = [];
    for (const provs of Object.values(allProvinces)) {
      for (const p of provs) {
        if (p.isOccupied && p.isCoastal) {
          iranCoastal.push(p);
        }
      }
    }

    if (targetCoastal.length > 0 && iranCoastal.length > 0) {
      let minDistance = Infinity;
      let bestTarget: AbstractProvince | null = null;

      for (const t of targetCoastal) {
        for (const i of iranCoastal) {
          const dist = Math.sqrt(
            Math.pow(t.x - i.x, 2) + Math.pow(t.y - i.y, 2),
          );
          if (dist < minDistance) {
            minDistance = dist;
            bestTarget = t;
          }
        }
      }

      if (bestTarget) {
        bestTarget.isOccupied = true;
        conqueredIds.push(bestTarget.id);
        continue;
      }
    }

    const fallbackProv = unOccupied[0];
    if (fallbackProv) {
      fallbackProv.isOccupied = true;
      conqueredIds.push(fallbackProv.id);
    }
  }

  return { newlyConqueredProvIds: conqueredIds };
}
