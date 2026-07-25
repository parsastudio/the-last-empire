import { GridCell } from "@/domain/map/grid-cell.schema";
import { BaseSizeFilter } from "@/engine/combat/filters/base-size-filter";

export class AttackOriginValidator {
  private filter = new BaseSizeFilter();

  public isValidOrigin(
    originCell: GridCell,
    attackerCells: GridCell[],
  ): boolean {
    const enclaveId = originCell.enclaveId;
    const countryId = originCell.ownerId;

    const contiguousCells = attackerCells.filter(
      (c) => c.ownerId === countryId && c.enclaveId === enclaveId,
    );

    const totalAreaSqKm = contiguousCells.reduce(
      (sum, c) => sum + c.highResPixelCount * 86.3,
      0,
    );

    return this.filter.isEligibleAsBase(totalAreaSqKm);
  }
}
