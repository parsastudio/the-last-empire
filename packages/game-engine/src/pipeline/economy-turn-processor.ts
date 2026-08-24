import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { TariffCalculator } from "@/engine/economy/calculators/tariff-calculator";
import { TaxCalculator } from "@/engine/economy/calculators/tax-calculator";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { BankruptcyManager } from "@/engine/economy/calculators/debt-calculator";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { DemographicsEngine } from "@/engine/economy/demographics/demographics-engine";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { AiEconomyCalculator } from "@/engine/ai/ai-economy-calculator";
import { AIProcurementPlanner } from "@/engine/ai/ai-procurement-planner";
import { NationGettersUtility } from "@geopolitics/domain";

export class EconomyTurnProcessor {
  private static bankruptcyManager = new BankruptcyManager();
  private static recruitmentQueue = new RecruitmentQueueManager();

  public static process(
    nation: Nation,
    allNations: Record<string, Nation>,
    ownedProvinces: Province[],
    provincesMap: Record<string, Province>,
  ): { updatedNation: Nation; updatedProvinces: Province[] } {
    const demoResult = DemographicsEngine.processNaturalDemographics(
      nation.government.stability,
      ownedProvinces,
    );
    let updated = { ...nation };
    let updatedProvinces = demoResult.updatedProvinces;

    const currentProvincesMap: Record<string, Province> = { ...provincesMap };
    for (let p = 0; p < updatedProvinces.length; p++) {
      const up = updatedProvinces[p]!;
      currentProvincesMap[up.provinceId.toString()] = up;
    }

    if (updated.isAi) {
      const gdp = getNationGdp(updated, currentProvincesMap);
      const aliveCount = Object.values(allNations).filter(
        (n) => n.isAlive,
      ).length;
      const currentArmyValuation =
        AIProcurementPlanner.calculateTotalArmyValuation(updated);

      const nationRank = NationGettersUtility.getRank(
        updated.id,
        allNations,
        currentProvincesMap,
      );

      const addedTreasury = AiEconomyCalculator.calculateEffectiveTurnIncome(
        gdp,
        nationRank,
        aliveCount,
        currentArmyValuation,
        updated.government.type,
      );

      updated = {
        ...updated,
        treasury: updated.treasury + addedTreasury,
      };

      updated = this.recruitmentQueue.processTurnQueue(updated);
      return { updatedNation: updated, updatedProvinces };
    }

    const tariffResult = TariffCalculator.calculateTariffEffects(
      updated,
      allNations,
      currentProvincesMap,
    );
    const taxResult = TaxCalculator.evaluateTaxPolicy(
      updated,
      currentProvincesMap,
    );

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

    if (this.bankruptcyManager.isBankrupt(updated, currentProvincesMap)) {
      const bankResult = this.bankruptcyManager.applyBankruptcy(
        updated,
        updatedProvinces,
      );
      updated = bankResult.updatedNation;
      updatedProvinces = bankResult.updatedProvinces;
    }

    updated = this.recruitmentQueue.processTurnQueue(updated);

    return { updatedNation: updated, updatedProvinces };
  }
}
