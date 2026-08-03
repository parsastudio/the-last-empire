import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export class BitPackedActionAdapter {
  private facade = new BitPackedStateFacade();

  public executeAction(state: GameState, action: GameAction): GameState {
    if (action.type !== "INITIATE_BATTLE") {
      return state;
    }

    const attackerNum = NationIdResolver.resolveNumericId(action.nationId);
    const defenderNum = NationIdResolver.resolveNumericId(
      action.targetNationId,
    );

    if (attackerNum === 0 || defenderNum === 0) {
      return state;
    }

    const capturedAreaSqKm = this.facade.conquerAndRefreshed(
      attackerNum,
      defenderNum,
      120000,
    );

    if (capturedAreaSqKm > 0) {
      return this.facade.syncGameState(state);
    }

    return state;
  }
}
