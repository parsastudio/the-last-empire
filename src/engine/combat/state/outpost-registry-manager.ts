import { GridCell } from "@/domain/map/grid-cell.schema";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";
import { EnclaveInitializer } from "@/engine/combat/registry/enclave-initializer";

export class OutpostRegistryManager {
  private initializer = new EnclaveInitializer();

  public refreshRegistry(
    allCells: GridCell[],
    registry: EnclaveRegistry,
  ): void {
    this.initializer.initializeEnclaves(allCells, registry);
  }
}
