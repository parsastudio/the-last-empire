import type { Nation } from "@/core/types/nation.types";

export class ReparationsManager {
  public processReparationTurn(
    payer: Nation,
    receiverId: string,
    amount: number,
  ): Nation {
    const actualPayment = Math.min(payer.treasury, amount);

    return {
      ...payer,
      treasury: payer.treasury - actualPayment,
    };
  }
}
