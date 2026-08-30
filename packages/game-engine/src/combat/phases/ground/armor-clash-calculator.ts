export interface ArmorClashResult {
  rawAttArmorLoss: number;
  rawDefArmorLost: number;
  survivingAttArmorEff: number;
  survivingDefArmorEff: number;
}

export class ArmorClashCalculator {
  public static calculateClash(
    deployedArmor: number,
    defArmorAfterAirRaw: number,
    defArmorAfterAirEff: number,
    defArmorDestroyedByAir: number,
    defInfantry: number,
    attArmorMult: number,
    defArmorMult: number,
    defInfMult: number,
  ): ArmorClashResult {
    const attArmorEff = deployedArmor * attArmorMult;
    const defArmorEff = defArmorAfterAirEff;

    let attArmorLossGround = 0;
    let defArmorLossGround = 0;

    if (deployedArmor > 0 && defArmorAfterAirRaw > 0) {
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
        deployedArmor,
        Math.max(1, Math.round(deployedArmor * attArmorAttrition)),
      );
      defArmorLossGround = Math.min(
        defArmorAfterAirRaw,
        Math.max(1, Math.round(defArmorAfterAirRaw * defArmorAttrition)),
      );
    } else if (deployedArmor > 0 && defInfantry > 0) {
      const antiTankFire = defInfantry * defInfMult * 0.15;
      attArmorLossGround = Math.min(
        deployedArmor,
        Math.round(antiTankFire / Math.max(0.1, attArmorMult)),
      );
    }

    const rawAttArmorLoss = attArmorLossGround;
    const rawDefArmorLost = defArmorDestroyedByAir + defArmorLossGround;

    const survivingAttArmorRaw = Math.max(0, deployedArmor - rawAttArmorLoss);
    const survivingAttArmorEff = survivingAttArmorRaw * attArmorMult;

    const survivingDefArmorRaw = Math.max(
      0,
      defArmorAfterAirRaw - defArmorLossGround,
    );
    const survivingDefArmorEff = survivingDefArmorRaw * defArmorMult;

    return {
      rawAttArmorLoss,
      rawDefArmorLost,
      survivingAttArmorEff,
      survivingDefArmorEff,
    };
  }
}
