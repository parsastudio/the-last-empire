import { DilemmaEffect } from "@/domain/events/dilemma.schema";

export class DilemmaCalculator {
  public static resolveTreasuryDelta(
    effect: Pick<DilemmaEffect, "treasuryDelta" | "treasuryGdpPercent">,
    nationGdp: number,
  ): number {
    if (
      effect.treasuryGdpPercent !== undefined &&
      effect.treasuryGdpPercent !== 0
    ) {
      return Math.floor(nationGdp * effect.treasuryGdpPercent);
    }
    return effect.treasuryDelta || 0;
  }

  public static resolveNationalDebtDelta(
    effect: Pick<DilemmaEffect, "nationalDebtDelta" | "nationalDebtGdpPercent">,
    nationGdp: number,
  ): number {
    if (
      effect.nationalDebtGdpPercent !== undefined &&
      effect.nationalDebtGdpPercent !== 0
    ) {
      return Math.floor(nationGdp * effect.nationalDebtGdpPercent);
    }
    return effect.nationalDebtDelta || 0;
  }
}
