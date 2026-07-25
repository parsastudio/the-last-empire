import { Nation } from "@/domain/nation/nation.schema";

export class ProxyBudgetManager {
  public addProxyBudget(
    nation: Nation,
    targetNationId: string,
    amount: number,
  ): Nation {
    if (nation.treasury < amount) {
      throw new Error("INSUFFICIENT_FUNDS");
    }
    const currentBudget = nation.proxyInfluenceBudget[targetNationId] || 0;
    const updatedBudgets = {
      ...nation.proxyInfluenceBudget,
      [targetNationId]: currentBudget + amount,
    };

    return {
      ...nation,
      treasury: nation.treasury - amount,
      proxyInfluenceBudget: updatedBudgets,
    };
  }
}
