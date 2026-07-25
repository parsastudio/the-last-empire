import { GridCell } from "@/domain/map/grid-cell.schema";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";

export class GridStateCleanup {
  public cleanupEnclaveRegistry(
    allCells: GridCell[],
    countryId: string,
    registry: EnclaveRegistry,
  ): void {
    const activeEnclaves = new Set<number>();

    for (const cell of allCells) {
      if (cell.ownerId === countryId && cell.enclaveId > 0) {
        activeEnclaves.add(cell.enclaveId);
      }
    }

    const registryList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    for (const id of registryList) {
      if (!activeEnclaves.has(id)) {
        const meta = registry.resolveEnclaveMeta(countryId, id);
        if (meta) {
          allCells.forEach((c) => {
            if (c.ownerId === countryId && c.enclaveId === id) {
              c.enclaveId = 0;
            }
          });
        }
      }
    }
  }
}
