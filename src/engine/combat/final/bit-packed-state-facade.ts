import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { WavefrontConquestEngine } from "@/engine/combat/final/wavefront-conquest-engine";
import { FrontierBitManager } from "@/engine/combat/final/frontier-bit-manager";
import { BitPackedHoverInspector } from "@/engine/combat/final/bit-packed-hover-inspector";
import { BitPackedSyncEngine } from "@/engine/combat/final/bit-packed-sync-engine";
import { GameState } from "@/domain/game/game-state.schema";

export class BitPackedStateFacade {
  private gridState = BitPackedGridState.getInstance();
  private conquestEngine = new WavefrontConquestEngine();
  private frontierManager = new FrontierBitManager();
  private hoverInspector = new BitPackedHoverInspector();
  private syncEngine = new BitPackedSyncEngine();

  public conquerAndRefreshed(
    attackerNationId: number,
    defenderNationId: number,
    targetPixelsCount: number,
  ): number {
    const buffer = this.gridState.getBuffer();
    const result = this.conquestEngine.conquerTerritory(
      buffer,
      attackerNationId,
      defenderNationId,
      targetPixelsCount,
    );

    if (result.capturedPixelsCount > 0) {
      this.frontierManager.updateModifiedFrontiers(
        buffer,
        this.gridState.getModifiedIndices(),
      );
    }

    return result.capturedPixelsCount;
  }

  public inspectCoordinates(mapX: number, mapY: number) {
    return this.hoverInspector.inspect(this.gridState.getBuffer(), mapX, mapY);
  }

  public syncGameState(gameState: GameState): GameState {
    return gameState;
  }
}
