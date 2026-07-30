export interface ForceEstimatorInput {
  infantry: number;
  airForce: number;
  droneMissile: number;
  isLandAttack?: boolean;
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
      isLandAttack = true,
      distanceMultiplier = 1.0,
      distanceScore = 30,
    } = input;

    const distanceKm = Math.max(30, Math.round(distanceScore));

    const baseLandCost = infantry * 12;
    const landTransitCost = Math.floor(baseLandCost * distanceMultiplier);

    const heavyUnitRate = isLandAttack ? 20 : 45;
    const droneUnitRate = isLandAttack ? 25 : 60;

    const baseHeavyCost =
      airForce * heavyUnitRate + droneMissile * droneUnitRate;
    const heavyTransitCost = Math.floor(baseHeavyCost * distanceMultiplier);

    const estimatedMoneyCost = Math.max(
      500,
      landTransitCost + heavyTransitCost,
    );

    const distanceFactor = Math.max(0.2, distanceKm / 100);
    const infantryOil = Math.ceil(infantry * 0.1 * distanceFactor);
    const airForceOil = Math.ceil(airForce * 1.2 * distanceFactor);
    const droneOil = Math.ceil(droneMissile * 1.5 * distanceFactor);

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
