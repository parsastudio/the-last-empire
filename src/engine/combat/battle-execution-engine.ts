import { GameState } from "@/domain/game/game-state.schema";
import { InitiateBattleAction } from "@/domain/game/action.schema";
import { BattleCalculator } from "@/engine/combat/battle-calculator";
import { BitPackedBattleBridge } from "@/engine/combat/final/bit-packed-battle-bridge";

export class BattleExecutionEngine {
  private battleBridge = new BitPackedBattleBridge();

  public executeBattle(
    state: GameState,
    action: InitiateBattleAction,
  ): GameState {
    const attacker = state.nations[action.nationId];
    const defender = state.nations[action.targetNationId];

    if (!attacker || !defender || !attacker.isAlive || !defender.isAlive) {
      return state;
    }

    const oilPrice = state.marketPrices?.oil || 25000000;
    const calcResult = BattleCalculator.calculateBattle(
      attacker,
      defender,
      action.dronesToLaunch,
      oilPrice,
    );

    let updatedState = state;
    if (calcResult.isAttackerVictory && calcResult.conqueredAreaSqKm > 0) {
      updatedState = this.battleBridge.bridgeConquest(
        state,
        action.nationId,
        action.targetNationId,
        calcResult.conqueredAreaSqKm,
      );
    }

    return updatedState;
  }
}
