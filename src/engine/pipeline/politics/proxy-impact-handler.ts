import { Nation } from "@/domain/nation/nation.schema";
import { ProxyWarManager } from "@/engine/politics/proxy-war-manager";

export class ProxyImpactHandler {
  private proxyManager = new ProxyWarManager();

  public handle(
    id: string,
    nation: Nation,
    nations: Record<string, Nation>,
  ): { updated: Nation; coupTriggered: boolean } {
    let updated = { ...nation };
    let accumulatedProxyBudget = 0;

    for (const other of Object.values(nations)) {
      if (other.isAlive && other.id !== id) {
        accumulatedProxyBudget += other.proxyInfluenceBudget[id] || 0;
      }
    }

    const proxyResult = this.proxyManager.processTurnProxyImpact(
      updated,
      accumulatedProxyBudget,
    );

    return {
      updated: proxyResult.updatedTargetNation,
      coupTriggered: proxyResult.coupTriggered,
    };
  }
}
