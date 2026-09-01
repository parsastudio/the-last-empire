export interface AirSupremacyPhaseInput {
  deployedAirForce: number;
  defAirForce: number;
  defArmor: number;
  attAirMult: number;
  defAirMult: number;
  defArmorMult: number;
  defAirDefenseRemainingRaw: number;
}

export interface AirSupremacyPhaseOutput {
  rawAttAirLoss: number;
  attAirLostToDogfight: number;
  attAirLostToAirDefense: number;
  rawDefAirLoss: number;
  defArmorDestroyedByAir: number;
  defArmorAfterAirRaw: number;
  defArmorAfterAirEff: number;
}

export class AirSupremacyPhase {
  public static calculate(
    input: AirSupremacyPhaseInput,
  ): AirSupremacyPhaseOutput {
    if (input.deployedAirForce === 0 && input.defAirForce === 0) {
      return {
        rawAttAirLoss: 0,
        attAirLostToDogfight: 0,
        attAirLostToAirDefense: 0,
        rawDefAirLoss: 0,
        defArmorDestroyedByAir: 0,
        defArmorAfterAirRaw: input.defArmor,
        defArmorAfterAirEff: input.defArmor * input.defArmorMult,
      };
    }

    let dogfightAttAirLoss = 0;
    let rawDefAirLoss = 0;

    if (input.deployedAirForce > 0 && input.defAirForce > 0) {
      const attAirEff = input.deployedAirForce * input.attAirMult;
      const defAirEff = input.defAirForce * input.defAirMult;
      const totalAirEff = attAirEff + defAirEff;

      const attAttritionRate = Math.min(
        0.75,
        (defAirEff / (totalAirEff || 1)) * 0.85,
      );
      const defAttritionRate = Math.min(
        0.85,
        (attAirEff / (totalAirEff || 1)) * 0.95,
      );

      dogfightAttAirLoss = Math.min(
        input.deployedAirForce,
        Math.max(1, Math.round(input.deployedAirForce * attAttritionRate)),
      );
      rawDefAirLoss = Math.min(
        input.defAirForce,
        Math.max(1, Math.round(input.defAirForce * defAttritionRate)),
      );
    }

    const survivingAttAirAfterDogfight = Math.max(
      0,
      input.deployedAirForce - dogfightAttAirLoss,
    );

    const adAttAirLoss = Math.min(
      survivingAttAirAfterDogfight,
      Math.floor(input.defAirDefenseRemainingRaw / 2),
    );

    const rawAttAirLoss = dogfightAttAirLoss + adAttAirLoss;
    const finalSurvivingAttAirRaw = Math.max(
      0,
      survivingAttAirAfterDogfight - adAttAirLoss,
    );
    const finalSurvivingAttAirEff = finalSurvivingAttAirRaw * input.attAirMult;

    const tanksDestroyedByAirEff = finalSurvivingAttAirEff * 2.0;
    const defArmorDestroyedByAir = Math.min(
      input.defArmor,
      Math.floor(tanksDestroyedByAirEff / Math.max(0.1, input.defArmorMult)),
    );
    const defArmorAfterAirRaw = Math.max(
      0,
      input.defArmor - defArmorDestroyedByAir,
    );
    const defArmorAfterAirEff = defArmorAfterAirRaw * input.defArmorMult;

    return {
      rawAttAirLoss,
      attAirLostToDogfight: dogfightAttAirLoss,
      attAirLostToAirDefense: adAttAirLoss,
      rawDefAirLoss,
      defArmorDestroyedByAir,
      defArmorAfterAirRaw,
      defArmorAfterAirEff,
    };
  }
}
