import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";

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

    const isLandNeighbor = this.checkLandNeighborhood(
      source,
      target,
      provincesMap,
    );
    const isNavalReachable = Boolean(
      source.geography.hasSeaAccess && target.geography.hasSeaAccess,
    );

    const hasGlobalReach =
      source.rank <= 5 ||
      source.military.techLevel >= 4 ||
      (source.military.navalFleet || 0) >= 2;

    const isNeighbor =
      isLandNeighbor ||
      (isNavalReachable &&
        (hasGlobalReach ||
          source.geography.seaNeighbors?.includes(target.id) ||
          false));

    let threatScore = 0;
    if (isLandNeighbor) {
      threatScore += 30;
      if (powerRatio > 1.2) {
        threatScore += Math.min(50, Math.floor((powerRatio - 1.0) * 40));
      }
    } else if (isNavalReachable) {
      threatScore += hasGlobalReach ? 22 : 15;
      if (powerRatio > 1.2) {
        threatScore += Math.min(35, Math.floor((powerRatio - 1.0) * 30));
      }
    } else if (powerRatio > 2.5) {
      threatScore += 15;
    }

    const rel = source.relations[target.id];
    if (rel) {
      if (rel.stance === "WAR") threatScore += 25;
      if (rel.opinion < -30) threatScore += 15;
    }

    threatScore = Math.min(100, Math.max(0, threatScore));

    let opportunityScore = 0;
    if (isLandNeighbor) {
      opportunityScore += 25;
      if (powerRatio < 0.7) {
        opportunityScore += Math.min(50, Math.floor((1.0 - powerRatio) * 60));
      }
    } else if (isNavalReachable) {
      const navalPowerRatio =
        ((source.military.navalFleet || 0) + 1) /
        ((target.military.navalFleet || 0) + 1);

      if (hasGlobalReach || navalPowerRatio >= 1.2) {
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

  private static checkLandNeighborhood(
    source: Nation,
    target: Nation,
    provincesMap?: Record<string, Province>,
  ): boolean {
    if (!provincesMap) {
      return source.geography.landNeighbors.includes(target.id);
    }

    for (const pid of target.provinceIds || []) {
      if (
        LandNeighborResolver.hasProvinceLandBorder(pid, source.id, provincesMap)
      ) {
        return true;
      }
    }

    return false;
  }
}
