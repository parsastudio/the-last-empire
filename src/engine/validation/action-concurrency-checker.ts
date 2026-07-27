import type { GameAction } from "@/domain/game/action.schema";
import { MilitaryConcurrencyRules } from "./rules/military-concurrency-rules";
import { FinancialConcurrencyRules } from "./rules/financial-concurrency-rules";
import { DiplomaticConcurrencyRules } from "./rules/diplomatic-concurrency-rules";
import { EconomicConcurrencyRules } from "./rules/economic-concurrency-rules";

export class ActionConcurrencyChecker {
  private militaryRules = new MilitaryConcurrencyRules();
  private financialRules = new FinancialConcurrencyRules();
  private diplomaticRules = new DiplomaticConcurrencyRules();
  private economicRules = new EconomicConcurrencyRules();

  public verifyConcurrencies(
    actionList: GameAction[],
    newAction: GameAction,
  ): void {
    this.militaryRules.verify(actionList, newAction);
    this.financialRules.verify(actionList, newAction);
    this.diplomaticRules.verify(actionList, newAction);
    this.economicRules.verify(actionList, newAction);
  }
}
