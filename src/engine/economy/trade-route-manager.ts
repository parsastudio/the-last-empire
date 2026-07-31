import type { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";

export interface ActiveTradeRoute {
  partnerId: string;
  isPeaceful: boolean;
  baseTradeValue: number;
}

export class TradeRouteManager {
  private governmentSystem = new GovernmentSystem();

  public calculateTotalTradeRevenue(
    nation: Nation,
    _allNations?: Record<string, Nation>,
  ): number {
    const govTraits = this.governmentSystem.getTraits(nation.government.type);
    const baseCommerce = Math.floor(
      nation.gdp * 0.2 * govTraits.tradeMultiplier,
    );
    const seaModifier = nation.geography.hasSeaAccess ? 1.0 : 0.5;

    return Math.floor(baseCommerce * seaModifier);
  }

  public getActiveTradeRoutes(
    nation: Nation,
    _allNations?: Record<string, Nation>,
  ): ActiveTradeRoute[] {
    const totalTrade = this.calculateTotalTradeRevenue(nation);
    return [
      {
        partnerId: "GLOBAL_MARKET",
        isPeaceful: true,
        baseTradeValue: totalTrade,
      },
    ];
  }
}
