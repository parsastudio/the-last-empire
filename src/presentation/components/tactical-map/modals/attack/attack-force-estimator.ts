export interface ForceEstimatorInput {
  infantry: number;
  airForce: number;
  droneMissile: number;
  distanceMultiplier?: number;
}

export interface ForceEstimatorOutput {
  estimatedMoneyCost: number;
  requiredOil: number;
  requiredSteel: number;
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
    } = input;

    const baseTransitCost =
      infantry * 150 + airForce * 800 + droneMissile * 1200;
    const estimatedMoneyCost = Math.floor(baseTransitCost * distanceMultiplier);

    const requiredOil = Math.ceil(
      (airForce * 2 + droneMissile * 3) * distanceMultiplier,
    );
    const requiredSteel = Math.ceil(droneMissile * 1.5);

    return {
      estimatedMoneyCost: Math.max(1000, estimatedMoneyCost),
      requiredOil: Math.max(10, requiredOil),
      requiredSteel,
    };
  }
}
