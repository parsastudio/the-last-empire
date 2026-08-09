import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { WavefrontConquestEngine } from "@/engine/combat/final/wavefront-conquest-engine";
import { FrontierBitManager } from "@/engine/combat/final/frontier-bit-manager";
import { BitPackedEnclaveClusterer } from "@/engine/combat/final/bit-packed-enclave-clusterer";
import { BitPackedSyncEngine } from "@/engine/combat/final/bit-packed-sync-engine";
import { BitPackedHoverInspector } from "@/engine/combat/final/bit-packed-hover-inspector";

export interface FacadeConquestResult {
  capturedPixelsCount: number;
  updatedNations: Record<string, GameState["nations"][string]>;
}

export class BitPackedStateFacade {
  private gridState = BitPackedGridState.getInstance();
  private conquestEngine = new WavefrontConquestEngine();
  private frontierManager = new FrontierBitManager();
  private clusterer = new BitPackedEnclaveClusterer();
  private syncEngine = new BitPackedSyncEngine();
  private hoverInspector = new BitPackedHoverInspector();

  public conquerAndSync(
    state: GameState,
    attackerNumericId: number,
    defenderNumericId: number,
    targetPixelsCount: number,
    attackerStringId: string,
    defenderStringId: string,
    targetEnclaveId?: number,
  ): FacadeConquestResult {
    const buffer = this.gridState.getBuffer();
    const result = this.conquestEngine.conquerTerritory(
      buffer,
      attackerNumericId,
      defenderNumericId,
      targetPixelsCount,
      targetEnclaveId,
    );

    let updatedNations = { ...state.nations };

    if (result.capturedPixelsCount > 0) {
      this.frontierManager.updateModifiedFrontiers(
        buffer,
        this.gridState.getModifiedIndices(),
      );

      this.clusterer.clusterTargetNations(
        buffer,
        [attackerNumericId, defenderNumericId],
        buffer.getWidth(),
        buffer.getHeight(),
      );

      updatedNations = this.syncEngine.syncTargetNations(
        [attackerStringId, defenderStringId],
        state.nations,
        buffer,
      );
    }

    return {
      capturedPixelsCount: result.capturedPixelsCount,
      updatedNations,
    };
  }

  public inspectCoordinates(mapX: number, mapY: number) {
    return this.hoverInspector.inspect(this.gridState.getBuffer(), mapX, mapY);
  }
}
