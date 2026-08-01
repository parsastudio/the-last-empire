import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { BankruptcyManager } from "@/engine/economy/bankruptcy-manager";

export class BankruptcyDeficitStep implements EconomyStep {
  private bankruptcyManager = new BankruptcyManager();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }

      if (this.bankruptcyManager.isBankrupt(nation)) {
        nations[id] = this.bankruptcyManager.applyBankruptcy(nation);
      }
    }
  }
}
