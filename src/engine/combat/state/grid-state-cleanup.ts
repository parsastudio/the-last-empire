import { GridCell } from "@/domain/map/grid-cell.schema";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";

export class GridStateCleanup {
  public cleanupEnclaveRegistry(
    countryCells: GridCell[],
    countryId: string,
    registry: EnclaveRegistry,
  ): void {
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
        const meta = registry.resolveEnclaveMeta(countryId, id);
        if (meta) {
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
}
