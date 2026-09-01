export interface MissilePhaseInput {
  deployedDrones: number;
  defAirDefense: number;
  attDroneMult: number;
  defAdMult: number;
  targetFactoriesCount?: number;
}

export interface MissilePhaseOutput {
  rawDefAirDefenseLost: number;
  defAirDefenseRemainingRaw: number;
  defAirDefenseRemainingEff: number;
  destroyedFactories: number;
  interceptedMissiles: number;
}

export class MissileInterceptionPhase {
  public static calculate(input: MissilePhaseInput): MissilePhaseOutput {
    if (input.deployedDrones <= 0) {
      return {
        rawDefAirDefenseLost: 0,
        defAirDefenseRemainingRaw: input.defAirDefense,
        defAirDefenseRemainingEff: input.defAirDefense * input.defAdMult,
        destroyedFactories: 0,
        interceptedMissiles: 0,
      };
    }

    const attMissilesEff = input.deployedDrones * input.attDroneMult;
    const defAirDefenseEff = input.defAirDefense * input.defAdMult;

    if (input.defAirDefense <= 0) {
      const maxPossibleFactories = Math.floor(input.deployedDrones / 12);
      const destroyedFactories = Math.min(
        maxPossibleFactories,
        Math.floor(attMissilesEff / (12 * input.attDroneMult)),
      );
      return {
        rawDefAirDefenseLost: 0,
        defAirDefenseRemainingRaw: 0,
        defAirDefenseRemainingEff: 0,
        destroyedFactories,
        interceptedMissiles: 0,
      };
    }

    const interceptionRate = Math.max(
      0.1,
      Math.min(
        0.9,
        defAirDefenseEff / (defAirDefenseEff + 0.5 * attMissilesEff),
      ),
    );

    const rawIntercepted = Math.min(
      input.deployedDrones,
      Math.round(input.deployedDrones * interceptionRate),
    );
    const rawPenetrated = Math.max(0, input.deployedDrones - rawIntercepted);
    const penetratingPower = rawPenetrated * input.attDroneMult;

    const adSuppressionCostPerUnit = 2 * input.defAdMult;
    const powerNeededToClearAllAD =
      input.defAirDefense * adSuppressionCostPerUnit;

    let rawDefAirDefenseLost = 0;
    let surplusPenetratingPower = 0;

    if (penetratingPower <= powerNeededToClearAllAD) {
      rawDefAirDefenseLost = Math.min(
        input.defAirDefense,
        Math.floor(penetratingPower / adSuppressionCostPerUnit),
      );
      surplusPenetratingPower = 0;
    } else {
      rawDefAirDefenseLost = input.defAirDefense;
      surplusPenetratingPower = penetratingPower - powerNeededToClearAllAD;
    }

    const defAirDefenseRemainingRaw = Math.max(
      0,
      input.defAirDefense - rawDefAirDefenseLost,
    );
    const defAirDefenseRemainingEff =
      defAirDefenseRemainingRaw * input.defAdMult;

    const rawSurplusMissiles = Math.max(
      0,
      Math.floor(surplusPenetratingPower / Math.max(0.1, input.attDroneMult)),
    );

    const destroyedFactories = Math.min(
      Math.floor(input.deployedDrones / 12),
      Math.floor(rawSurplusMissiles / 12),
    );

    return {
      rawDefAirDefenseLost,
      defAirDefenseRemainingRaw,
      defAirDefenseRemainingEff,
      destroyedFactories,
      interceptedMissiles: rawIntercepted,
    };
  }
}
