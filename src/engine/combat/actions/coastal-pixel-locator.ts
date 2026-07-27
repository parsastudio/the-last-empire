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
    const cellMap = new Map<string, GridCell>();
    allCells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

    for (const cell of defenderCells) {
      const neighbors = [
        { x: cell.x + 1, y: cell.y },
        { x: cell.x - 1, y: cell.y },
        { x: cell.x, y: cell.y + 1 },
        { x: cell.x, y: cell.y - 1 },
      ];
      let isCoastal = false;
      for (const n of neighbors) {
        const nCell = cellMap.get(`${n.x},${n.y}`);
        if (
          nCell &&
          (nCell.ownerId === "WATER" || nCell.ownerId === "CLOSED_SEA")
        ) {
          isCoastal = true;
          break;
        }
      }
      if (isCoastal) {
        coastalCells.push(cell);
      }
    }

    if (coastalCells.length === 0) {
      let closestCell = defenderCells[0]!;
      let minDist = Infinity;
      for (const cell of defenderCells) {
        const dist = Math.hypot(
          cell.x - clickedPixel.x,
          cell.y - clickedPixel.y,
        );
        if (dist < minDist) {
          minDist = dist;
          closestCell = cell;
        }
      }
      return { x: closestCell.x, y: closestCell.y };
    }

    let closestCoastal = coastalCells[0]!;
    let minDist = Infinity;
    for (const cell of coastalCells) {
      const dist = Math.hypot(cell.x - clickedPixel.x, cell.y - clickedPixel.y);
      if (dist < minDist) {
        minDist = dist;
        closestCoastal = cell;
      }
    }

    return { x: closestCoastal.x, y: closestCoastal.y };
  }
}
