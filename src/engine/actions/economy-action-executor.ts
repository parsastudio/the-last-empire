import { GameState } from "@/domain/game/game-state.schema";
import { GameAction } from "@/domain/game/action.schema";
import { MarketEngine } from "@/engine/economy/market-engine";
import { NationIdResolver } from "@/domain/shared/domain-utilities";
import {
  IndustrialLevelManager,
  InfrastructureManager,
} from "@/engine/economy/economy-domain.service";

export class EconomyActionExecutor {
  public static execute(state: GameState, action: GameAction): GameState {
    const canonicalNationId = NationIdResolver.resolveCanonicalId(
      action.nationId,
    );
    const nation =
      state.nations[action.nationId] || state.nations[canonicalNationId];
    if (!nation) return state;

    switch (action.type) {
      case "SET_TAX_RATE": {
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              taxRate: action.newRate,
            },
          },
        };
      }

      case "SET_TARIFF_RATE":
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: { ...nation, tariffRate: action.newRate },
          },
        };

      case "REQUEST_LOAN": {
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              treasury: nation.treasury + action.amount,
              nationalDebt: nation.nationalDebt + action.amount,
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
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - repayAmount,
              nationalDebt: nation.nationalDebt - repayAmount,
            },
          },
        };
      }

      case "INVEST_INFRASTRUCTURE": {
        const cost = InfrastructureManager.getUpgradeCost(nation);
        if (nation.treasury < cost) return state;
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
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
        const cost = IndustrialLevelManager.getUpgradeCost(nation);
        if (nation.treasury < cost) return state;
        return {
          ...state,
          nations: {
            ...state.nations,
            [nation.id]: {
              ...nation,
              treasury: nation.treasury - cost,
              industrialLevel: nation.industrialLevel + 1,
            },
          },
        };
      }

      case "TRADE_RESOURCES": {
        const res = action.isBuy
          ? MarketEngine.buyResource(
              nation,
              state.marketPrices,
              action.resourceType,
              action.amount,
            )
          : MarketEngine.sellResource(
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
            [nation.id]: res.updatedNation,
          },
        };
      }

      default:
        return state;
    }
  }
}
