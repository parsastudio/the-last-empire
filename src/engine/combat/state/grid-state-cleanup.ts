import { GridCell } from "@/domain/map/grid-cell.schema";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";

export class GridStateCleanup {
  public cleanupEnclaveRegistry(
    allCells: GridCell[],
    countryId: string,
    registry: EnclaveRegistry,
  ): void {
    const activeEnclaves = new Set<number>();

    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i]!;
      if (cell.ownerId === countryId && cell.enclaveId > 0) {
        activeEnclaves.add(cell.enclaveId);
      }
    }

    for (let id = 1; id <= 10; id++) {
      if (!activeEnclaves.has(id)) {
        const meta = registry.resolveEnclaveMeta(countryId, id);
        if (meta) {
          for (let i = 0; i < allCells.length; i++) {
            const c = allCells[i]!;
            if (c.ownerId === countryId && c.enclaveId === id) {
              c.enclaveId = 0;
            }
          }
        }
      }
    }
  }
}
