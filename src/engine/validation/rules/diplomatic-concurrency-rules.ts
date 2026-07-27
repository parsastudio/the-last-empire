import type { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";

export class DiplomaticConcurrencyRules {
  public verify(actionList: GameAction[], newAction: GameAction): void {
    if (newAction.type === "DIPLOMATIC_PROPOSAL") {
      const isDuplicateProposal = actionList.some(
        (a) =>
          a.type === "DIPLOMATIC_PROPOSAL" &&
          a.nationId === newAction.nationId &&
          a.targetNationId === newAction.targetNationId &&
          a.proposalType === newAction.proposalType,
      );
      if (isDuplicateProposal) {
        throw new GameError(
          "INVALID_ACTION",
          "Already enqueued a diplomatic proposal of this type to the target nation this turn",
        );
      }
    }
  }
}
