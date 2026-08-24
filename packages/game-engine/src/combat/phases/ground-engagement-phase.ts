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
    const tankTradeLossAttEff = Math.min(
      attArmorEff,
      input.defArmorAfterAirEff,
    );
    const tankTradeLossDefEff = Math.min(
      attArmorEff,
      input.defArmorAfterAirEff,
    );

    const rawAttArmorLoss = Math.min(
      input.deployedArmor,
      Math.ceil(tankTradeLossAttEff / input.attArmorMult),
    );
    const defArmorLossGround = Math.min(
      input.defArmorAfterAirRaw,
      Math.ceil(tankTradeLossDefEff / input.defArmorMult),
    );
    const rawDefArmorLost = input.defArmorDestroyedByAir + defArmorLossGround;

    const survivingAttArmorEff = Math.max(
      0,
      attArmorEff - input.defArmorAfterAirEff,
    );
    const survivingDefArmorEff = Math.max(
      0,
      input.defArmorAfterAirEff - attArmorEff,
    );

    const defInfantryTotalEff = input.defInfantry * input.defInfMult;
    const defInfantryKilledByTanksEff = Math.min(
      defInfantryTotalEff,
      survivingAttArmorEff * 3,
    );
    const defInfantryKilledByTanks = Math.min(
      input.defInfantry,
      Math.floor(defInfantryKilledByTanksEff / input.defInfMult),
    );
    const defInfRemainingAfterTanksRaw =
      input.defInfantry - defInfantryKilledByTanks;
    const defInfRemainingAfterTanksEff =
      defInfRemainingAfterTanksRaw * input.defInfMult;

    const attInfantryTotalEff = input.deployedInfantry * input.attInfMult;
    const attInfantryKilledByTanksEff = Math.min(
      attInfantryTotalEff,
      survivingDefArmorEff * 3,
    );
    const attInfantryKilledByTanks = Math.min(
      input.deployedInfantry,
      Math.floor(attInfantryKilledByTanksEff / input.attInfMult),
    );
    const attInfRemainingAfterTanksRaw =
      input.deployedInfantry - attInfantryKilledByTanks;
    const attInfRemainingAfterTanksEff =
      attInfRemainingAfterTanksRaw * input.attInfMult;

    const infTradeLossAttEff = Math.min(
      attInfRemainingAfterTanksEff,
      defInfRemainingAfterTanksEff,
    );
    const infTradeLossDefEff = Math.min(
      attInfRemainingAfterTanksEff,
      defInfRemainingAfterTanksEff,
    );

    const attInfTradeLoss = Math.min(
      attInfRemainingAfterTanksRaw,
      Math.ceil(infTradeLossAttEff / input.attInfMult),
    );
    const defInfTradeLoss = Math.min(
      defInfRemainingAfterTanksRaw,
      Math.ceil(infTradeLossDefEff / input.defInfMult),
    );

    const rawAttInfantryLost = attInfantryKilledByTanks + attInfTradeLoss;
    const rawDefInfantryLost = defInfantryKilledByTanks + defInfTradeLoss;

    const survivingAttInfantryRaw = input.deployedInfantry - rawAttInfantryLost;
    const survivingDefInfantryRaw = input.defInfantry - rawDefInfantryLost;

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
