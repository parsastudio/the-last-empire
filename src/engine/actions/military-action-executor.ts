import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { CountryRegistry } from "@/domain/data/countries";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { BattleExecutionEngine } from "@/engine/combat/battle-execution-engine";
import { ResearchManager } from "@/engine/politics/research-manager";
import { ArmsMarketManager } from "@/engine/military/arms-market-manager";

export class MilitaryActionExecutor {
  private static recruitmentManager = new RecruitmentQueueManager();
  private static battleEngine = new BattleExecutionEngine();

  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalSourceId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[canonicalSourceId] || state.nations[action.nationId];
    if (!nation) return state;

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
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: this.recruitmentManager.enqueueOrder(
              nation,
              action.unitType,
              action.quantity,
            ),
          },
        };
      }

      case "BUY_ARMS_MARKET": {
        return ArmsMarketManager.executePurchase(
          state,
          action.nationId,
          action.sellerNationId,
          action.unitType,
          action.quantity,
        );
      }

      case "CANCEL_RECRUITMENT": {
        if (!nation.recruitmentQueue.some((o) => o.id === action.orderId)) {
          throw new GameError(
            "INVALID_ACTION",
            "سفارش مورد نظر در صف ساخت یافت نشد.",
          );
        }
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: this.recruitmentManager.cancelOrder(
              nation,
              action.orderId,
            ),
          },
        };
      }

      case "INVEST_RESEARCH": {
        const cost = ResearchManager.getMilitaryTechCost(nation);
        if (nation.treasury < cost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای پژوهش ارتقای فناوری نظامی کافی نیست.",
          );
        }
        return {
          ...state,
          nations: {
            ...state.nations,
            [sourceKey]: new ResearchManager().investInMilitaryTech(nation),
          },
        };
      }

      case "INITIATE_BATTLE": {
        const canonicalTargetId = CountryRegistry.resolveCanonicalId(
          action.targetNationId,
        );
        if (
          action.nationId === action.targetNationId ||
          canonicalSourceId === canonicalTargetId
        ) {
          throw new GameError(
            "INVALID_ACTION",
            "امکان تهاجم به کشور خودی وجود ندارد.",
          );
        }
        const target =
          state.nations[canonicalTargetId] ||
          state.nations[action.targetNationId];
        if (!target || !target.isAlive) {
          throw new GameError("NATION_NOT_FOUND", "کشور هدف فعال و زنده نیست.");
        }

        if (nation.military.infantry <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "برای آغاز تهاجم زمینی حداقل به ۱ یگان پیاده‌نظام نیاز است.",
          );
        }
        if (action.dronesToLaunch > nation.military.droneMissile) {
          throw new GameError(
            "INSUFFICIENT_RESOURCES",
            "تعداد پهپادهای درخواستی بیشتر از موجودی انبار است.",
          );
        }

        return this.battleEngine.executeBattle(state, action);
      }

      default:
        return state;
    }
  }
}
