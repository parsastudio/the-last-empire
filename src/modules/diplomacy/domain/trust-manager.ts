import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { RelationProfile } from "@/modules/diplomacy/schemas/diplomacy.schema";

export class TrustManager {
  public updateTrustAndTension(
    nation: Nation,
    target: Nation,
    relation: RelationProfile,
  ): RelationProfile {
    let trustDelta = 0;
    let tensionDelta = 0;

    if (relation.stance === "ALLIANCE") {
      trustDelta += 1.5;
      tensionDelta -= 1.0;
    } else if (relation.stance === "DEFENSIVE_PACT") {
      trustDelta += 1.5;
      tensionDelta -= 1.0;
    } else if (relation.stance === "NON_AGGRESSION_PACT") {
      trustDelta += 1.0;
      tensionDelta -= 0.5;
    } else if (relation.stance === "WAR" || relation.stance === "EMBARGO") {
      trustDelta -= 5;
      tensionDelta += 4.0;
    } else {
      trustDelta += 0.2;
    }

    if (nation.geography.landNeighbors.includes(target.id)) {
      tensionDelta += 0.5;
    }

    const ownPower =
      nation.military.infantry * 1.0 +
      nation.military.airForce * 3.0 +
      nation.military.navy * 2.0 +
      nation.military.droneMissile * 2.5;

    const targetPower =
      target.military.infantry * 1.0 +
      target.military.airForce * 3.0 +
      target.military.navy * 2.0 +
      target.military.droneMissile * 2.5;

    const ratio = targetPower / (ownPower || 1);
    if (ratio > 1.8 && relation.stance !== "ALLIANCE") {
      tensionDelta += 1.0;
    }

    const nextTrust = Math.max(
      -100,
      Math.min(100, relation.trust + trustDelta),
    );
    const nextTension = Math.max(
      0,
      Math.min(100, relation.tension + tensionDelta),
    );

    return {
      ...relation,
      trust: Number(nextTrust.toFixed(2)),
      tension: Number(nextTension.toFixed(2)),
    };
  }
}
