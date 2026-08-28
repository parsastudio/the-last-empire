import {
  Nation,
  Province,
  DiplomaticPosture,
  CountryRegistry,
  NationRelationResolver,
  GeopoliticalReachResolver,
  GeopoliticalReachTier,
  ProximityTier,
  MilitaryPowerCalculator,
  NationGettersUtility,
  TerritoryClaimsUtility,
} from "@geopolitics/domain";

export interface GeopoliticalVector {
  alignment: number;
  tension: number;
  posture: DiplomaticPosture;
  sourceReachTier: GeopoliticalReachTier;
  targetReachTier: GeopoliticalReachTier;
  proximityTier: ProximityTier;
  isNeighbor: boolean;
  isLandNeighbor: boolean;
  isNavalReachable: boolean;
  powerRatio: number;
  lostProvincesCount: number;
  reasons: {
    ideologyScore: number;
    commonEnemyBonus: number;
    reputationEffect: number;
    borderFriction: number;
    revanchismPenalty: number;
  };
}

export class GeopoliticalVectorCalculator {
  public static calculate(
    source: Nation,
    target: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
    sourcePower?: number,
    _sourceSeaAccess?: boolean,
    provincesByOwnerMap?: Map<string, Province[]>,
    occupiedTerritoryMap?: Map<string, number>,
  ): GeopoliticalVector {
    const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
    const rel =
      source.relations[canonicalTarget] || source.relations[target.id];

    const baseAlignment = rel?.alignment ?? 0;
    const ideologyScore = 0;

    let commonEnemyBonus = 0;
    if (
      allNations &&
      NationRelationResolver.hasCommonEnemy(source, target, allNations)
    ) {
      commonEnemyBonus = 30;
    }

    const targetRep = target.globalReputation ?? 50;
    const reputationEffect = Math.round((targetRep / 100) * 15);

    const lostProvincesCount = TerritoryClaimsUtility.getOccupiedProvinceCount(
      source.id,
      target.id,
      occupiedTerritoryMap,
      provincesMap,
    );

    const revanchismPenalty = Math.min(25, lostProvincesCount * 12);

    const rawAlignment =
      baseAlignment +
      ideologyScore +
      commonEnemyBonus +
      reputationEffect -
      revanchismPenalty;
    const alignment = Math.max(-100, Math.min(100, rawAlignment));

    const myProvs =
      sourceProvinces ??
      NationGettersUtility.getOwnedProvinces(
        source.id,
        provincesMap,
        provincesByOwnerMap,
      );

    const isLandNeighbor = GeopoliticalReachResolver.hasDirectLandBorder(
      source,
      target,
      provincesMap,
      myProvs,
      provincesByOwnerMap,
    );

    const proximityTier = GeopoliticalReachResolver.getProximityTier(
      source,
      target,
      provincesMap,
      myProvs,
      provincesByOwnerMap,
    );

    const isNeighbor = proximityTier === "DIRECT_NEIGHBOR";
    const isNavalReachable =
      proximityTier === "DIRECT_NEIGHBOR" ||
      proximityTier === "REGIONAL_MARITIME" ||
      proximityTier === "DISTANT_OCEAN";

    let borderFriction = 0;
    if (proximityTier === "DIRECT_NEIGHBOR") {
      borderFriction = isLandNeighbor ? 30 : 20;
    } else if (proximityTier === "REGIONAL_MARITIME") {
      borderFriction = 12;
    }

    const sPower =
      sourcePower !== undefined
        ? sourcePower
        : Math.max(1, MilitaryPowerCalculator.calculateLandAndAirPower(source));

    let tPower = Math.max(
      1,
      MilitaryPowerCalculator.calculateLandAndAirPower(target),
    );

    if (target.securityGuarantorId && allNations) {
      const gCanonical = CountryRegistry.resolveCanonicalId(
        target.securityGuarantorId,
      );
      const guarantor =
        allNations[gCanonical] || allNations[target.securityGuarantorId];
      if (guarantor && guarantor.isAlive && guarantor.id !== source.id) {
        const guarantorTechMult =
          MilitaryPowerCalculator.calculateTechMultiplier(
            guarantor.military.techLevel,
          );
        const targetGdp =
          NationGettersUtility.getPopulation(target.id, provincesMap) * 5000;
        const auxiliaryPower = Math.floor(
          targetGdp * 0.3 * 0.000000001 * guarantorTechMult * 4,
        );
        tPower += auxiliaryPower;
      }
    }

    const powerRatio = Number((tPower / sPower).toFixed(2));

    let vulnerabilityBonus = 0;
    if (target.warFocusTargetId && target.warFocusTargetId !== source.id) {
      vulnerabilityBonus += 10;
    }
    if (target.government.stability < 35) {
      vulnerabilityBonus += 10;
    }

    const storedTension = rel ? (rel.tension ?? 10) : 10;
    let rawTension =
      Math.floor(storedTension * 0.4) +
      borderFriction +
      vulnerabilityBonus +
      revanchismPenalty;

    if (rel && rel.stance === "WAR") {
      rawTension = 100;
    } else if (rel && rel.stance === "STRATEGIC_PARTNERSHIP") {
      rawTension = 0;
    } else if (rel && rel.stance === "NON_AGGRESSION_PACT") {
      rawTension = Math.min(15, rawTension);
    }

    const tension = Math.max(0, Math.min(100, rawTension));

    let posture: DiplomaticPosture = "NEUTRAL_COEXISTENCE";
    if (alignment >= 25 && tension < 40) {
      posture = "NATURAL_ALLY";
    } else if (alignment < 0 && tension >= 45 && sPower >= tPower) {
      posture = "OPPORTUNISTIC_PREDATOR";
    } else if (alignment < 0 && tension >= 45 && sPower < tPower) {
      posture = "WARY_BUFFER";
    }

    const sourceReachTier = GeopoliticalReachResolver.getReachTier(
      source,
      allNations,
      provincesMap,
    );
    const targetReachTier = GeopoliticalReachResolver.getReachTier(
      target,
      allNations,
      provincesMap,
    );

    return {
      alignment,
      tension,
      posture,
      sourceReachTier,
      targetReachTier,
      proximityTier,
      isNeighbor,
      isLandNeighbor,
      isNavalReachable,
      powerRatio,
      lostProvincesCount,
      reasons: {
        ideologyScore,
        commonEnemyBonus,
        reputationEffect,
        borderFriction,
        revanchismPenalty,
      },
    };
  }
}
