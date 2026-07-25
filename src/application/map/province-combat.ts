import { Province } from "@/domain/map/province.schema";
import { STATIC_ADJACENCY_LIST } from "@/application/map-data.config";
import { COUNTRY_POLYGONS_CACHE } from "@/map-systems/test1/engine/grid-generator";
import { getBoundingBox } from "@/map-systems/test1/engine/polygon-geometry";

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

  const remainingProvs = targetProvs.filter(
    (p) =>
      (!attackerCountryCode || p.ownerNationId !== attackerCountryCode) &&
      !p.isOccupied,
  );

  if (remainingProvs.length === 0) {
    return { newlyConqueredProvIds: [] };
  }

  const targetCount = Math.max(1, Math.floor(remainingProvs.length * 0.25));

  let startProvince: Province | null = null;
  let attackerSourceId: string | undefined;

  if (attackerCountryCode) {
    let attackerAdjacency =
      STATIC_ADJACENCY_LIST[`${attackerCountryCode}_P1`] || [];

    if (attackerAdjacency.length === 0) {
      const polyA = COUNTRY_POLYGONS_CACHE[attackerCountryCode];
      const polyB = COUNTRY_POLYGONS_CACHE[targetCountryCode];
      if (polyA && polyB) {
        const boxA = getBoundingBox(polyA);
        const boxB = getBoundingBox(polyB);
        const areNear = !(
          boxA.minX - 30 > boxB.maxX ||
          boxB.minX - 30 > boxA.maxX ||
          boxA.minY - 30 > boxB.maxY ||
          boxB.minY - 30 > boxA.maxY
        );
        if (areNear) {
          attackerAdjacency = [`${targetCountryCode}_P1`];
        }
      }
    }

    const hasLandBorder = attackerAdjacency.some((id) =>
      id.startsWith(targetCountryCode),
    );

    if (hasLandBorder) {
      const attackerCapital = allProvinces[attackerCountryCode]?.[0];
      if (attackerCapital) {
        attackerSourceId = attackerCapital.id;
        let minDistance = Infinity;
        for (const p of remainingProvs) {
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
    } else {
      const attackerCoastal =
        allProvinces[attackerCountryCode]?.filter((p) => p.isCoastal) || [];
      const defenderCoastal = remainingProvs.filter((p) => p.isCoastal);

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
    startProvince = remainingProvs[0] || null;
    if (attackerCountryCode) {
      const attackerCapital = allProvinces[attackerCountryCode]?.[0];
      if (attackerCapital) {
        attackerSourceId = attackerCapital.id;
      }
    }
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
