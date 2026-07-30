export interface ForceEstimatorInput {
  infantry: number;
  airForce: number;
  droneMissile: number;
  distanceMultiplier?: number;
  distanceScore?: number;
}

export interface ForceEstimatorOutput {
  landTransitCost: number;
  heavyTransitCost: number;
  estimatedMoneyCost: number;
  requiredOil: number;
  infantryOil: number;
  airForceOil: number;
  droneOil: number;
  requiredSteel: number;
  distanceKm: number;
}

export class AttackForceEstimator {
  public calculateLogisticsCost(
    input: ForceEstimatorInput,
  ): ForceEstimatorOutput {
    const {
      infantry,
      airForce,
      droneMissile,
      distanceMultiplier = 1.0,
      distanceScore = 30,
    } = input;

    const distanceKm = Math.max(30, Math.round(distanceScore));

    const baseLandCost = infantry * 15;
    const landTransitCost = Math.floor(baseLandCost * distanceMultiplier);

    const baseHeavyCost = airForce * 45 + droneMissile * 60;
    const heavyTransitCost = Math.floor(baseHeavyCost * distanceMultiplier);

    const estimatedMoneyCost = Math.max(
      1000,
      landTransitCost + heavyTransitCost,
    );

    const infantryOil = Math.ceil(infantry * 0.1 * (distanceKm / 100));
    const airForceOil = Math.ceil(airForce * 1.5 * (distanceKm / 100));
    const droneOil = Math.ceil(droneMissile * 2.0 * (distanceKm / 100));

    const requiredOil = Math.max(10, infantryOil + airForceOil + droneOil);

    return {
      landTransitCost,
      heavyTransitCost,
      estimatedMoneyCost,
      requiredOil,
      infantryOil,
      airForceOil,
      droneOil,
      requiredSteel: 0,
      distanceKm,
    };
  }
}
