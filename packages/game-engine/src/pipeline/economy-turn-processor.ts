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
import { CountryRegistry } from "@geopolitics/domain";

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

    const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(
      updated,
      currentProvincesMap,
    );

    const navalSecurityIncome = Math.floor(
      (updated.navalFleet || 0) * 50_000_000_000 * 0.06,
    );

    const gdp = getNationGdp(updated, currentProvincesMap);

    let securityFee = 0;
    if (updated.securityGuarantorId) {
      const gCanonical = CountryRegistry.resolveCanonicalId(
        updated.securityGuarantorId,
      );
      const guarantor =
        allNations[gCanonical] || allNations[updated.securityGuarantorId];
      if (guarantor && guarantor.isAlive) {
        securityFee = Math.floor(gdp * 0.1);
      } else {
        updated.securityGuarantorId = null;
      }
    }

    let warSubsidiesReceived = 0;
    const isAtWar = Object.values(updated.relations || {}).some(
      (r) => r.stance === "WAR",
    );

    if (isAtWar) {
      for (const rel of Object.values(updated.relations || {})) {
        if (rel.stance === "STRATEGIC_PARTNERSHIP") {
          const partnerCanonical = CountryRegistry.resolveCanonicalId(
            rel.targetNationId,
          );
          const partner =
            allNations[partnerCanonical] || allNations[rel.targetNationId];
          if (partner && partner.isAlive && partner.treasury > gdp * 0.05) {
            const subsidy = Math.floor(gdp * 0.02);
            warSubsidiesReceived += subsidy;
          }
        }
      }
    }

    if (updated.isAi) {
      const taxAt30 = TaxCalculator.calculateTaxIncome(gdp, 30);
      const tariffAt30 = TariffCalculator.calculateTariffEffects(
        { ...updated, tariffRate: 30 },
        allNations,
        currentProvincesMap,
      ).tariffRevenue;

      const baseIncome = AiEconomyCalculator.calculateComparativeTurnIncome(
        taxAt30,
        tariffAt30,
      );

      const maintenanceCost = payrollBreakdown.total;
      const debtInterest = Math.floor(updated.nationalDebt * 0.07);

      let actualRepayment = 0;
      let newDebt = updated.nationalDebt;

      if (newDebt > 0 && baseIncome > 0) {
        const maxRepayment = Math.floor(baseIncome * 0.3);
        actualRepayment = Math.min(newDebt, maxRepayment);
        newDebt -= actualRepayment;
      }

      const totalAiExpenses =
        maintenanceCost + securityFee + actualRepayment + debtInterest;
      const totalAiGains =
        baseIncome + navalSecurityIncome + warSubsidiesReceived;
      const netChange = totalAiGains - totalAiExpenses;

      let newTreasury = updated.treasury + netChange;

      if (newTreasury < 0) {
        const deficit = Math.abs(newTreasury);
        const maxDebtLimit = Math.floor(gdp * 0.8);
        if (newDebt + deficit > maxDebtLimit && updated.securityGuarantorId) {
          updated.securityGuarantorId = null;
        }
        newDebt += deficit;
        newTreasury = 0;
      }

      updated = {
        ...updated,
        treasury: newTreasury,
        nationalDebt: newDebt,
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
      (taxResult.taxIncome > 0 ? taxResult.taxIncome : 0) +
      navalSecurityIncome +
      warSubsidiesReceived;

    const totalExpenses =
      payrollBreakdown.total +
      Math.floor(updated.nationalDebt * 0.07) +
      securityFee;

    let newTreasury = updated.treasury + addedTreasury - totalExpenses;
    let newDebt = updated.nationalDebt;

    if (newTreasury < 0) {
      const deficit = Math.abs(newTreasury);
      const maxDebtLimit = Math.floor(gdp * 0.8);
      if (newDebt + deficit > maxDebtLimit && updated.securityGuarantorId) {
        updated.securityGuarantorId = null;
      }
      newDebt += deficit;
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
