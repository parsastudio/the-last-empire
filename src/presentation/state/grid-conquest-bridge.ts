import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridState } from "@/engine/combat/state/grid-state";
import { ConquestMapAdapter } from "@/application/map/conquest-map-adapter";
import { EnclaveRegistry } from "@/engine/combat/registry/enclave-registry";
import { CombatLogistics } from "@/domain/combat/logistics.schema";

export class GridConquestBridge {
  private adapter = new ConquestMapAdapter();
  private registry = new EnclaveRegistry();

  public getTacticalLogistics(
    attackerId: string,
    target: Coordinate,
    gridState: GridState,
  ): CombatLogistics | null {
    return this.adapter.getLogisticsForUIPlick(
      attackerId,
      target,
      gridState,
      this.registry,
    );
  }
}
