import type { GameState } from "@/domain/game/game-state.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { GameEngine } from "../game-engine";
import { calculateStateHash } from "@/domain/shared/state-hash";

export class DeterminismChecker {
  public verifyDeterminism(
    initialState: GameState,
    actions: GameAction[],
  ): boolean {
    const engineA = new GameEngine(initialState);
    const engineB = new GameEngine(initialState);

    for (const action of actions) {
      engineA.dispatchAction(action);
      engineB.dispatchAction(action);
    }

    const stateA = engineA.nextTurn();
    const stateB = engineB.nextTurn();

    const hashA = calculateStateHash(stateA);
    const hashB = calculateStateHash(stateB);

    return hashA === hashB;
  }
}
