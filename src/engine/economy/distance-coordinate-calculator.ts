import { Nation } from "@/domain/nation/nation.schema";

export class DistanceCoordinateCalculator {
  public calculateMinCoordinateDistance(
    originNation: Nation,
    targetNation: Nation,
  ): number {
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
    return -1;
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
