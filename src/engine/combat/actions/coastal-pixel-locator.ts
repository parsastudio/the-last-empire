import { GridCell } from "@/domain/map/grid-cell.schema";

export class CoastalPixelLocator {
  public locateClosest(
    targetNationId: string,
    clickedPixel: { x: number; y: number },
    allCells: GridCell[],
  ): { x: number; y: number } {
    const defenderCells = allCells.filter((c) => c.ownerId === targetNationId);
    if (defenderCells.length === 0) {
      return clickedPixel;
    }

    const coastalCells: GridCell[] = [];

    for (let i = 0; i < defenderCells.length; i++) {
      const cell = defenderCells[i]!;
      const isCoastal = allCells.some(
        (n) =>
          Math.abs(n.x - cell.x) + Math.abs(n.y - cell.y) === 1 &&
          (n.ownerId === "WATER" || n.ownerId === "CLOSED_SEA"),
      );

      if (isCoastal) {
        coastalCells.push(cell);
      }
    }

    const candidates = coastalCells.length > 0 ? coastalCells : defenderCells;
    let closestCell = candidates[0]!;
    let minDist = Infinity;

    for (let i = 0; i < candidates.length; i++) {
      const cell = candidates[i]!;
      const dist = Math.hypot(cell.x - clickedPixel.x, cell.y - clickedPixel.y);
      if (dist < minDist) {
        minDist = dist;
        closestCell = cell;
      }
    }

    return { x: closestCell.x, y: closestCell.y };
  }
}
