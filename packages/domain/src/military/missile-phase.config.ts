export interface MissilePhaseConfig {
  readonly dronesPerFactory: number;
  readonly minInterceptionRate: number;
  readonly maxInterceptionRate: number;
  readonly attackEffectivenessWeight: number;
  readonly adSuppressionCostBaseFactor: number;
  readonly minDroneMultiplierFloor: number;
}

export const DEFAULT_MISSILE_PHASE_CONFIG: MissilePhaseConfig = Object.freeze({
  dronesPerFactory: 12,
  minInterceptionRate: 0.1,
  maxInterceptionRate: 0.95,
  attackEffectivenessWeight: 0.5,
  adSuppressionCostBaseFactor: 2,
  minDroneMultiplierFloor: 0.1,
});
