import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  DiplomaticProposalAction,
} from "@/domain/game/action.schema";
import { TreatyEvaluator } from "@/engine/diplomacy/treaty-evaluator";
import type { ActionHandler } from "@/engine/actions/action-handler";

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
        if (diploAction.proposalType === "IMPROVE_RELATIONS") {
          const updatedSender = {
            ...sender,
            treasury: sender.treasury - 10000,
            relations: {
              ...sender.relations,
              [diploAction.targetNationId]: {
                ...senderRelation,
                opinion: Math.min(100, senderRelation.opinion + 15),
              },
            },
          };

          const updatedReceiver = {
            ...receiver,
            relations: {
              ...receiver.relations,
              [action.nationId]: {
                ...receiverRelation,
                opinion: Math.min(100, receiverRelation.opinion + 15),
              },
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

        if (diploAction.proposalType === "DEMAND_TRIBUTE") {
          const tributeAmount =
            diploAction.tributeAmount || Math.floor(receiver.gdp * 0.005);
          const updatedSender = {
            ...sender,
            relations: {
              ...sender.relations,
              [diploAction.targetNationId]: {
                ...senderRelation,
                tributePerTurn: tributeAmount,
                stance: "PEACE" as const,
              },
            },
          };

          const updatedReceiver = {
            ...receiver,
            relations: {
              ...receiver.relations,
              [action.nationId]: {
                ...receiverRelation,
                opinion: Math.max(-100, receiverRelation.opinion - 30),
                stance: "PEACE" as const,
              },
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
