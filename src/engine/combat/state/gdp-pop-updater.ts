import { Nation } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class GdpPopUpdater {
  public syncGlobalStats(
    nations: Record<string, Nation>,
    allCells: GridCell[],
  ): Record<string, Nation> {
    const updated = { ...nations };

    const totalGdpMap = new Map<string, number>();
    const totalPopMap = new Map<string, number>();

    for (const cell of allCells) {
      const activeOwner =
        cell.isOccupied && cell.occupierId ? cell.occupierId : cell.ownerId;
      const gdpContrib = cell.highResPixelCount * 250000;
      const popContrib = cell.highResPixelCount * 5000;

      totalGdpMap.set(
        activeOwner,
        (totalGdpMap.get(activeOwner) || 0) + gdpContrib,
      );
      totalPopMap.set(
        activeOwner,
        (totalPopMap.get(activeOwner) || 0) + popContrib,
      );
    }

    for (const [id, nation] of Object.entries(updated)) {
      const finalGdp = totalGdpMap.get(id) || 0;
      const finalPop = totalPopMap.get(id) || 0;

      updated[id] = {
        ...nation,
        gdp: finalGdp,
        population: finalPop,
        isAlive: finalPop > 0,
      };
    }

    return updated;
  }
}
