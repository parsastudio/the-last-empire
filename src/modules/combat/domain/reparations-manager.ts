import type { Nation } from "@/modules/nation/schemas/nation.schema";

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
