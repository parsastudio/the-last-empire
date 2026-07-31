import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateCleanup {
  public cleanupEnclaves(countryCells: GridCell[]): void {
    if (!countryCells || countryCells.length === 0) return;

    const activeEnclaves = new Set<number>();

    for (let i = 0; i < countryCells.length; i++) {
      const cell = countryCells[i]!;
      if (cell.enclaveId > 0) {
        activeEnclaves.add(cell.enclaveId);
      }
    }

    for (let id = 1; id <= 10; id++) {
      if (!activeEnclaves.has(id)) {
        for (let i = 0; i < countryCells.length; i++) {
          const c = countryCells[i]!;
          if (c.enclaveId === id) {
            c.enclaveId = 0;
          }
        }
      }
    }
  }
}
