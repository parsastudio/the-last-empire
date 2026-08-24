export interface AirSupremacyPhaseInput {
  deployedAirForce: number;
  defAirForce: number;
  defArmor: number;
  attAirMult: number;
  defAirMult: number;
  defArmorMult: number;
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
      input.attAirMult *
      (input.defenderEwBonus ? 0.8 : 1.0);
    const defAirEff = input.defAirForce * input.defAirMult;

    const dogfightLossAttEff = Math.min(attAirEff, defAirEff);
    const dogfightLossDefEff = Math.min(attAirEff, defAirEff);

    const rawAttAirLoss = Math.min(
      input.deployedAirForce,
      Math.ceil(dogfightLossAttEff / input.attAirMult),
    );
    const rawDefAirLoss = Math.min(
      input.defAirForce,
      Math.ceil(dogfightLossDefEff / input.defAirMult),
    );

    const survivingAttAirRaw = input.deployedAirForce - rawAttAirLoss;
    const survivingAttAirEff = survivingAttAirRaw * input.attAirMult;

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
      Math.floor(tanksDestroyedByAirEff / input.defArmorMult),
    );
    const defArmorAfterAirRaw = input.defArmor - defArmorDestroyedByAir;
    const defArmorAfterAirEff = defArmorAfterAirRaw * input.defArmorMult;

    return {
      rawAttAirLoss,
      rawDefAirLoss,
      defArmorDestroyedByAir,
      defArmorAfterAirRaw,
      defArmorAfterAirEff,
    };
  }
}
