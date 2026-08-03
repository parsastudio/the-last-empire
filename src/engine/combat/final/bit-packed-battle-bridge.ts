import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export class BitPackedBattleBridge {
  private facade = new BitPackedStateFacade();

  public bridgeConquest(
    state: GameState,
    attackerNationId: string,
    defenderNationId: string,
    conqueredAreaSqKm: number,
  ): GameState {
    if (conqueredAreaSqKm <= 0) return state;

    const canonicalAttacker =
      NationIdResolver.resolveCanonicalId(attackerNationId);
    const canonicalDefender =
      NationIdResolver.resolveCanonicalId(defenderNationId);

    const attackerNum = parseInt(canonicalAttacker.replace("NATION_", ""), 10);
    const defenderNum = parseInt(canonicalDefender.replace("NATION_", ""), 10);

    if (isNaN(attackerNum) || isNaN(defenderNum)) {
      return state;
    }

    this.facade.conquerAndRefreshed(
      attackerNum,
      defenderNum,
      conqueredAreaSqKm,
    );

    return this.facade.syncGameState(state);
  }
}
