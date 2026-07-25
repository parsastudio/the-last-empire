import { Nation } from "@/domain/nation/nation.schema";
import { ProxyBudgetManager } from "./proxy/proxy-budget.manager";
import { ProxyStabilityImpactCalculator } from "./proxy/proxy-stability-impact.calculator";

export interface ProxyImpactResult {
  updatedTargetNation: Nation;
  coupTriggered: boolean;
}

export class ProxyWarManager {
  private budgetManager = new ProxyBudgetManager();
  private impactCalculator = new ProxyStabilityImpactCalculator();

  public addProxyBudget(
    nation: Nation,
    targetNationId: string,
    amount: number,
  ): Nation {
    return this.budgetManager.addProxyBudget(nation, targetNationId, amount);
  }

  public processTurnProxyImpact(
    targetNation: Nation,
    playerInfluenceBudget: number,
  ): ProxyImpactResult {
    return this.impactCalculator.processTurnProxyImpact(
      targetNation,
      playerInfluenceBudget,
    );
  }
}
