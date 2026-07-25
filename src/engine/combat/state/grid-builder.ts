import { GridCell } from "@/domain/map/grid-cell.schema";
import { MajorityVote } from "@/engine/combat/math/majority-vote";

export class GridBuilder {
  private voter = new MajorityVote();

  public buildGridCell(
    gx: number,
    gy: number,
    highResCountryIds: string[],
    highResEnclaveIds: number[],
  ): GridCell {
    const { ownerId } = this.voter.resolvePrimaryOwner(highResCountryIds);
    const enclaveId = this.voter.resolvePrimaryEnclave(highResEnclaveIds);

    return {
      x: gx,
      y: gy,
      ownerId,
      isOccupied: false,
      occupierId: null,
      highResPixelCount: highResCountryIds.length,
      enclaveId,
    };
  }
}
