export interface InfantryEngagementResult {
  rawAttInfantryLost: number;
  rawDefInfantryLost: number;
  isAttackerVictory: boolean;
}

export class InfantryEngagementCalculator {
  public static calculateEngagement(
    deployedInfantry: number,
    defInfantry: number,
    survivingAttArmorEff: number,
    survivingDefArmorEff: number,
    attInfMult: number,
    defInfMult: number,
  ): InfantryEngagementResult {
    const defInfTotalEff = defInfantry * defInfMult;
    const defInfantryKilledByTanksEff = Math.min(
      defInfTotalEff,
      survivingAttArmorEff * 2.5,
    );
    const defInfantryKilledByTanks = Math.min(
      defInfantry,
      Math.floor(defInfantryKilledByTanksEff / Math.max(0.1, defInfMult)),
    );
    const defInfRemainingAfterTanksRaw = Math.max(
      0,
      defInfantry - defInfantryKilledByTanks,
    );
    const defInfRemainingAfterTanksEff =
      defInfRemainingAfterTanksRaw * defInfMult;

    const attInfTotalEff = deployedInfantry * attInfMult;
    const attInfantryKilledByTanksEff = Math.min(
      attInfTotalEff,
      survivingDefArmorEff * 2.5,
    );
    const attInfantryKilledByTanks = Math.min(
      deployedInfantry,
      Math.floor(attInfantryKilledByTanksEff / Math.max(0.1, attInfMult)),
    );
    const attInfRemainingAfterTanksRaw = Math.max(
      0,
      deployedInfantry - attInfantryKilledByTanks,
    );
    const attInfRemainingAfterTanksEff =
      attInfRemainingAfterTanksRaw * attInfMult;

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
      deployedInfantry,
      attInfantryKilledByTanks + attInfTradeLoss,
    );
    const rawDefInfantryLost = Math.min(
      defInfantry,
      defInfantryKilledByTanks + defInfTradeLoss,
    );

    const survivingAttInfantryRaw = Math.max(
      0,
      deployedInfantry - rawAttInfantryLost,
    );
    const survivingDefInfantryRaw = Math.max(
      0,
      defInfantry - rawDefInfantryLost,
    );

    const isAttackerVictory =
      survivingAttInfantryRaw > 0 &&
      (survivingAttInfantryRaw > survivingDefInfantryRaw ||
        survivingDefInfantryRaw === 0);

    return {
      rawAttInfantryLost,
      rawDefInfantryLost,
      isAttackerVictory,
    };
  }
}
