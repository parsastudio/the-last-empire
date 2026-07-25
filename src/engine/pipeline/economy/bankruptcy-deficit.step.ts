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
      const hasReachedDebtLimit =
        this.bankruptcyManager.hasReachedDebtLimit(nation);
      const isDeficit = nation.treasury <= 0 && hasReachedDebtLimit;

      let consecutiveDeficitTurns = nation.consecutiveDeficitTurns;
      if (isDeficit) {
        consecutiveDeficitTurns += 1;
      } else {
        consecutiveDeficitTurns = 0;
      }

      let updated = {
        ...nation,
        consecutiveDeficitTurns,
      };

      if (consecutiveDeficitTurns >= 3) {
        const disintegrationResult = this.bankruptcyManager.applyDisintegration(
          updated,
          nations,
        );
        updated = disintegrationResult.updatedNation;
        for (const [neighId, neighNation] of Object.entries(
          disintegrationResult.updatedAllNations,
        )) {
          nations[neighId] = neighNation;
        }
      }

      if (this.bankruptcyManager.isBankrupt(updated)) {
        updated = this.bankruptcyManager.applyBankruptcy(updated);
      }

      nations[id] = updated;
    }
  }
}
