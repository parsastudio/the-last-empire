import { EconomyStep, EconomyStepContext } from "./economy-step.interface";
import { TaxCalculator } from "@/engine/economy/tax-calculator";
import { MilitaryPayrollCalculator } from "@/engine/economy/military-payroll-calculator";
import { ResourceDependencyManager } from "@/engine/economy/resource-dependency-manager";
import { DebtManager } from "@/engine/economy/debt-manager";

export class UpkeepTaxStep implements EconomyStep {
  private taxCalc = new TaxCalculator();
  private payrollCalc = new MilitaryPayrollCalculator();
  private resourceDependencyManager = new ResourceDependencyManager();
  private debtManager = new DebtManager();

  public execute(context: EconomyStepContext): void {
    const nations = context.state.nations;
    for (const [id, nation] of Object.entries(nations)) {
      if (!nation.isAlive) {
        continue;
      }
      const taxResult = this.taxCalc.evaluateTaxPolicy(nation);
      const payrollBreakdown = this.payrollCalc.calculatePayroll(nation);

      const financial = this.debtManager.processFinancials(
        nation,
        taxResult.taxIncome,
        payrollBreakdown.total,
      );

      let updated = financial.updatedNation;
      updated = this.resourceDependencyManager.consumeTurnResources(updated);

      nations[id] = updated;
    }
  }
}
