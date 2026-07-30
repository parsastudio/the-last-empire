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

    let totalAreaSqKm = 0;
    for (let i = 0; i < attackerCells.length; i++) {
      const c = attackerCells[i]!;
      if (c.ownerId === countryId && c.enclaveId === enclaveId) {
        totalAreaSqKm += c.highResPixelCount * 86.3;
      }
    }

    return this.filter.isEligibleAsBase(totalAreaSqKm);
  }
}
