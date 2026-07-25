import { Nation } from "@/domain/nation/nation.schema";
import { BankruptcyEvaluator } from "./bankruptcy/bankruptcy-evaluator";
import { BankruptcyApplier } from "./bankruptcy/bankruptcy-applier";
import { SovereignDisintegrationHandler } from "./bankruptcy/sovereign-disintegration.handler";

export class BankruptcyManager {
  private evaluator = new BankruptcyEvaluator();
  private applier = new BankruptcyApplier();
  private disintegrationHandler = new SovereignDisintegrationHandler();

  public hasReachedDebtLimit(nation: Nation): boolean {
    return this.evaluator.hasReachedDebtLimit(nation);
  }

  public isBankrupt(nation: Nation): boolean {
    return this.evaluator.hasReachedDebtLimit(nation);
  }

  public applyBankruptcy(nation: Nation): Nation {
    return this.applier.applyBankruptcy(nation);
  }

  public applyDisintegration(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): { updatedNation: Nation; updatedAllNations: Record<string, Nation> } {
    return this.disintegrationHandler.applyDisintegration(nation, allNations);
  }
}
