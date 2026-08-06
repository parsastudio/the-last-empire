import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError, NationIdResolver } from "@/domain/shared/domain-utilities";
import { TreatyEvaluator } from "@/engine/diplomacy/diplomacy-domain.service";
import { ResearchManager } from "@/engine/politics/research-manager";
import { CorruptionManager } from "@/engine/politics/corruption-manager";
import { ProxyWarManager } from "@/engine/politics/proxy-war-manager";
import { AbilityExecutor } from "@/engine/actions/ability-executor";

export class PoliticsActionExecutor {
  private static treatyEvaluator = new TreatyEvaluator();
  private static researchManager = new ResearchManager();

  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalSourceId = NationIdResolver.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[action.nationId] || state.nations[canonicalSourceId];
    if (!nation) return state;

    const sourceKey = nation.id;

    switch (action.type) {
      case "SET_RESEARCH_BUDGET": {
        if (action.newRate < 0 || action.newRate > 30) {
          throw new GameError(
            "INVALID_ACTION",
            "نرخ بودجه پژوهش باید بین ۰ تا ۳۰ درصد باشد.",
          );
        }
        const updatedNation = this.researchManager.setResearchBudget(
          nation,
          action.newRate,
        );
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: updatedNation,
          },
        };
      }

      case "ACTIVATE_ABILITY":
        return AbilityExecutor.execute(state, action);

      case "UNLOCK_DOCTRINE": {
        if (nation.doctrines.doctrinePoints < 3) {
          throw new GameError(
            "INVALID_ACTION",
            "امتیاز پژوهشی کافی برای آنلاک این دکترین وجود ندارد.",
          );
        }
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
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
      }

      case "ANTI_CORRUPTION_DRIVE": {
        if (action.amount <= 0) {
          throw new GameError("INVALID_ACTION", "مبلغ بودجه باید مثبت باشد.");
        }
        if (nation.treasury < action.amount) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای طرح ضدفساد کافی نیست.",
          );
        }
        const reduction = CorruptionManager.calculateReduction(
          action.amount,
          nation.gdp,
        );
        const rawCorruption = nation.government.corruption - reduction;
        const newCorruption =
          rawCorruption <= 0.01 ? 0 : Number(rawCorruption.toFixed(2));
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
              ...nation,
              treasury: nation.treasury - action.amount,
              government: {
                ...nation.government,
                corruption: Math.max(0, newCorruption),
              },
            },
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

      case "CONFIGURE_AUTO_TRADE":
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
              ...nation,
              autoTradeSettings: {
                autoBuyDeficit: action.autoBuyDeficit,
                autoSellOilPercent: action.autoSellOilPercent,
                autoSellSteelPercent: action.autoSellSteelPercent,
                allowEmergencyLoans: action.allowEmergencyLoans,
              },
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
        if (!target || !target.isAlive) {
          throw new GameError("NATION_NOT_FOUND", "کشور هدف یافت نشد.");
        }
        const targetKey = target.id;

        const reqBudget = ProxyWarManager.calculateBudget(target.gdp, 2);
        if (nation.treasury < reqBudget) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای اجرای عملیات نیابتی کافی نیست.",
          );
        }

        const drain = Math.max(
          1,
          Math.min(
            15,
            Math.floor((action.budget / (target.gdp * 0.01 || 1)) * 2),
          ),
        );

        const requiredBudget = ProxyWarManager.calculateBudget(
          target.gdp,
          drain,
        );

        const actualBudget = Math.min(
          action.budget,
          requiredBudget > 0 ? requiredBudget : action.budget,
        );

        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: {
              ...nation,
              treasury: nation.treasury - actualBudget,
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
        const canonicalTargetId = NationIdResolver.resolveCanonicalId(
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
