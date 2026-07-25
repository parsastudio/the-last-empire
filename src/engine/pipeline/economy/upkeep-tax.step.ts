import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { TaxCalculator } from "@/engine/economy/tax-calculator";
import { UpkeepCalculator } from "@/engine/economy/upkeep-calculator";
import { ResourceDependencyManager } from "@/engine/economy/resource-dependency-manager";
import { DoctrinesManager } from "@/engine/politics/doctrines-manager";
import { DebtManager } from "@/engine/economy/debt-manager";

export class UpkeepTaxStep implements EconomyStep {
  private taxCalc = new TaxCalculator();
  private upkeepCalc = new UpkeepCalculator();
  private resourceDependencyManager = new ResourceDependencyManager();
  private doctrinesManager = new DoctrinesManager();
  private debtManager = new DebtManager();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const taxResult = this.taxCalc.evaluateTaxPolicy(nation);
      const rawUpkeep = this.upkeepCalc.calculateUpkeep(nation);

      let upkeepTotal = rawUpkeep.total;
      upkeepTotal = this.resourceDependencyManager.applyOilScarcityPenalty(
        nation,
        upkeepTotal,
      );

      const doctrineUpkeepDiscount = this.doctrinesManager.getUpkeepMultiplier(
        nation.doctrines.unlockedDoctrines,
      );
      const finalUpkeepTotal = Math.floor(upkeepTotal * doctrineUpkeepDiscount);

      const financial = this.debtManager.processFinancials(
        nation,
        taxResult.taxIncome,
        finalUpkeepTotal,
      );

      let updated = financial.updatedNation;
      updated = this.resourceDependencyManager.consumeTurnResources(updated);

      nations[id] = updated;
    }
  }
}
