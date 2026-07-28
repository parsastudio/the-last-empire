import { GameState } from "@/domain/game/game-state.schema";
import {
  GameAction,
  DiplomaticProposalAction,
} from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/game-error";
import { ActionValidator } from "./action-validator.interface";
import { TributeCapCalculator } from "@/engine/diplomacy/tribute-cap-calculator";

export class TributeAmountValidator implements ActionValidator {
  private capCalculator = new TributeCapCalculator();

  public supports(actionType: string): boolean {
    return actionType === "DIPLOMATIC_PROPOSAL";
  }

  public validate(state: GameState, action: GameAction): void {
    const diploAction = action as DiplomaticProposalAction;
    if (diploAction.proposalType !== "DEMAND_TRIBUTE") {
      return;
    }

    const targetNation = state.nations[diploAction.targetNationId];
    if (targetNation && diploAction.tributeAmount !== undefined) {
      if (diploAction.tributeAmount <= 0) {
        throw new GameError(
          "INVALID_ACTION",
          "Tribute demand amount must be positive",
        );
      }

      if (
        !this.capCalculator.isWithinCap(targetNation, diploAction.tributeAmount)
      ) {
        throw new GameError(
          "INVALID_ACTION",
          "Demanded tribute exceeds maximum cap of 10% of target treasury",
        );
      }
    }
  }
}
