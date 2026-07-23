import type { GameState } from "@/modules/game-engine/schemas/game-state.schema";
import type {
  GameAction,
  DiplomaticProposalAction,
} from "@/modules/game-engine/schemas/action.schema";
import { TreatyEvaluator } from "@/modules/diplomacy/domain/treaty-evaluator";
import type { ActionHandler } from "./action-handler";

export class DiplomacyActionHandler implements ActionHandler {
  private evaluator = new TreatyEvaluator();

  public execute(state: GameState, action: GameAction): GameState {
    if (action.type !== "DIPLOMATIC_PROPOSAL") {
      return state;
    }
    const diploAction = action as DiplomaticProposalAction;
    const sender = state.nations[action.nationId];
    const receiver = state.nations[diploAction.targetNationId];
    if (!sender || !receiver) {
      return state;
    }

    const evalResult = this.evaluator.evaluateProposal(
      sender,
      receiver,
      diploAction.proposalType,
    );
    if (evalResult.accepted) {
      const senderRelation = sender.relations[diploAction.targetNationId];
      const receiverRelation = receiver.relations[action.nationId];
      if (senderRelation && receiverRelation) {
        const updatedSender = {
          ...sender,
          relations: {
            ...sender.relations,
            [diploAction.targetNationId]: this.evaluator.applyTreatyStance(
              senderRelation,
              diploAction.proposalType,
            ),
          },
        };

        const updatedReceiver = {
          ...receiver,
          relations: {
            ...receiver.relations,
            [action.nationId]: this.evaluator.applyTreatyStance(
              receiverRelation,
              diploAction.proposalType,
            ),
          },
        };

        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: updatedSender,
            [diploAction.targetNationId]: updatedReceiver,
          },
        };
      }
    }

    return state;
  }
}
