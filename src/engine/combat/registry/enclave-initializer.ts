import { GridCell } from "@/domain/map/grid-cell.schema";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";
import { EnclaveMeta } from "@/domain/nation/enclave.schema";

export class EnclaveInitializer {
  public initializeEnclaves(
    allCells: GridCell[],
    registry: EnclaveRegistry,
  ): void {
    registry.clear();

    const countryEnclaves = new Map<string, Set<number>>();

    for (const cell of allCells) {
      if (cell.enclaveId > 0) {
        const existing = countryEnclaves.get(cell.ownerId) || new Set<number>();
        existing.add(cell.enclaveId);
        countryEnclaves.set(cell.ownerId, existing);
      }
    }

    for (const [countryId, ids] of countryEnclaves.entries()) {
      for (const enclaveId of ids) {
        const enclaveCells = allCells.filter(
          (c) => c.ownerId === countryId && c.enclaveId === enclaveId,
        );

        const center = this.calculateCenter(enclaveCells);

        const meta: EnclaveMeta = {
          enclaveId,
          originalCountryId: countryId,
          originalName: `${countryId} Colony`,
          centerCoordinate: center,
        };

        registry.registerEnclave(countryId, meta);
      }
    }
  }

  private calculateCenter(cells: GridCell[]): { x: number; y: number } {
    let sumX = 0;
    let sumY = 0;

    for (const c of cells) {
      sumX += c.x;
      sumY += c.y;
    }

    const count = cells.length || 1;

    return {
      x: Math.floor(sumX / count),
      y: Math.floor(sumY / count),
    };
  }
}
