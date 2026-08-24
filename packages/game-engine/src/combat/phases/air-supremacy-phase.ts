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
    if (input.deployedAirForce === 0 && input.defAirForce === 0) {
      return {
        rawAttAirLoss: 0,
        rawDefAirLoss: 0,
        defArmorDestroyedByAir: 0,
        defArmorAfterAirRaw: input.defArmor,
        defArmorAfterAirEff: input.defArmor * input.defArmorMult,
      };
    }

    const attAirEff =
      input.deployedAirForce *
      input.attAirMult *
      (input.defenderEwBonus ? 0.8 : 1.0);
    const defAirEff = input.defAirForce * input.defAirMult;

    let rawAttAirLoss = 0;
    let rawDefAirLoss = 0;

    if (input.deployedAirForce > 0 && input.defAirForce > 0) {
      const totalAirEff = attAirEff + defAirEff;
      const attAttritionRate = Math.min(
        0.75,
        (defAirEff / (totalAirEff || 1)) * 0.85,
      );
      const defAttritionRate = Math.min(
        0.85,
        (attAirEff / (totalAirEff || 1)) * 0.95,
      );

      rawAttAirLoss = Math.min(
        input.deployedAirForce,
        Math.max(1, Math.round(input.deployedAirForce * attAttritionRate)),
      );
      rawDefAirLoss = Math.min(
        input.defAirForce,
        Math.max(1, Math.round(input.defAirForce * defAttritionRate)),
      );
    }

    const survivingAttAirRaw = Math.max(
      0,
      input.deployedAirForce - rawAttAirLoss,
    );
    const survivingAttAirEff = survivingAttAirRaw * input.attAirMult;

    const fightersSuppressedEff = Math.min(
      survivingAttAirEff,
      input.defAirDefenseRemainingEff * 1.5,
    );
    const freeAttAirEff = Math.max(
      0,
      survivingAttAirEff - fightersSuppressedEff,
    );

    const tanksDestroyedByAirEff = freeAttAirEff * 1.5;
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
      rawDefAirLoss,
      defArmorDestroyedByAir,
      defArmorAfterAirRaw,
      defArmorAfterAirEff,
    };
  }
}
