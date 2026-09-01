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
      const maxDestroyableFactories = input.targetFactoriesCount ?? 999;
      const destroyedFactories = Math.min(
        maxDestroyableFactories,
        Math.floor(attMissilesEff / 6),
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
      0.15,
      Math.min(
        0.85,
        defAirDefenseEff / (defAirDefenseEff + 0.5 * attMissilesEff),
      ),
    );

    const interceptedMissiles = Math.floor(attMissilesEff * interceptionRate);
    const leakedMissiles = Math.max(0, attMissilesEff - interceptedMissiles);

    const rawDefAirDefenseLost = Math.min(
      input.defAirDefense,
      Math.floor(leakedMissiles / (2 * input.defAdMult)),
    );

    const defAirDefenseRemainingRaw = Math.max(
      0,
      input.defAirDefense - rawDefAirDefenseLost,
    );
    const defAirDefenseRemainingEff =
      defAirDefenseRemainingRaw * input.defAdMult;

    const maxDestroyableFactories = input.targetFactoriesCount ?? 999;
    const destroyedFactories = Math.min(
      maxDestroyableFactories,
      Math.floor(leakedMissiles / 6),
    );

    return {
      rawDefAirDefenseLost,
      defAirDefenseRemainingRaw,
      defAirDefenseRemainingEff,
      destroyedFactories,
      interceptedMissiles,
    };
  }
}
