export interface MissilePhaseInput {
  deployedDrones: number;
  defAirDefense: number;
  attDroneMult: number;
  defAdMult: number;
}

export interface MissilePhaseOutput {
  rawDefAirDefenseLost: number;
  defAirDefenseRemainingRaw: number;
  defAirDefenseRemainingEff: number;
}

export class MissileInterceptionPhase {
  public static calculate(input: MissilePhaseInput): MissilePhaseOutput {
    const attMissilesEff = input.deployedDrones * input.attDroneMult;
    const defAirDefenseEff = input.defAirDefense * input.defAdMult;

    const missilesInterceptedEff = Math.min(
      attMissilesEff,
      defAirDefenseEff * 2,
    );
    const missilesLeakedEff = Math.max(
      0,
      attMissilesEff - missilesInterceptedEff,
    );

    const airDefenseDestroyedEff = Math.floor(missilesLeakedEff * 0.5);
    const rawDefAirDefenseLost = Math.min(
      input.defAirDefense,
      Math.floor(airDefenseDestroyedEff / input.defAdMult),
    );
    const defAirDefenseRemainingRaw =
      input.defAirDefense - rawDefAirDefenseLost;
    const defAirDefenseRemainingEff =
      defAirDefenseRemainingRaw * input.defAdMult;

    return {
      rawDefAirDefenseLost,
      defAirDefenseRemainingRaw,
      defAirDefenseRemainingEff,
    };
  }
}
