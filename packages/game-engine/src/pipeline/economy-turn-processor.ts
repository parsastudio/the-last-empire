import { Nation } from "@/domain/nation/nation.schema";
import { TariffCalculator } from "@/engine/economy/calculators/tariff-calculator";
import { TaxCalculator } from "@/engine/economy/calculators/tax-calculator";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { BankruptcyManager } from "@/engine/economy/calculators/debt-calculator";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { DemographicsEngine } from "@/engine/economy/demographics/demographics-engine";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { AiEconomyCalculator } from "@/engine/ai/ai-economy-calculator";
import { AIProcurementPlanner } from "@/engine/ai/ai-procurement-planner";

export class EconomyTurnProcessor {
  private static bankruptcyManager = new BankruptcyManager();
  private static recruitmentQueue = new RecruitmentQueueManager();

  public static process(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): Nation {
    const demoResult = DemographicsEngine.processNaturalDemographics(nation);
    let updated = demoResult.updatedNation;

    if (updated.isAi) {
      const gdp = getNationGdp(updated);
      const aliveCount = Object.values(allNations).filter(
        (n) => n.isAlive,
      ).length;
      const currentArmyValuation =
        AIProcurementPlanner.calculateTotalArmyValuation(updated);

      const addedTreasury = AiEconomyCalculator.calculateEffectiveTurnIncome(
        gdp,
        updated.rank,
        aliveCount,
        currentArmyValuation,
      );

      updated = {
        ...updated,
        treasury: updated.treasury + addedTreasury,
      };

      updated = this.recruitmentQueue.processTurnQueue(updated);
      return updated;
    }

    const tariffResult = TariffCalculator.calculateTariffEffects(
      updated,
      allNations,
    );
    const taxResult = TaxCalculator.evaluateTaxPolicy(updated);

    const addedTreasury =
      (tariffResult.tariffRevenue > 0 ? tariffResult.tariffRevenue : 0) +
      (taxResult.taxIncome > 0 ? taxResult.taxIncome : 0);

    const payrollBreakdown =
      MilitaryPayrollCalculator.calculatePayroll(updated);
    const totalExpenses =
      payrollBreakdown.total + Math.floor(updated.nationalDebt * 0.05);

    let newTreasury = updated.treasury + addedTreasury - totalExpenses;
    let newDebt = updated.nationalDebt;

    if (newTreasury < 0) {
      newDebt += Math.abs(newTreasury);
      newTreasury = 0;
    }

    updated = {
      ...updated,
      treasury: newTreasury,
      nationalDebt: newDebt,
    };

    if (this.bankruptcyManager.isBankrupt(updated)) {
      updated = this.bankruptcyManager.applyBankruptcy(updated);
    }

    updated = this.recruitmentQueue.processTurnQueue(updated);

    return updated;
  }
}
