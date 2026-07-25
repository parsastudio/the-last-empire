import { GridCell } from "@/domain/map/grid-cell.schema";
import { BattleValidator } from "@/engine/combat/validation/battle-validator";

export function runBattleValidatorTest(): boolean {
  const validator = new BattleValidator();
  const mockCells: GridCell[] = [
    {
      x: 0,
      y: 0,
      ownerId: "USA",
      isOccupied: false,
      occupierId: null,
      highResPixelCount: 600,
      enclaveId: 0,
    },
  ];
  const target = { x: 0, y: 0 };
  const isValid = validator.validateAttackOpportunity("USA", target, mockCells);
  return isValid;
}
