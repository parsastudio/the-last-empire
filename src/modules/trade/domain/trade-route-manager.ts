import type { Nation } from "@/modules/nation/schemas/nation.schema";

export interface ActiveTradeRoute {
  partnerId: string;
  isPeaceful: boolean;
  baseTradeValue: number;
}

export class TradeRouteManager {
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

    for (const neighborId of uniqueNeighbors) {
      const neighbor = allNations[neighborId];
      if (!neighbor || !neighbor.isAlive) {
        continue;
      }

      const relation = nation.relations[neighborId];
      const isPeaceful = !relation || relation.stance !== "WAR";
      const isEmbargoed = relation?.embargoActive ?? false;

      if (isPeaceful && !isEmbargoed) {
        const tradeValue = Math.floor((nation.gdp + neighbor.gdp) * 0.001);
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
