import {
  Nation,
  Province,
  DiplomaticPosture,
  CountryRegistry,
  NationRelationResolver,
  GeopoliticalReachResolver,
  MilitaryPowerCalculator,
  NationGettersUtility,
} from "@geopolitics/domain";

export interface GeopoliticalVector {
  alignment: number;
  tension: number;
  posture: DiplomaticPosture;
  isNeighbor: boolean;
  isLandNeighbor: boolean;
  isNavalReachable: boolean;
  powerRatio: number;
  reasons: {
    ideologyScore: number;
    commonEnemyBonus: number;
    reputationEffect: number;
    borderFriction: number;
    grudgePenalty: number;
    powerImbalance: number;
  };
}

export class GeopoliticalVectorCalculator {
  public static calculate(
    source: Nation,
    target: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    sourceProvinces?: Province[],
  ): GeopoliticalVector {
    const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
    const rel =
      source.relations[canonicalTarget] || source.relations[target.id];

    const opinion = rel ? rel.opinion : 0;
    const grudge = rel ? (rel.grudge ?? 0) : 0;
    const lostProvinces = rel ? (rel.lostProvincesCount ?? 0) : 0;

    let ideologyScore = 0;
    const sGov = source.government.type;
    const tGov = target.government.type;

    if (sGov === tGov) {
      ideologyScore = 15;
    } else if (
      (sGov === "DEMOCRACY" &&
        (tGov === "DICTATORSHIP" ||
          tGov === "FASCISM" ||
          tGov === "COMMUNISM")) ||
      (tGov === "DEMOCRACY" &&
        (sGov === "DICTATORSHIP" || sGov === "FASCISM" || sGov === "COMMUNISM"))
    ) {
      ideologyScore = -15;
    } else {
      ideologyScore = 5;
    }

    let commonEnemyBonus = 0;
    if (
      allNations &&
      NationRelationResolver.hasCommonEnemy(source, target, allNations)
    ) {
      commonEnemyBonus = 30;
    }

    const targetRep = target.globalReputation ?? 50;
    const reputationEffect = Math.round((targetRep / 100) * 15);

    const rawAlignment =
      opinion + ideologyScore + commonEnemyBonus + reputationEffect;
    const alignment = Math.max(-100, Math.min(100, rawAlignment));

    const myProvs =
      sourceProvinces ??
      NationGettersUtility.getOwnedProvinces(source.id, provincesMap);

    const isLandNeighbor = GeopoliticalReachResolver.hasDirectLandBorder(
      source,
      target,
      provincesMap,
      myProvs,
    );

    const isImmediateSeaNeighbor =
      GeopoliticalReachResolver.isImmediateMaritimeNeighbor(
        source,
        target,
        provincesMap,
        myProvs,
      );

    const sourceSea = NationGettersUtility.hasSeaAccess(
      source.id,
      provincesMap,
      myProvs,
    );
    const targetSea = NationGettersUtility.hasSeaAccess(
      target.id,
      provincesMap,
    );
    const isNavalReachable = Boolean(sourceSea && targetSea);

    const isNeighbor = isLandNeighbor || isImmediateSeaNeighbor;

    let borderFriction = 0;
    if (isLandNeighbor) {
      borderFriction = 30;
    } else if (isImmediateSeaNeighbor) {
      borderFriction = 20;
    } else if (isNavalReachable) {
      borderFriction = 10;
    }

    const grudgePenalty = Math.min(
      40,
      lostProvinces * 20 + Math.round(grudge * 0.4),
    );

    const sPower = Math.max(
      1,
      MilitaryPowerCalculator.calculateLandAndAirPower(source),
    );
    const tPower = Math.max(
      1,
      MilitaryPowerCalculator.calculateLandAndAirPower(target),
    );
    const powerRatio = Number((tPower / sPower).toFixed(2));

    let powerImbalance = 0;
    if (powerRatio < 0.7) {
      powerImbalance = Math.min(30, Math.round((1.0 - powerRatio) * 40));
    } else if (powerRatio > 1.3) {
      powerImbalance = Math.min(25, Math.round((powerRatio - 1.0) * 20));
    }

    let vulnerabilityBonus = 0;
    if (target.warFocusTargetId && target.warFocusTargetId !== source.id) {
      vulnerabilityBonus += 15;
    }
    if (target.government.stability < 35) {
      vulnerabilityBonus += 15;
    }

    let rawTension =
      borderFriction + grudgePenalty + powerImbalance + vulnerabilityBonus;
    if (rel && rel.stance === "WAR") {
      rawTension += 30;
    } else if (rel && rel.stance === "ALLIANCE") {
      rawTension = Math.max(0, rawTension - 40);
    } else if (rel && rel.stance === "NON_AGGRESSION_PACT") {
      rawTension = Math.max(0, rawTension - 25);
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

    return {
      alignment,
      tension,
      posture,
      isNeighbor,
      isLandNeighbor,
      isNavalReachable,
      powerRatio,
      reasons: {
        ideologyScore,
        commonEnemyBonus,
        reputationEffect,
        borderFriction,
        grudgePenalty,
        powerImbalance,
      },
    };
  }
}
