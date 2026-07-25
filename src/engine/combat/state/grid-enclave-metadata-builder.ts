import { EnclaveMeta } from "@/domain/nation/enclave.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridEnclaveMetadataBuilder {
  public buildMetadata(
    enclaveId: number,
    countryId: string,
    enclaveCells: GridCell[],
  ): EnclaveMeta {
    let sumX = 0;
    let sumY = 0;

    enclaveCells.forEach((c) => {
      sumX += c.x;
      sumY += c.y;
    });

    const count = enclaveCells.length || 1;

    return {
      enclaveId,
      originalCountryId: countryId,
      originalName: `${countryId} Region ${enclaveId}`,
      centerCoordinate: {
        x: Math.floor(sumX / count),
        y: Math.floor(sumY / count),
      },
    };
  }
}
