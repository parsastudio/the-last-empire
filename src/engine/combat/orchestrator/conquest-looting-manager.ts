import { Nation } from "@/domain/nation/nation.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { TreasuryLootingCalculator } from "@/engine/combat/state/treasury-looting-calculator";

export class ConquestLootingManager {
  private calculator = new TreasuryLootingCalculator();

  public executeLooting(
    attacker: Nation,
    defender: Nation,
    conquered: GridCell[],
    allCells: GridCell[],
  ): {
    lootedAmount: number;
    updatedAttacker: Nation;
    updatedDefender: Nation;
  } {
    const lootedAmount = this.calculator.calculateLoot(
      defender,
      conquered,
      allCells,
    );

    const updatedAttacker: Nation = {
      ...attacker,
      treasury: attacker.treasury + lootedAmount,
    };

    const updatedDefender: Nation = {
      ...defender,
      treasury: Math.max(0, defender.treasury - lootedAmount),
    };

    return {
      lootedAmount,
      updatedAttacker,
      updatedDefender,
    };
  }
}
