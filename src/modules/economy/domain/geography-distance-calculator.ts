import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class GeographyDistanceCalculator {
  public calculateDistance(
    originId: string,
    originTargetId: string,
    allNations: Record<string, Nation>,
  ): number {
    if (originId === originTargetId) {
      return 0;
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
          visited.add(neighborId);
          queue.push([neighborId, distance + 1]);
        }
      }
    }

    return 15;
  }
}
