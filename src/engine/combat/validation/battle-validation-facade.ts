import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { BattleValidator } from "@/engine/combat/validation/battle-validator";
import { FastTransitCalculator } from "@/engine/combat/routing/fast-transit-calculator";
import { BattleValidationResult } from "@/domain/game/battle-validation-result.schema";

export class BattleValidationFacade {
  private validator = new BattleValidator();
  private transitCalculator = new FastTransitCalculator();

  public validateAttackForUI(
    attackerId: string,
    targetPixel: Coordinate,
    gridState: GridState,
  ): BattleValidationResult {
    const allCells = gridState.getAllCells();
    const targetCell = gridState.getCell(targetPixel.x, targetPixel.y);
    const targetNationId = targetCell ? targetCell.ownerId : "WATER";

    const isValid = this.validator.validateAttackOpportunity(
      attackerId,
      targetPixel,
      allCells,
    );

    const transit = this.transitCalculator.calculateTransit(
      attackerId,
      targetNationId,
      targetPixel,
      allCells,
    );

    const baseCostPerKm = transit.isLandAttack ? 15 : 45;
    const logisticsCost = Math.floor(transit.distanceInKm * baseCostPerKm);

    return {
      isValid,
      isLandAttack: transit.isLandAttack,
      errorMessage: isValid
        ? null
        : "منطقه هدف خارج از برد ترانزیت پایگاه‌های موجود است.",
      closestBaseCoordinate: transit.originCoordinate,
      distance: transit.distanceInKm,
      logisticsCost,
      surchargeMultiplier: transit.isLandAttack ? 1.0 : 1.5,
      enclaveOriginalName: null,
    };
  }
}
