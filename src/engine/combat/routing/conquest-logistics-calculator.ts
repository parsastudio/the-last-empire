import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";

export class ConquestLogisticsCalculator {
  private readonly baseTransportRate = 120;
  private readonly enclaveDiscount = 0.3;
  private readonly intercontinentalSurcharge = 3.0;

  public calculateLogistics(
    origin: GridCell,
    target: Coordinate,
    enclaveRegistry: EnclaveRegistry,
  ): {
    distance: number;
    finalCost: number;
    isEnclave: boolean;
    enclaveName: string | null;
  } {
    const distance = Math.hypot(origin.x - target.x, origin.y - target.y);
    let costMultiplier = 1.0;
    let isEnclave = false;
    let enclaveName: string | null = null;

    if (origin.enclaveId > 0) {
      isEnclave = true;
      costMultiplier -= this.enclaveDiscount;
      const meta = enclaveRegistry.resolveEnclaveMeta(
        origin.ownerId,
        origin.enclaveId,
      );
      if (meta) {
        enclaveName = meta.originalName;
      }
    } else if (distance > 200) {
      costMultiplier += this.intercontinentalSurcharge;
    }

    const finalCost = Math.floor(
      distance * this.baseTransportRate * costMultiplier,
    );

    return {
      distance,
      finalCost,
      isEnclave,
      enclaveName,
    };
  }
}
