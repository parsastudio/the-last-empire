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

    const scaledClickedX =
      clickedPixel.x >= 1024 ? Math.floor(clickedPixel.x / 4) : clickedPixel.x;
    const scaledClickedY =
      clickedPixel.y >= 512 ? Math.floor(clickedPixel.y / 4) : clickedPixel.y;

    let closestCell = defenderCells[0]!;
    let minDist = Infinity;

    for (let i = 0; i < defenderCells.length; i++) {
      const cell = defenderCells[i]!;
      const dist = Math.hypot(cell.x - scaledClickedX, cell.y - scaledClickedY);
      if (dist < minDist) {
        minDist = dist;
        closestCell = cell;
      }
    }

    return { x: closestCell.x, y: closestCell.y };
  }
}
