import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { BattleValidator } from "@/engine/combat/validation/battle-validator";
import { ClosestBaseFinder } from "@/engine/combat/routing/closest-base-finder";
import { ConquestLogisticsCalculator } from "@/engine/combat/routing/conquest-logistics-calculator";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";
import { BattleValidationResult } from "@/engine/combat/validation/battle-validation-result.schema";

export class BattleValidationFacade {
  private validator = new BattleValidator();
  private baseFinder = new ClosestBaseFinder();
  private calculator = new ConquestLogisticsCalculator();
  private registry = new EnclaveRegistry();

  public validateAttackForUI(
    attackerId: string,
    targetPixel: Coordinate,
    gridState: GridState,
  ): BattleValidationResult {
    const allCells = gridState.getAllCells();
    const isValid = this.validator.validateAttackOpportunity(
      attackerId,
      targetPixel,
      allCells,
    );
    const closestBase = this.baseFinder.findClosestBase(
      attackerId,
      targetPixel,
      allCells,
    );

    if (!closestBase) {
      return {
        isValid: false,
        errorMessage:
          "No accessible military bases found to launch this invasion",
        closestBaseCoordinate: null,
        distance: 0,
        logisticsCost: 0,
        surchargeMultiplier: 1.0,
        enclaveOriginalName: null,
      };
    }

    const logistics = this.calculator.calculateLogistics(
      closestBase,
      targetPixel,
      this.registry,
    );

    return {
      isValid,
      errorMessage: isValid
        ? null
        : "Target region is out of reach or origin base is too small",
      closestBaseCoordinate: { x: closestBase.x, y: closestBase.y },
      distance: logistics.distance,
      logisticsCost: logistics.finalCost,
      surchargeMultiplier: logistics.isEnclave ? 0.7 : 1.0,
      enclaveOriginalName: logistics.enclaveName,
    };
  }
}
