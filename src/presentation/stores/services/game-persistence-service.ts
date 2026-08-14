import { GameState } from "@/domain/game/game-state.schema";
import { GameStorageAdapter } from "@/infrastructure/storage/game-storage.adapter";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { ProvincePixelCalculator } from "@/engine/map/province-pixel-calculator";

export class GamePersistenceService {
  private static storageAdapter = new GameStorageAdapter();

  public static async loadGameState(gameId: string): Promise<GameState | null> {
    const state = await this.storageAdapter.loadGameState(gameId);
    if (!state) return null;

    const buffer = BitPackedGridState.getInstance().getBuffer();
    const syncedProvinces = ProvincePixelCalculator.syncProvincesMapPixelCounts(
      buffer,
      state.provinces,
    );

    return {
      ...state,
      provinces: syncedProvinces,
    };
  }

  public static async saveGameState(
    gameId: string,
    state: GameState,
  ): Promise<void> {
    await this.storageAdapter.saveGameState(gameId, state);
  }
}
