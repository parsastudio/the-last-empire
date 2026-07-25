import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateCloner {
  public cloneCells(cells: GridCell[]): GridCell[] {
    return cells.map((cell) => ({
      x: cell.x,
      y: cell.y,
      ownerId: cell.ownerId,
      isOccupied: cell.isOccupied,
      occupierId: cell.occupierId,
      highResPixelCount: cell.highResPixelCount,
      enclaveId: cell.enclaveId,
    }));
  }
}
