export interface GroundEngagementInput {
  deployedArmor: number;
  deployedInfantry: number;
  defInfantry: number;
  defArmorAfterAirRaw: number;
  defArmorAfterAirEff: number;
  defArmorDestroyedByAir: number;
  attMult: number;
  defMult: number;
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
    const attArmorEff = input.deployedArmor * input.attMult;
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
      Math.ceil(tankTradeLossAttEff / input.attMult),
    );
    const defArmorLossGround = Math.min(
      input.defArmorAfterAirRaw,
      Math.ceil(tankTradeLossDefEff / input.defMult),
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

    const defInfantryTotalEff = input.defInfantry * input.defMult;
    const defInfantryKilledByTanksEff = Math.min(
      defInfantryTotalEff,
      survivingAttArmorEff * 3,
    );
    const defInfantryKilledByTanks = Math.min(
      input.defInfantry,
      Math.floor(defInfantryKilledByTanksEff / input.defMult),
    );
    const defInfRemainingAfterTanksRaw =
      input.defInfantry - defInfantryKilledByTanks;
    const defInfRemainingAfterTanksEff =
      defInfRemainingAfterTanksRaw * input.defMult;

    const attInfantryTotalEff = input.deployedInfantry * input.attMult;
    const attInfantryKilledByTanksEff = Math.min(
      attInfantryTotalEff,
      survivingDefArmorEff * 3,
    );
    const attInfantryKilledByTanks = Math.min(
      input.deployedInfantry,
      Math.floor(attInfantryKilledByTanksEff / input.attMult),
    );
    const attInfRemainingAfterTanksRaw =
      input.deployedInfantry - attInfantryKilledByTanks;
    const attInfRemainingAfterTanksEff =
      attInfRemainingAfterTanksRaw * input.attMult;

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
      Math.ceil(infTradeLossAttEff / input.attMult),
    );
    const defInfTradeLoss = Math.min(
      defInfRemainingAfterTanksRaw,
      Math.ceil(infTradeLossDefEff / input.defMult),
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
