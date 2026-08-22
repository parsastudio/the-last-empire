import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";
import { GeopoliticalReachResolver } from "@/domain/diplomacy/geopolitical-reach-resolver.utility";

export interface ThreatEvaluationResult {
  threatScore: number;
  opportunityScore: number;
  isNeighbor: boolean;
  isLandNeighbor: boolean;
  isNavalReachable: boolean;
  powerRatio: number;
}

export class AIThreatCalculator {
  public static evaluate(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
    allNations?: Record<string, Nation>,
  ): ThreatEvaluationResult {
    const sourcePower = Math.max(
      1,
      MilitaryPowerCalculator.calculateLandAndAirPower(source),
    );
    const targetPower = Math.max(
      1,
      MilitaryPowerCalculator.calculateLandAndAirPower(target),
    );
    const powerRatio = Number((targetPower / sourcePower).toFixed(2));

    const isLandNeighbor = GeopoliticalReachResolver.hasDirectLandBorder(
      source,
      target,
      provincesMap,
    );

    const isImmediateSeaNeighbor =
      GeopoliticalReachResolver.isImmediateMaritimeNeighbor(
        source,
        target,
        provincesMap,
      );

    const isReachable = allNations
      ? GeopoliticalReachResolver.isReachable(
          source,
          target,
          allNations,
          provincesMap,
        )
      : isLandNeighbor || isImmediateSeaNeighbor;

    const isNavalReachable = Boolean(
      source.geography.hasSeaAccess &&
      target.geography.hasSeaAccess &&
      isReachable,
    );

    const isNeighbor = isLandNeighbor || isImmediateSeaNeighbor;

    if (!isReachable) {
      return {
        threatScore: 0,
        opportunityScore: 0,
        isNeighbor: false,
        isLandNeighbor: false,
        isNavalReachable: false,
        powerRatio,
      };
    }

    let threatScore = 0;
    if (isLandNeighbor) {
      threatScore += 35;
      if (powerRatio > 1.2) {
        threatScore += Math.min(50, Math.floor((powerRatio - 1.0) * 40));
      }
    } else if (isImmediateSeaNeighbor) {
      threatScore += 25;
      if (powerRatio > 1.2) {
        threatScore += Math.min(40, Math.floor((powerRatio - 1.0) * 35));
      }
    } else if (isNavalReachable) {
      threatScore += 15;
      if (powerRatio > 1.3) {
        threatScore += Math.min(30, Math.floor((powerRatio - 1.0) * 25));
      }
    }

    const rel = source.relations[target.id];
    if (rel) {
      if (rel.stance === "WAR") threatScore += 25;
      if (rel.opinion < -30) threatScore += 15;
    }

    threatScore = Math.min(100, Math.max(0, threatScore));

    let opportunityScore = 0;
    if (isLandNeighbor) {
      opportunityScore += 30;
      if (powerRatio < 0.7) {
        opportunityScore += Math.min(50, Math.floor((1.0 - powerRatio) * 60));
      }
    } else if (isImmediateSeaNeighbor) {
      opportunityScore += 25;
      if (powerRatio < 0.7) {
        opportunityScore += Math.min(45, Math.floor((1.0 - powerRatio) * 55));
      }
    } else if (isNavalReachable) {
      const navalPowerRatio =
        ((source.military.navalFleet || 0) + 1) /
        ((target.military.navalFleet || 0) + 1);

      if (navalPowerRatio >= 1.2) {
        opportunityScore += 20;
        if (powerRatio < 0.7) {
          opportunityScore += Math.min(40, Math.floor((1.0 - powerRatio) * 50));
        }
      }
    }

    if (opportunityScore > 0) {
      if (target.government.stability < 40) {
        opportunityScore += Math.floor(
          (40 - target.government.stability) * 0.8,
        );
      }
      if (target.warFocusTargetId && target.warFocusTargetId !== source.id) {
        opportunityScore += 20;
      }
    }

    opportunityScore = Math.min(100, Math.max(0, opportunityScore));

    return {
      threatScore,
      opportunityScore,
      isNeighbor,
      isLandNeighbor,
      isNavalReachable,
      powerRatio,
    };
  }
}
