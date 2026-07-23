import type { Nation } from "@/modules/nation/schemas/nation.schema";

export class GeographyDistanceCalculator {
  public calculateDistance(
    originId: string,
    targetId: string,
    allNations: Record<string, Nation>,
  ): number {
    if (originId === targetId) {
      return 0;
    }

    const queue: [string, number][] = [[originId, 0]];
    const visited = new Set<string>([originId]);

    while (queue.length > 0) {
      const [currentId, distance] = queue.shift()!;
      if (currentId === targetId) {
        return distance;
      }

      const currentNation = allNations[currentId];
      if (!currentNation) {
        continue;
      }

      const neighbors = [
        ...currentNation.geography.landNeighbors,
        ...currentNation.geography.seaNeighbors,
      ];

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          queue.push([neighborId, distance + 1]);
        }
      }
    }

    return 5;
  }
}
