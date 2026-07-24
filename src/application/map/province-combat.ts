import { Province } from "@/domain/map/province.schema";
import { COUNTRY_POLYGONS_CACHE } from "@/engine/map/grid-generator";
import { computeAdjacencyList } from "@/engine/map/utils/adjacency-calculator";

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
