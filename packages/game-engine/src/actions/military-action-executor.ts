import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@geopolitics/domain";
import { CountryRegistry } from "@/domain/data/countries";
import { Nation } from "@/domain/nation/nation.schema";
import { DomesticRecruitmentManager } from "@/engine/military/domestic-recruitment-manager";
import { BattleExecutionEngine } from "@/engine/combat/battle-execution-engine";
import { ResearchManager } from "@/engine/politics/research-manager";
import { ArmsMarketManager } from "@/engine/military/arms-market-manager";
import { NavalFleetExecutor } from "@/engine/actions/executors/military/naval-fleet-executor";
import { BattleInitiationValidator } from "@/engine/actions/executors/military/battle-initiation-validator";

export interface MilitaryExecutionOutput {
  newState: GameState;
  resultData?: unknown;
}

export class MilitaryActionExecutor {
  private static battleEngine = new BattleExecutionEngine();
  private static researchManager = new ResearchManager();

  public static execute(
    state: GameState,
    action: GameAction,
    sourceNation?: Nation,
    canonicalSourceId?: string,
  ): MilitaryExecutionOutput {
    const canonicalId =
      canonicalSourceId ?? CountryRegistry.resolveCanonicalId(action.nationId);
    const nation =
      sourceNation ??
      state.nations[canonicalId] ??
      state.nations[action.nationId];

    if (!nation) return { newState: state };

    const sourceKey = nation.id;

    switch (action.type) {
      case "RECRUIT_UNIT": {
        if (action.quantity <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "تعداد یگان درخواستی باید مثبت باشد.",
          );
        }
        return {
          newState: {
            ...state,
            nations: {
              ...state.nations,
              [sourceKey]: DomesticRecruitmentManager.executeRecruitment(
                nation,
                action.unitType,
                action.quantity,
                state.provinces,
              ),
            },
          },
        };
      }

      case "BUY_ARMS_MARKET": {
        return {
          newState: ArmsMarketManager.executePurchase(
            state,
            action.nationId,
            action.sellerNationId,
            action.unitType,
            action.quantity,
          ),
        };
      }

      case "BUY_NAVAL_FLEET": {
        return {
          newState: NavalFleetExecutor.execute(
            state,
            nation,
            action,
            sourceKey,
          ),
        };
      }

      case "INVEST_RESEARCH": {
        const cost = ResearchManager.getMilitaryTechCost(
          nation.military.techLevel,
        );
        if (nation.treasury < cost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای پژوهش ارتقای فناوری نظامی کافی نیست.",
          );
        }
        return {
          newState: {
            ...state,
            nations: {
              ...state.nations,
              [sourceKey]: this.researchManager.investInMilitaryTech(nation),
            },
          },
        };
      }

      case "INITIATE_BATTLE": {
        const canonicalTargetId = CountryRegistry.resolveCanonicalId(
          action.targetNationId,
        );
        const target =
          state.nations[canonicalTargetId] ||
          state.nations[action.targetNationId];

        if (!target) {
          throw new GameError("NATION_NOT_FOUND", "کشور هدف یافت نشد.");
        }

        BattleInitiationValidator.validate(
          state,
          nation,
          target,
          action,
          canonicalId,
          canonicalTargetId,
        );

        const battleResult = this.battleEngine.executeBattle(state, action);
        return {
          newState: battleResult.state,
          resultData: battleResult.reportData,
        };
      }

      default:
        return { newState: state };
    }
  }
}
