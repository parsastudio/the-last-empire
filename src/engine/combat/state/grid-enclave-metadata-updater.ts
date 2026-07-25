import { EnclaveMeta } from "@/domain/nation/enclave.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { GridEnclaveMetadataBuilder } from "@/engine/combat/state/grid-enclave-metadata-builder";

export class GridEnclaveMetadataUpdater {
  private builder = new GridEnclaveMetadataBuilder();

  public updateEnclavesMetadata(
    countryId: string,
    allCells: GridCell[],
  ): EnclaveMeta[] {
    const countryCells = allCells.filter(
      (c) => c.ownerId === countryId && c.enclaveId > 0,
    );
    const enclaveIds = Array.from(
      new Set(countryCells.map((c) => c.enclaveId)),
    );

    return enclaveIds.map((id) => {
      const enclaveCells = countryCells.filter((c) => c.enclaveId === id);
      return this.builder.buildMetadata(id, countryId, enclaveCells);
    });
  }
}
