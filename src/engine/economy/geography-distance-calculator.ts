import type { Nation } from "@/domain/nation/nation.schema";

export class GeographyDistanceCalculator {
  public calculateDistance(
    originId: string,
    originTargetId: string,
    allNations: Record<string, Nation>,
  ): number {
    if (originId === originTargetId) {
      return 0;
    }

    const originNation = allNations[originId];
    const targetNation = allNations[originTargetId];

    if (originNation && targetNation) {
      const originCoords = this.getAllCoordinates(originNation);
      const targetCoords = this.getAllCoordinates(targetNation);

      if (originCoords.length > 0 && targetCoords.length > 0) {
        let minDistance = Infinity;
        for (const p1 of originCoords) {
          for (const p2 of targetCoords) {
            const dist = Math.sqrt(
              Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2),
            );
            if (dist < minDistance) {
              minDistance = dist;
            }
          }
        }
        if (minDistance !== Infinity) {
          return Math.max(1, Math.min(6, Math.floor(minDistance / 50)));
        }
      }
    }

    const queue: [string, number][] = [[originId, 0]];
    const visited = new Set<string>([originId]);

    while (queue.length > 0) {
      const [currentId, distance] = queue.shift()!;
      if (currentId === originTargetId) {
        return distance;
      }

      const currentNation = allNations[currentId];
      if (!currentNation) {
        continue;
      }

      const pocketTargetIds = currentNation.geography.isolatedPockets.flatMap(
        (p) => p.territoryIds,
      );

      const pocketNeighbors = pocketTargetIds.flatMap((id) => {
        const targetNation = allNations[id];
        if (!targetNation) {
          return [];
        }
        return [
          ...targetNation.geography.landNeighbors,
          ...targetNation.geography.seaNeighbors,
        ];
      });

      const neighbors = [
        ...currentNation.geography.landNeighbors,
        ...currentNation.geography.seaNeighbors,
        ...pocketNeighbors,
      ];

      const uniqueNeighbors = Array.from(new Set(neighbors));

      for (const neighborId of uniqueNeighbors) {
        if (!visited.has(neighborId)) {
          const relation = currentNation.relations[neighborId];
          const hasAccess =
            neighborId === originTargetId ||
            relation?.militaryAccess === true ||
            relation?.stance === "ALLIANCE" ||
            currentId === originId;

          if (hasAccess) {
            visited.add(neighborId);
            queue.push([neighborId, distance + 1]);
          }
        }
      }
    }

    if (
      originNation?.geography.hasSeaAccess &&
      targetNation?.geography.hasSeaAccess
    ) {
      return 6;
    }

    return 15;
  }

  private getAllCoordinates(nation: Nation): { x: number; y: number }[] {
    const coords: { x: number; y: number }[] = [];
    if (nation.geography.coordinates) {
      coords.push(...nation.geography.coordinates);
    }
    for (const pocket of nation.geography.isolatedPockets) {
      if (pocket.coordinates) {
        coords.push(...pocket.coordinates);
      }
    }
    return coords;
  }
}
