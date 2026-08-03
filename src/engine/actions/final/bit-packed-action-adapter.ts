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

    const canonicalAttacker = NationIdResolver.resolveCanonicalId(
      action.nationId,
    );
    const canonicalDefender = NationIdResolver.resolveCanonicalId(
      action.targetNationId,
    );

    const attackerNum = parseInt(canonicalAttacker.replace("NATION_", ""), 10);
    const defenderNum = parseInt(canonicalDefender.replace("NATION_", ""), 10);

    if (isNaN(attackerNum) || isNaN(defenderNum)) {
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
