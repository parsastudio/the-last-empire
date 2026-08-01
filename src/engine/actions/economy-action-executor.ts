import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { MarketEngine } from "@/engine/economy/market-engine";

export class EconomyActionExecutor {
  private static marketEngine = new MarketEngine();

  public static execute(state: GameState, action: GameAction): GameState {
    const nation = state.nations[action.nationId];
    if (!nation) return state;

    switch (action.type) {
      case "SET_TAX_RATE": {
        const delta = Math.abs(action.newRate - nation.taxRate);
        const penalty = delta > 15 ? Math.floor(delta * 0.8) : 0;
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              taxRate: action.newRate,
              government: {
                ...nation.government,
                stability: Math.max(0, nation.government.stability - penalty),
              },
            },
          },
        };
      }

      case "SET_TARIFF_RATE":
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: { ...nation, tariffRate: action.newRate },
          },
        };

      case "REQUEST_LOAN": {
        const totalDebt = action.amount + Math.floor(action.amount * 0.05);
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              treasury: nation.treasury + action.amount,
              nationalDebt: nation.nationalDebt + totalDebt,
            },
          },
        };
      }

      case "REPAY_DEBT": {
        const repayAmount = Math.min(action.amount, nation.nationalDebt);
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              treasury: nation.treasury - repayAmount,
              nationalDebt: nation.nationalDebt - repayAmount,
            },
          },
        };
      }

      case "INVEST_INFRASTRUCTURE": {
        const cost = Math.max(1000000000, Math.floor(nation.gdp * 0.1));
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              treasury: nation.treasury - cost,
              gdp: Math.floor(nation.gdp * 1.02),
              geography: {
                ...nation.geography,
                infrastructureLevel: nation.geography.infrastructureLevel + 1,
              },
            },
          },
        };
      }

      case "UPGRADE_INDUSTRIAL_LEVEL": {
        const cost = Math.max(2000000000, Math.floor(nation.gdp * 0.15));
        return {
          ...state,
          nations: {
            ...state.nations,
            [action.nationId]: {
              ...nation,
              treasury: nation.treasury - cost,
              industrialLevel: nation.industrialLevel + 1,
            },
          },
        };
      }

      case "TRADE_RESOURCES": {
        const res = action.isBuy
          ? this.marketEngine.buyResource(
              nation,
              state.marketPrices,
              action.resourceType,
              action.amount,
            )
          : this.marketEngine.sellResource(
              nation,
              state.marketPrices,
              action.resourceType,
              action.amount,
            );

        return {
          ...state,
          marketPrices: res.updatedMarketPrices,
          nations: {
            ...state.nations,
            [action.nationId]: res.updatedNation,
          },
        };
      }

      default:
        return state;
    }
  }
}
