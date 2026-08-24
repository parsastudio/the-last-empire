export interface GroundEngagementInput {
  deployedArmor: number;
  deployedInfantry: number;
  defInfantry: number;
  defArmorAfterAirRaw: number;
  defArmorAfterAirEff: number;
  defArmorDestroyedByAir: number;
  attArmorMult: number;
  attInfMult: number;
  defArmorMult: number;
  defInfMult: number;
}

export interface GroundEngagementOutput {
  rawAttArmorLoss: number;
  rawDefArmorLost: number;
  rawAttInfantryLost: number;
  rawDefInfantryLost: number;
  survivingAttInfantryRaw: number;
  survivingDefInfantryRaw: number;
  isAttackerVictory: boolean;
}

export class GroundEngagementPhase {
  public static calculate(
    input: GroundEngagementInput,
  ): GroundEngagementOutput {
    const attArmorEff = input.deployedArmor * input.attArmorMult;
    const defArmorEff = input.defArmorAfterAirEff;

    let attArmorLossGround = 0;
    let defArmorLossGround = 0;

    if (input.deployedArmor > 0 && input.defArmorAfterAirRaw > 0) {
      const totalArmorEff = attArmorEff + defArmorEff;
      const attArmorAttrition = Math.min(
        0.8,
        (defArmorEff / (totalArmorEff || 1)) * 0.9,
      );
      const defArmorAttrition = Math.min(
        0.9,
        (attArmorEff / (totalArmorEff || 1)) * 0.95,
      );

      attArmorLossGround = Math.min(
        input.deployedArmor,
        Math.max(1, Math.round(input.deployedArmor * attArmorAttrition)),
      );
      defArmorLossGround = Math.min(
        input.defArmorAfterAirRaw,
        Math.max(1, Math.round(input.defArmorAfterAirRaw * defArmorAttrition)),
      );
    } else if (input.deployedArmor > 0 && input.defInfantry > 0) {
      const antiTankFire = input.defInfantry * input.defInfMult * 0.15;
      attArmorLossGround = Math.min(
        input.deployedArmor,
        Math.round(antiTankFire / Math.max(0.1, input.attArmorMult)),
      );
    }

    const rawAttArmorLoss = attArmorLossGround;
    const rawDefArmorLost = input.defArmorDestroyedByAir + defArmorLossGround;

    const survivingAttArmorRaw = Math.max(
      0,
      input.deployedArmor - rawAttArmorLoss,
    );
    const survivingAttArmorEff = survivingAttArmorRaw * input.attArmorMult;

    const survivingDefArmorRaw = Math.max(
      0,
      input.defArmorAfterAirRaw - defArmorLossGround,
    );
    const survivingDefArmorEff = survivingDefArmorRaw * input.defArmorMult;

    const defInfTotalEff = input.defInfantry * input.defInfMult;
    const defInfantryKilledByTanksEff = Math.min(
      defInfTotalEff,
      survivingAttArmorEff * 2.5,
    );
    const defInfantryKilledByTanks = Math.min(
      input.defInfantry,
      Math.floor(defInfantryKilledByTanksEff / Math.max(0.1, input.defInfMult)),
    );
    const defInfRemainingAfterTanksRaw = Math.max(
      0,
      input.defInfantry - defInfantryKilledByTanks,
    );
    const defInfRemainingAfterTanksEff =
      defInfRemainingAfterTanksRaw * input.defInfMult;

    const attInfTotalEff = input.deployedInfantry * input.attInfMult;
    const attInfantryKilledByTanksEff = Math.min(
      attInfTotalEff,
      survivingDefArmorEff * 2.5,
    );
    const attInfantryKilledByTanks = Math.min(
      input.deployedInfantry,
      Math.floor(attInfantryKilledByTanksEff / Math.max(0.1, input.attInfMult)),
    );
    const attInfRemainingAfterTanksRaw = Math.max(
      0,
      input.deployedInfantry - attInfantryKilledByTanks,
    );
    const attInfRemainingAfterTanksEff =
      attInfRemainingAfterTanksRaw * input.attInfMult;

    let attInfTradeLoss = 0;
    let defInfTradeLoss = 0;

    if (attInfRemainingAfterTanksRaw > 0 && defInfRemainingAfterTanksRaw > 0) {
      const totalInfEff =
        attInfRemainingAfterTanksEff + defInfRemainingAfterTanksEff;
      const attInfAttrition = Math.min(
        0.9,
        (defInfRemainingAfterTanksEff / (totalInfEff || 1)) * 0.95,
      );
      const defInfAttrition = Math.min(
        0.9,
        (attInfRemainingAfterTanksEff / (totalInfEff || 1)) * 0.95,
      );

      attInfTradeLoss = Math.min(
        attInfRemainingAfterTanksRaw,
        Math.max(1, Math.round(attInfRemainingAfterTanksRaw * attInfAttrition)),
      );
      defInfTradeLoss = Math.min(
        defInfRemainingAfterTanksRaw,
        Math.max(1, Math.round(defInfRemainingAfterTanksRaw * defInfAttrition)),
      );
    }

    const rawAttInfantryLost = Math.min(
      input.deployedInfantry,
      attInfantryKilledByTanks + attInfTradeLoss,
    );
    const rawDefInfantryLost = Math.min(
      input.defInfantry,
      defInfantryKilledByTanks + defInfTradeLoss,
    );

    const survivingAttInfantryRaw = Math.max(
      0,
      input.deployedInfantry - rawAttInfantryLost,
    );
    const survivingDefInfantryRaw = Math.max(
      0,
      input.defInfantry - rawDefInfantryLost,
    );

    const isAttackerVictory =
      survivingAttInfantryRaw > 0 &&
      (survivingAttInfantryRaw > survivingDefInfantryRaw ||
        survivingDefInfantryRaw === 0);

    return {
      rawAttArmorLoss,
      rawDefArmorLost,
      rawAttInfantryLost,
      rawDefInfantryLost,
      survivingAttInfantryRaw,
      survivingDefInfantryRaw,
      isAttackerVictory,
    };
  }
}
