import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";

export interface ProxyOperationResult {
  updatedSourceNation: Nation;
  updatedTargetNation: Nation;
}

export class ProxyWarManager {
  public static calculateBudget(
    targetGdp: number,
    desiredDrainPercent: number,
  ): number {
    if (targetGdp <= 0 || desiredDrainPercent <= 0) return 0;
    return Math.floor(targetGdp * (desiredDrainPercent / 2) * 0.01);
  }

  public executeProxyOperation(
    sourceNation: Nation,
    targetNation: Nation,
    drainAmount: number,
  ): ProxyOperationResult {
    const clampedDrain = Math.max(1, Math.min(15, drainAmount));
    let requiredBudget = ProxyWarManager.calculateBudget(
      targetNation.gdp,
      clampedDrain,
    );

    const discount = DoctrinesManager.getProxyCostDiscount(
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

    const updatedTarget: Nation = {
      ...targetNation,
      government: {
        ...targetNation.government,
        stability: newStability,
      },
    };

    return {
      updatedSourceNation: updatedSource,
      updatedTargetNation: updatedTarget,
    };
  }
}
