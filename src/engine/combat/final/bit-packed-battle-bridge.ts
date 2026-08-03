import { GameState } from "@/domain/game/game-state.schema";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export class BitPackedBattleBridge {
  private facade = new BitPackedStateFacade();

  public conquerAndGetActualArea(
    attackerNationId: string,
    defenderNationId: string,
    conqueredAreaSqKm: number,
  ): number {
    if (conqueredAreaSqKm <= 0) return 0;

    const canonicalAttacker =
      NationIdResolver.resolveCanonicalId(attackerNationId);
    const canonicalDefender =
      NationIdResolver.resolveCanonicalId(defenderNationId);

    const attackerNum = parseInt(canonicalAttacker.replace("NATION_", ""), 10);
    const defenderNum = parseInt(canonicalDefender.replace("NATION_", ""), 10);

    if (isNaN(attackerNum) || isNaN(defenderNum)) {
      return 0;
    }

    return this.facade.conquerAndRefreshed(
      attackerNum,
      defenderNum,
      conqueredAreaSqKm,
    );
  }

  public syncGameState(state: GameState): GameState {
    return this.facade.syncGameState(state);
  }
}
