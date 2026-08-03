import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";

export class BitPackedMarketBridge {
  private facade = new BitPackedStateFacade();

  public syncMarketAndPopulationStats(state: GameState): GameState {
    return this.facade.syncGameState(state);
  }
}
