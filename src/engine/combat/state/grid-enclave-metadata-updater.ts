import { EnclaveMeta } from "@/domain/nation/enclave.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridEnclaveMetadataUpdater {
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
      let sumX = 0;
      let sumY = 0;

      enclaveCells.forEach((c) => {
        sumX += c.x;
        sumY += c.y;
      });

      const count = enclaveCells.length || 1;

      return {
        enclaveId: id,
        originalCountryId: countryId,
        originalName: `${countryId} Region ${id}`,
        centerCoordinate: {
          x: Math.floor(sumX / count),
          y: Math.floor(sumY / count),
        },
      };
    });
  }
}
