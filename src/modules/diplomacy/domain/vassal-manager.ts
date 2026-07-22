import type { Nation } from "@/core/types/nation.types";

export interface VassalTributeResult {
  vassalUpdated: Nation;
  overlordTreasuryGain: number;
}

export class VassalManager {
  private readonly vassalTributeRate = 0.15;

  public processVassalTribute(vassal: Nation): VassalTributeResult {
    const tributeAmount = Math.floor(vassal.gdp * this.vassalTributeRate);
    const actualTransfer = Math.min(vassal.treasury, tributeAmount);

    const vassalUpdated: Nation = {
      ...vassal,
      treasury: vassal.treasury - actualTransfer,
    };

    return {
      vassalUpdated,
      overlordTreasuryGain: actualTransfer,
    };
  }
}
