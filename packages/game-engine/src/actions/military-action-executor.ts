import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { GameError, NationGettersUtility } from "@geopolitics/domain";
import { CountryRegistry } from "@/domain/data/countries";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { BattleExecutionEngine } from "@/engine/combat/battle-execution-engine";
import { ResearchManager } from "@/engine/politics/research-manager";
import { ArmsMarketManager } from "@/engine/military/arms-market-manager";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";

export interface MilitaryExecutionOutput {
  newState: GameState;
  resultData?: unknown;
}

export class MilitaryActionExecutor {
  private static recruitmentManager = new RecruitmentQueueManager();
  private static battleEngine = new BattleExecutionEngine();

  public static execute(
    state: GameState,
    action: GameAction,
  ): MilitaryExecutionOutput {
    const canonicalSourceId = CountryRegistry.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[canonicalSourceId] || state.nations[action.nationId];
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
              [sourceKey]: this.recruitmentManager.enqueueOrder(
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
        const hasSea = NationGettersUtility.hasSeaAccess(
          nation.id,
          state.provinces,
        );
        if (!hasSea) {
          throw new GameError(
            "INVALID_ACTION",
            "کشور شما به آب‌های آزاد دسترسی ندارد و امکان تجهیز ناوگان دریایی وجود ندارد.",
          );
        }
        const fleetCost = 50_000_000_000 * action.quantity;
        if (nation.treasury < fleetCost) {
          throw new GameError(
            "INSUFFICIENT_FUNDS",
            "موجودی خزانه برای خرید ناوگان دریایی کافی نیست.",
          );
        }
        return {
          newState: {
            ...state,
            nations: {
              ...state.nations,
              [sourceKey]: {
                ...nation,
                treasury: nation.treasury - fleetCost,
                navalFleet: (nation.navalFleet || 0) + action.quantity,
              },
            },
          },
        };
      }

      case "CANCEL_RECRUITMENT": {
        if (!nation.recruitmentQueue.some((o) => o.id === action.orderId)) {
          throw new GameError(
            "INVALID_ACTION",
            "سفارش مورد نظر در صف ساخت یافت نشد.",
          );
        }
        return {
          newState: {
            ...state,
            nations: {
              ...state.nations,
              [sourceKey]: this.recruitmentManager.cancelOrder(
                nation,
                action.orderId,
              ),
            },
          },
        };
      }

      case "INVEST_RESEARCH": {
        const cost = ResearchManager.getMilitaryTechCost(
          nation,
          state.provinces,
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
              [sourceKey]: new ResearchManager().investInMilitaryTech(
                nation,
                state.provinces,
              ),
            },
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

        const isCurrentWar = NationRelationResolver.isWar(
          nation.relations,
          action.targetNationId,
        );

        if (
          nation.isAi &&
          !isCurrentWar &&
          (nation.postWarCooldownTurns || 0) > 0
        ) {
          throw new GameError(
            "INVALID_ACTION",
            `امکان آغاز تهاجم نظامی جدید وجود ندارد: کشور در دوره سردسازی پس از جنگ قرار دارد.`,
          );
        }

        if (action.attackType === "NAVAL") {
          const fleetCount = nation.navalFleet || 0;
          const maxCapacityPoints = fleetCount * 60;
          const infantryCount = action.infantryToDeploy || 0;
          const armorCount = action.armorToDeploy || 0;
          const requiredPoints = infantryCount * 1 + armorCount * 4;

          if (fleetCount <= 0 || requiredPoints > maxCapacityPoints) {
            throw new GameError(
              "INVALID_ACTION",
              "ظرفیت ترابری ناوگان دریایی شما برای حمل این حجم از ادوات زمینی کافی نیست.",
            );
          }
        }

        if (nation.military.infantry <= 0) {
          throw new GameError(
            "INVALID_ACTION",
            "برای آغاز تهاجم حداقل به ۱ یگان پیاده‌نظام نیاز است.",
          );
        }
        if (action.dronesToLaunch > nation.military.droneMissile) {
          throw new GameError(
            "INSUFFICIENT_RESOURCES",
            "تعداد پهپادهای درخواستی بیشتر از موجودی انبار است.",
          );
        }

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
