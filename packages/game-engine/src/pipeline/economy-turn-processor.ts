import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { BankruptcyManager } from "@/engine/economy/calculators/debt-calculator";
import { RecruitmentQueueManager } from "@/engine/military/recruitment-queue";
import { DemographicsEngine } from "@/engine/economy/demographics/demographics-engine";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { FiscalRevenueCalculator } from "@/engine/economy/calculators/fiscal-revenue-calculator";
import { CountryRegistry, TurnLogBuilder } from "@geopolitics/domain";

export class EconomyTurnProcessor {
  private static bankruptcyManager = new BankruptcyManager();
  private static recruitmentQueue = new RecruitmentQueueManager();

  public static process(
    nation: Nation,
    allNations: Record<string, Nation>,
    ownedProvinces: Province[],
    provincesMap: Record<string, Province>,
    currentTurn = 1,
  ): {
    updatedNation: Nation;
    updatedProvinces: Province[];
    bankruptcyLog?: TurnLogEntry;
  } {
    const demoResult = DemographicsEngine.processNaturalDemographics(
      nation.government.stability,
      ownedProvinces,
    );
    let updatedProvinces = demoResult.updatedProvinces;

    const currentProvincesMap: Record<string, Province> = { ...provincesMap };
    for (let p = 0; p < updatedProvinces.length; p++) {
      const up = updatedProvinces[p]!;
      currentProvincesMap[up.provinceId.toString()] = up;
    }

    const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(
      nation,
      currentProvincesMap,
    );

    const navalSecurityIncome = Math.floor(
      (nation.navalFleet || 0) * 50_000_000_000 * 0.06,
    );

    const gdp = getNationGdp(nation, currentProvincesMap);

    let securityFee = 0;
    let nextSecurityGuarantorId = nation.securityGuarantorId ?? null;

    if (nation.securityGuarantorId) {
      const gCanonical = CountryRegistry.resolveCanonicalId(
        nation.securityGuarantorId,
      );
      const guarantor =
        allNations[gCanonical] || allNations[nation.securityGuarantorId];
      if (guarantor && guarantor.isAlive) {
        securityFee = Math.floor(gdp * 0.1);
      } else {
        nextSecurityGuarantorId = null;
      }
    }

    let warSubsidiesReceived = 0;
    const isAtWar = Object.values(nation.relations || {}).some(
      (r) => r.stance === "WAR",
    );

    if (isAtWar) {
      for (const rel of Object.values(nation.relations || {})) {
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

    const fiscalResult = FiscalRevenueCalculator.calculate(
      nation,
      allNations,
      currentProvincesMap,
    );

    const totalIncome =
      fiscalResult.totalRevenue + navalSecurityIncome + warSubsidiesReceived;

    const maintenanceCost = payrollBreakdown.total;
    const debtInterest = Math.floor(nation.nationalDebt * 0.07);

    let actualRepayment = 0;
    let newDebt = nation.nationalDebt;

    if (nation.isAi && newDebt > 0 && totalIncome > 0) {
      const maxRepayment = Math.floor(totalIncome * 0.3);
      actualRepayment = Math.min(newDebt, maxRepayment);
      newDebt -= actualRepayment;
    }

    const totalExpenses =
      maintenanceCost + securityFee + actualRepayment + debtInterest;
    const netChange = totalIncome - totalExpenses;

    let newTreasury = nation.treasury + netChange;

    if (newTreasury < 0) {
      const deficit = Math.abs(newTreasury);
      const maxDebtLimit = Math.floor(gdp * 0.8);
      if (newDebt + deficit > maxDebtLimit && nextSecurityGuarantorId) {
        nextSecurityGuarantorId = null;
      }
      newDebt += deficit;
      newTreasury = 0;
    }

    let updated: Nation = {
      ...nation,
      treasury: newTreasury,
      nationalDebt: newDebt,
      securityGuarantorId: nextSecurityGuarantorId,
    };

    let bankruptcyLog: TurnLogEntry | undefined = undefined;

    if (this.bankruptcyManager.isBankrupt(updated, currentProvincesMap)) {
      const bankResult = this.bankruptcyManager.applyBankruptcy(
        updated,
        updatedProvinces,
      );
      updated = bankResult.updatedNation;
      updatedProvinces = bankResult.updatedProvinces;
      bankruptcyLog = TurnLogBuilder.createBankruptcyLog(
        currentTurn,
        updated.id,
      );
    }

    updated = this.recruitmentQueue.processTurnQueue(updated);

    return { updatedNation: updated, updatedProvinces, bankruptcyLog };
  }
}
