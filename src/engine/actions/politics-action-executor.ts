import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-engine";
import { ResearchManager } from "@/engine/politics/research-manager";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

export class PoliticsActionExecutor {
  private static treatyEvaluator = new TreatyEvaluator();
  private static researchManager = new ResearchManager();

  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalSourceId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[action.nationId] || state.nations[canonicalSourceId];
    if (!nation) return state;

    const sourceKey = nation.id;

    switch (action.type) {
      case "UNLOCK_DOCTRINE": {
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: this.researchManager.unlockDoctrine(
              nation,
              action.doctrineId,
            ),
          },
        };
      }

      case "INVEST_DIPLOMACY": {
        if (action.amount <= 0) {
          throw new GameError("INVALID_ACTION", "مبلغ بودجه باید مثبت باشد.");
        }
        if (nation.treasury < action.amount) {
          throw new GameError("INSUFFICIENT_FUNDS", "موجودی خزانه کافی نیست.");
        }
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
              ...nation,
              treasury: nation.treasury - action.amount,
              globalReputation: Math.min(100, nation.globalReputation + 15),
            },
          },
        };
      }

      case "FUND_PROXY_INFLUENCE": {
        const canonicalTargetId = CountryRegistry.resolveCanonicalId(
          action.targetNationId,
        );
        const target =
          state.nations[action.targetNationId] ||
          state.nations[canonicalTargetId];
        if (!target || !target.isAlive) {
          throw new GameError("NATION_NOT_FOUND", "کشور هدف یافت نشد.");
        }
        const targetKey = target.id;

        if (action.budget <= 0) {
          throw new GameError("INVALID_ACTION", "بودجه عملیات باید مثبت باشد.");
        }

        if (nation.treasury < action.budget) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای اجرای عملیات نیابتی کافی نیست.",
          );
        }

        const targetGdp = getNationGdp(target);
        const drain = Math.max(
          1,
          Math.min(
            15,
            Math.floor((action.budget / (targetGdp * 0.01 || 1)) * 2),
          ),
        );

        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
              ...nation,
              treasury: nation.treasury - action.budget,
            },
            [targetKey]: {
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
        const canonicalTargetId = CountryRegistry.resolveCanonicalId(
          action.targetNationId,
        );
        const receiver =
          state.nations[action.targetNationId] ||
          state.nations[canonicalTargetId];
        if (!receiver) return state;
        const targetKey = receiver.id;

        if (
          (action.proposalType === "NON_AGGRESSION_PACT" ||
            action.proposalType === "FULL_ALLIANCE") &&
          nation.isAi
        ) {
          return state;
        }

        const result = this.treatyEvaluator.evaluateProposal(
          nation,
          receiver,
          action.proposalType,
        );
        if (!result.accepted) return state;

        const senderRel =
          nation.relations[action.targetNationId] ||
          nation.relations[canonicalTargetId];
        const receiverRel =
          receiver.relations[action.nationId] ||
          receiver.relations[canonicalSourceId];
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
            [sourceKey]: {
              ...nation,
              relations: {
                ...nation.relations,
                [senderRel.targetNationId]: updatedSenderRel,
              },
            },
            [targetKey]: {
              ...receiver,
              relations: {
                ...receiver.relations,
                [receiverRel.targetNationId]: updatedReceiverRel,
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
