import type { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";

export interface ActiveTradeRoute {
  partnerId: string;
  isPeaceful: boolean;
  baseTradeValue: number;
}

export class TradeRouteManager {
  private governmentSystem = new GovernmentSystem();

  public getActiveTradeRoutes(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): ActiveTradeRoute[] {
    const routes: ActiveTradeRoute[] = [];
    const neighbors = [
      ...nation.geography.landNeighbors,
      ...nation.geography.seaNeighbors,
    ];
    const uniqueNeighbors = Array.from(new Set(neighbors));

    const govTraits = this.governmentSystem.getTraits(nation.government.type);

    for (const neighborId of uniqueNeighbors) {
      const neighbor = allNations[neighborId];
      if (!neighbor || !neighbor.isAlive) {
        continue;
      }

      const relation = nation.relations[neighborId];
      if (!relation) {
        continue;
      }

      const isOpinionAllowed = relation.opinion > -30;

      if (isOpinionAllowed) {
        const rawTradeValue = Math.floor((nation.gdp + neighbor.gdp) * 0.001);
        const tradeValue = Math.floor(
          rawTradeValue * govTraits.tradeMultiplier,
        );
        routes.push({
          partnerId: neighborId,
          isPeaceful: true,
          baseTradeValue: tradeValue,
        });
      }
    }

    return routes;
  }

  public calculateTotalTradeRevenue(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): number {
    const routes = this.getActiveTradeRoutes(nation, allNations);
    return routes.reduce((sum, r) => sum + r.baseTradeValue, 0);
  }
}
