import { GridCell } from "@/domain/map/grid-cell.schema";
import { CapitulationEngine } from "@/engine/combat/capitulation/capitulation-engine";

export class GridConquestProcessor {
  private capitulation = new CapitulationEngine();

  public applyConquest(
    attackerId: string,
    targetId: string,
    conquered: GridCell[],
    allCells: GridCell[],
  ): {
    conqueredCount: number;
    capitulatedCount: number;
  } {
    for (const cell of conquered) {
      cell.isOccupied = true;
      cell.occupierId = attackerId;
    }

    const caps = this.capitulation.processCapitulation(
      targetId,
      attackerId,
      allCells,
    );

    return {
      conqueredCount: conquered.length,
      capitulatedCount: caps.length,
    };
  }
}
