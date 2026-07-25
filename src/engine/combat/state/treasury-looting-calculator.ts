import { Nation } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class TreasuryLootingCalculator {
  public calculateLoot(
    defender: Nation,
    conqueredCells: GridCell[],
    allCells: GridCell[],
  ): number {
    const defenderCells = allCells.filter((c) => c.ownerId === defender.id);
    const totalDefenderPixels = defenderCells.reduce(
      (sum, c) => sum + c.highResPixelCount,
      0,
    );

    if (totalDefenderPixels === 0) {
      return 0;
    }

    const conqueredPixels = conqueredCells.reduce(
      (sum, c) => sum + c.highResPixelCount,
      0,
    );
    const ratio = conqueredPixels / totalDefenderPixels;

    const lootedTreasury = Math.floor(defender.treasury * ratio * 0.25);
    return Math.max(0, lootedTreasury);
  }
}
