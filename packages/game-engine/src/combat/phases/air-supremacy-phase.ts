export interface AirSupremacyPhaseInput {
  deployedAirForce: number;
  defAirForce: number;
  defArmor: number;
  attMult: number;
  defMult: number;
  defenderEwBonus: boolean;
  defAirDefenseRemainingEff: number;
}

export interface AirSupremacyPhaseOutput {
  rawAttAirLoss: number;
  rawDefAirLoss: number;
  defArmorDestroyedByAir: number;
  defArmorAfterAirRaw: number;
  defArmorAfterAirEff: number;
}

export class AirSupremacyPhase {
  public static calculate(
    input: AirSupremacyPhaseInput,
  ): AirSupremacyPhaseOutput {
    const attAirEff =
      input.deployedAirForce *
      input.attMult *
      (input.defenderEwBonus ? 0.8 : 1.0);
    const defAirEff = input.defAirForce * input.defMult;

    const dogfightLossAttEff = Math.min(attAirEff, defAirEff);
    const dogfightLossDefEff = Math.min(attAirEff, defAirEff);

    const rawAttAirLoss = Math.min(
      input.deployedAirForce,
      Math.ceil(dogfightLossAttEff / input.attMult),
    );
    const rawDefAirLoss = Math.min(
      input.defAirForce,
      Math.ceil(dogfightLossDefEff / input.defMult),
    );

    const survivingAttAirRaw = input.deployedAirForce - rawAttAirLoss;
    const survivingAttAirEff = survivingAttAirRaw * input.attMult;

    const fightersSuppressedEff = Math.min(
      survivingAttAirEff,
      input.defAirDefenseRemainingEff * 2,
    );
    const freeAttAirEff = Math.max(
      0,
      survivingAttAirEff - fightersSuppressedEff,
    );

    const tanksDestroyedByAirEff = freeAttAirEff * 2;
    const defArmorDestroyedByAir = Math.min(
      input.defArmor,
      Math.floor(tanksDestroyedByAirEff / input.defMult),
    );
    const defArmorAfterAirRaw = input.defArmor - defArmorDestroyedByAir;
    const defArmorAfterAirEff = defArmorAfterAirRaw * input.defMult;

    return {
      rawAttAirLoss,
      rawDefAirLoss,
      defArmorDestroyedByAir,
      defArmorAfterAirRaw,
      defArmorAfterAirEff,
    };
  }
}
