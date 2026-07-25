import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateFactory {
  public createEmptyGrid(width = 1024, height = 512): GridState {
    const gridState = new GridState();

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell: GridCell = {
          x,
          y,
          ownerId: "WATER",
          isOccupied: false,
          occupierId: null,
          highResPixelCount: 0,
          enclaveId: 0,
        };
        gridState.setCell(x, y, cell);
      }
    }

    return gridState;
  }
}
