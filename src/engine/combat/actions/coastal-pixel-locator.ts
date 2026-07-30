import { GridCell } from "@/domain/map/grid-cell.schema";

export class CoastalPixelLocator {
  public locateClosest(
    targetNationId: string,
    clickedPixel: { x: number; y: number },
    allCells: GridCell[],
  ): { x: number; y: number } {
    const defenderCells: GridCell[] = [];
    for (let i = 0; i < allCells.length; i++) {
      if (allCells[i]!.ownerId === targetNationId) {
        defenderCells.push(allCells[i]!);
      }
    }

    if (defenderCells.length === 0) {
      return clickedPixel;
    }

    let closestCell = defenderCells[0]!;
    let minDist = Infinity;

    for (let i = 0; i < defenderCells.length; i++) {
      const cell = defenderCells[i]!;
      const dist = Math.hypot(cell.x - clickedPixel.x, cell.y - clickedPixel.y);
      if (dist < minDist) {
        minDist = dist;
        closestCell = cell;
      }
    }

    return { x: closestCell.x, y: closestCell.y };
  }
}
