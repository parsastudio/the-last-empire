import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridEnclaveLookup {
  public findEnclaveCells(
    countryId: string,
    enclaveId: number,
    allCells: GridCell[],
  ): GridCell[] {
    return allCells.filter(
      (c) => c.ownerId === countryId && c.enclaveId === enclaveId,
    );
  }
}
