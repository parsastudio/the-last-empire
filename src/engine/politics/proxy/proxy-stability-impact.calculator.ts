import { Nation } from "@/domain/nation/nation.schema";

export interface ProxyImpactResult {
  updatedTargetNation: Nation;
  coupTriggered: boolean;
}

export class ProxyStabilityImpactCalculator {
  public processTurnProxyImpact(
    targetNation: Nation,
    playerInfluenceBudget: number,
  ): ProxyImpactResult {
    if (playerInfluenceBudget <= 0) {
      return { updatedTargetNation: targetNation, coupTriggered: false };
    }

    const rawStabilityDrain = Math.floor(Math.log10(playerInfluenceBudget) * 3);
    const stabilityDrain = Math.max(1, Math.min(15, rawStabilityDrain));
    const finalStability = Math.max(
      0,
      targetNation.government.stability - stabilityDrain,
    );

    let updated = {
      ...targetNation,
      government: {
        ...targetNation.government,
        stability: finalStability,
      },
    };

    if (finalStability < 10) {
      updated = {
        ...updated,
        gdp: Math.floor(updated.gdp * 0.75),
        treasury: Math.floor(updated.treasury * 0.6),
        government: {
          ...updated.government,
          type: "DICTATORSHIP",
          stability: 20,
          corruption: Math.min(100, updated.government.corruption + 15),
          turnsInPower: 0,
        },
      };
      return { updatedTargetNation: updated, coupTriggered: true };
    }

    return { updatedTargetNation: updated, coupTriggered: false };
  }
}
