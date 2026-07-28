import type { GameState } from "@/domain/game/game-state.schema";
import type {
  GameAction,
  DiplomaticProposalAction,
} from "@/domain/game/action.schema";
import { TreatyEvaluator } from "@/engine/diplomacy/treaty-evaluator";
import type { ActionHandler } from "@/engine/actions/action-handler";
import { TributeCapCalculator } from "@/engine/diplomacy/tribute-cap-calculator";

export class DiplomacyActionHandler implements ActionHandler {
  private evaluator = new TreatyEvaluator();
  private tributeCapCalc = new TributeCapCalculator();

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
      diploAction.tributeAmount,
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
          const maxAllowed = this.tributeCapCalc.calculateMaxTribute(receiver);
          const requested = diploAction.tributeAmount || maxAllowed;
          const finalTribute = Math.min(requested, maxAllowed);

          const updatedSender = {
            ...sender,
            globalAggression: Math.min(100, sender.globalAggression + 3),
            relations: {
              ...sender.relations,
              [diploAction.targetNationId]: {
                ...senderRelation,
                tributePerTurn: finalTribute,
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
                opinion: Math.max(-100, receiverRelation.opinion - 15),
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
