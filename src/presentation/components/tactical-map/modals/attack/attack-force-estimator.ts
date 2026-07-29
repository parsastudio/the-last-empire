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

    const distanceKm = Math.max(120, Math.round(distanceScore * 18));

    const baseLandCost = infantry * 120;
    const landTransitCost = Math.floor(baseLandCost * distanceMultiplier);

    const baseHeavyCost = airForce * 750 + droneMissile * 1100;
    const heavyTransitCost = Math.floor(baseHeavyCost * distanceMultiplier);

    const estimatedMoneyCost = Math.max(
      1000,
      landTransitCost + heavyTransitCost,
    );

    const infantryOil = Math.ceil(infantry * 0.1 * distanceMultiplier);
    const airForceOil = Math.ceil(airForce * 2.0 * distanceMultiplier);
    const droneOil = Math.ceil(droneMissile * 3.0 * distanceMultiplier);

    const requiredOil = Math.max(10, infantryOil + airForceOil + droneOil);
    const requiredSteel = Math.ceil(droneMissile * 1.5);

    return {
      landTransitCost,
      heavyTransitCost,
      estimatedMoneyCost,
      requiredOil,
      infantryOil,
      airForceOil,
      droneOil,
      requiredSteel,
      distanceKm,
    };
  }
}
