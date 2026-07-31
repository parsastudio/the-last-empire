import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/game-error";

export interface ProxyOperationResult {
  updatedSourceNation: Nation;
  updatedTargetNation: Nation;
  coupTriggered: boolean;
}

export class ProxyWarManager {
  public executeProxyOperation(
    sourceNation: Nation,
    targetNation: Nation,
    drainAmount: number,
  ): ProxyOperationResult {
    const clampedDrain = Math.max(1, Math.min(15, drainAmount));
    const requiredBudget = Math.floor(
      targetNation.gdp * (clampedDrain / 2) * 0.01,
    );

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
    let updatedTarget: Nation = {
      ...targetNation,
      government: {
        ...targetNation.government,
        stability: newStability,
      },
    };

    if (newStability < 10) {
      coupTriggered = true;
      updatedTarget = {
        ...updatedTarget,
        gdp: Math.floor(updatedTarget.gdp * 0.75),
        treasury: Math.floor(updatedTarget.treasury * 0.6),
        government: {
          ...updatedTarget.government,
          stability: 20,
          corruption: Math.min(100, updatedTarget.government.corruption + 15),
        },
      };
    }

    return {
      updatedSourceNation: updatedSource,
      updatedTargetNation: updatedTarget,
      coupTriggered,
    };
  }
}
