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
}
