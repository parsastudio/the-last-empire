import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { TreatyEvaluator } from "@/engine/diplomacy/treaty-evaluator";
import { AbilityExecutor } from "./ability-executor";

export class PoliticsActionExecutor {
  private static treatyEvaluator = new TreatyEvaluator();

  public static execute(state: GameState, action: GameAction): GameState {
    const nation = state.nations[action.nationId];
    if (!nation) return state;

    switch (action.type) {
      case "ACTIVATE_ABILITY":
        return AbilityExecutor.execute(state, action);

      case "UNLOCK_DOCTRINE":
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              doctrines: {
                doctrinePoints: nation.doctrines.doctrinePoints - 3,
                unlockedDoctrines: [
                  ...nation.doctrines.unlockedDoctrines,
                  action.doctrineId,
                ],
              },
            },
          },
        };

      case "ANTI_CORRUPTION_DRIVE": {
        const reduction = Math.floor((action.amount / (nation.gdp || 1)) * 100);
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              treasury: nation.treasury - action.amount,
              government: {
                ...nation.government,
                corruption: Math.max(
                  0,
                  nation.government.corruption - reduction,
                ),
              },
            },
          },
        };
      }

      case "INVEST_DIPLOMACY":
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              treasury: nation.treasury - action.amount,
              globalReputation: Math.min(100, nation.globalReputation + 15),
            },
          },
        };

      case "FUND_PROXY_INFLUENCE": {
        const target = state.nations[action.targetNationId];
        if (!target) return state;
        const drain = Math.max(
          1,
          Math.min(
            15,
            Math.floor((action.budget / (target.gdp * 0.01 || 1)) * 2),
          ),
        );
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              treasury: nation.treasury - action.budget,
            },
            [action.targetNationId]: {
              ...target,
              government: {
                ...target.government,
                stability: Math.max(0, target.government.stability - drain),
              },
            },
          },
        };
      }

      case "DIPLOMATIC_PROPOSAL": {
        const receiver = state.nations[action.targetNationId];
        if (!receiver) return state;
        const result = this.treatyEvaluator.evaluateProposal(
          nation,
          receiver,
          action.proposalType,
        );
        if (!result.accepted) return state;

        const senderRel = nation.relations[action.targetNationId];
        const receiverRel = receiver.relations[action.nationId];
        if (!senderRel || !receiverRel) return state;

        const updatedSenderRel = this.treatyEvaluator.applyTreatyStance(
          senderRel,
          action.proposalType,
        );
        const updatedReceiverRel = this.treatyEvaluator.applyTreatyStance(
          receiverRel,
          action.proposalType,
        );

        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              relations: {
                ...nation.relations,
                [action.targetNationId]: updatedSenderRel,
              },
            },
            [action.targetNationId]: {
              ...receiver,
              relations: {
                ...receiver.relations,
                [action.nationId]: updatedReceiverRel,
              },
            },
          },
        };
      }

      default:
        return state;
    }
  }
}
