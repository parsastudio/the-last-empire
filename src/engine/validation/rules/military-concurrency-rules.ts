import type { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";

export class MilitaryConcurrencyRules {
  public verify(actionList: GameAction[], newAction: GameAction): void {
    if (newAction.type === "ATTACK") {
      const target = newAction.targetNationId;
      const hasAttackThisTurnOnTarget = actionList.some(
        (a) =>
          a.type === "ATTACK" &&
          a.nationId === newAction.nationId &&
          a.targetNationId === target,
      );
      if (hasAttackThisTurnOnTarget) {
        throw new GameError(
          "INVALID_ACTION",
          "Cannot launch multiple attacks on the same nation in a single turn",
        );
      }
    }
  }
}
