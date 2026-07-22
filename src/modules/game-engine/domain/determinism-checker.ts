import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type { GameAction } from "@/modules/game-engine/schemas/action.schema";
import { GameEngine } from "./game-engine";
import { calculateStateHash } from "@/core/utils/state-hash";

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
