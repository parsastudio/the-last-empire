import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { TreatyEvaluator } from "@/engine/diplomacy/treaty-evaluator";
import { ResearchManager } from "@/engine/politics/research-manager";
import { AbilityExecutor } from "./ability-executor";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

export class PoliticsActionExecutor {
  private static treatyEvaluator = new TreatyEvaluator();
  private static researchManager = new ResearchManager();

  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalNationId = NationIdResolver.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[action.nationId] || state.nations[canonicalNationId];
    if (!nation) return state;

    switch (action.type) {
      case "SET_RESEARCH_BUDGET": {
        const updatedNation = this.researchManager.setResearchBudget(
          nation,
          action.newRate,
        );
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: updatedNation,
          },
        };
      }

      case "ACTIVATE_ABILITY":
        return AbilityExecutor.execute(state, action);

      case "UNLOCK_DOCTRINE":
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
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
            [nation.id]: {
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
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - action.amount,
              globalReputation: Math.min(100, nation.globalReputation + 15),
            },
          },
        };

      case "FUND_PROXY_INFLUENCE": {
        const canonicalTargetId = NationIdResolver.resolveCanonicalId(
          action.targetNationId,
        );
        const target =
          state.nations[action.targetNationId] ||
          state.nations[canonicalTargetId];
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
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - action.budget,
            },
            [target.id]: {
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
        const canonicalTargetId = NationIdResolver.resolveCanonicalId(
          action.targetNationId,
        );
        const receiver =
          state.nations[action.targetNationId] ||
          state.nations[canonicalTargetId];
        if (!receiver) return state;
        const result = this.treatyEvaluator.evaluateProposal(
          nation,
          receiver,
          action.proposalType,
        );
        if (!result.accepted) return state;

        const senderRelKey = nation.relations[receiver.id]
          ? receiver.id
          : action.targetNationId;
        const receiverRelKey = receiver.relations[nation.id]
          ? nation.id
          : action.nationId;

        const senderRel = nation.relations[senderRelKey];
        const receiverRel = receiver.relations[receiverRelKey];
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
            [nation.id]: {
              ...nation,
              relations: {
                ...nation.relations,
                [senderRelKey]: updatedSenderRel,
              },
            },
            [receiver.id]: {
              ...receiver,
              relations: {
                ...receiver.relations,
                [receiverRelKey]: updatedReceiverRel,
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
