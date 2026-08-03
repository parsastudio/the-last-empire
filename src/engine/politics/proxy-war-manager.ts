import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { calculateProxyOperationBudget } from "@/domain/politics/government-label.utility";

export interface ProxyOperationResult {
  updatedSourceNation: Nation;
  updatedTargetNation: Nation;
  coupTriggered: boolean;
}

export class ProxyWarManager {
  private doctrinesManager = new DoctrinesManager();

  public executeProxyOperation(
    sourceNation: Nation,
    targetNation: Nation,
    drainAmount: number,
  ): ProxyOperationResult {
    const clampedDrain = Math.max(1, Math.min(15, drainAmount));
    let requiredBudget = calculateProxyOperationBudget(
      targetNation.gdp,
      clampedDrain,
    );

    const discount = this.doctrinesManager.getProxyCostDiscount(
      sourceNation.doctrines?.unlockedDoctrines,
    );
    requiredBudget = Math.floor(requiredBudget * discount);

    if (sourceNation.treasury < requiredBudget) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        `Insufficient treasury to fund proxy operation against ${targetNation.name}. Required: ${requiredBudget}`,
      );
    }

    const updatedSource: Nation = {
      ...sourceNation,
      treasury: sourceNation.treasury - requiredBudget,
    };

    const newStability = Math.max(
      0,
      targetNation.government.stability - clampedDrain,
    );

    let coupTriggered = false;
    const updatedTarget: Nation = {
      ...targetNation,
      government: {
        ...targetNation.government,
        stability: newStability,
      },
    };

    if (newStability < 10) {
      coupTriggered = true;
    }

    return {
      updatedSourceNation: updatedSource,
      updatedTargetNation: updatedTarget,
      coupTriggered,
    };
  }
}
