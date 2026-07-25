import { GridState } from "@/engine/combat/state/grid-state";
import { Coordinate } from "@/domain/map/coordinate.schema";
import { ClosestBaseFinder } from "@/engine/combat/routing/closest-base-finder";
import { ConquestLogisticsCalculator } from "@/engine/combat/routing/conquest-logistics-calculator";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";
import { CombatLogistics } from "@/domain/combat/logistics.schema";

export class ConquestMapAdapter {
  private baseFinder = new ClosestBaseFinder();
  private calculator = new ConquestLogisticsCalculator();

  public getLogisticsForUIPlick(
    attackerId: string,
    targetPixel: Coordinate,
    gridState: GridState,
    enclaveRegistry: EnclaveRegistry,
  ): CombatLogistics | null {
    const allCells = gridState.getAllCells();
    const closestBase = this.baseFinder.findClosestBase(
      attackerId,
      targetPixel,
      allCells,
    );

    if (!closestBase) {
      return null;
    }

    const result = this.calculator.calculateLogistics(
      closestBase,
      targetPixel,
      enclaveRegistry,
    );

    return {
      origin: { x: closestBase.x, y: closestBase.y },
      target: targetPixel,
      distance: result.distance,
      baseCost: 120,
      surchargeMultiplier: result.isEnclave ? 0.7 : 1.0,
      finalCost: result.finalCost,
      enclaveId: closestBase.enclaveId > 0 ? closestBase.enclaveId : null,
      enclaveOriginalName: result.enclaveName,
    };
  }
}
