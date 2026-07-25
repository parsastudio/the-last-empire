import { BattleValidationResult } from "@/engine/combat/validation/battle-validation-result.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";

export class BattleValidationResultFactory {
  public createValidResult(
    closestBase: Coordinate,
    distance: number,
    cost: number,
    surcharge: number,
    enclaveName: string | null,
  ): BattleValidationResult {
    return {
      isValid: true,
      errorMessage: null,
      closestBaseCoordinate: closestBase,
      distance,
      logisticsCost: cost,
      surchargeMultiplier: surcharge,
      enclaveOriginalName: enclaveName,
    };
  }

  public createInvalidResult(errorMessage: string): BattleValidationResult {
    return {
      isValid: false,
      errorMessage,
      closestBaseCoordinate: null,
      distance: 0,
      logisticsCost: 0,
      surchargeMultiplier: 1.0,
      enclaveOriginalName: null,
    };
  }
}
