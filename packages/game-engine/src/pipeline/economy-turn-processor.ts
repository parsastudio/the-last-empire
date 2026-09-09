import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { BankruptcyManager } from "@/engine/economy/calculators/debt-calculator";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { FiscalRevenueCalculator } from "@/engine/economy/calculators/fiscal-revenue-calculator";
import {
  TurnLogBuilder,
  SecurityFeeCalculatorUtility,
  NationGettersUtility,
  NAVAL_FLEET_CONFIG,
  DebtCalculatorUtility,
  StrategicPartnershipCalculatorUtility,
} from "@geopolitics/domain";

export class EconomyTurnProcessor {
  private static bankruptcyManager = new BankruptcyManager();

  public static process(
    nation: Nation,
    allNations: Record<string, Nation>,
    ownedProvinces: Province[],
    provincesMap: Record<string, Province>,
    currentTurn = 1,
    aiRevenueMultiplier = 1.4,
  ): {
    updatedNation: Nation;
    updatedProvinces: Province[];
    bankruptcyLog?: TurnLogEntry;
  } {
    let updatedProvinces = [...ownedProvinces];

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
      (nation.navalFleet || 0) *
        NAVAL_FLEET_CONFIG.FLEET_UNIT_COST *
        NAVAL_FLEET_CONFIG.TURN_REVENUE_RATE,
    );

    const gdp = getNationGdp(nation, currentProvincesMap);

    let securityFee = 0;
    let nextSecurityGuarantorId = nation.securityGuarantorId ?? null;
    let nextIsEmergency = nation.isEmergencyProtectorate ?? false;

    if (nation.securityGuarantorId && nextIsEmergency) {
      const guarantor = NationGettersUtility.resolveNation(
        nation.securityGuarantorId,
        allNations,
      );
      if (guarantor && guarantor.isAlive) {
        securityFee = SecurityFeeCalculatorUtility.calculateSecurityFee(
          gdp,
          true,
        );
      } else {
        nextSecurityGuarantorId = null;
        nextIsEmergency = false;
      }
    }

    const activeDefenseGuarantors = (nation.defenseGuarantorIds || []).filter(
      (gId) => {
        const g = NationGettersUtility.resolveNation(gId, allNations);
        return g && g.isAlive;
      },
    );

    let partnershipIncome = 0;
    for (const rel of Object.values(nation.relations || {})) {
      if (rel.stance === "STRATEGIC_PARTNERSHIP") {
        const partner = NationGettersUtility.resolveNation(
          rel.targetNationId,
          allNations,
        );
        if (partner && partner.isAlive) {
          const partnerGdp = getNationGdp(partner, currentProvincesMap);
          const dividend =
            StrategicPartnershipCalculatorUtility.calculateTurnDividend(
              partnerGdp,
            );
          partnershipIncome += dividend;
        }
      }
    }

    const fiscalResult = FiscalRevenueCalculator.calculate(
      nation,
      allNations,
      currentProvincesMap,
      aiRevenueMultiplier,
    );

    const totalIncome =
      fiscalResult.totalRevenue + navalSecurityIncome + partnershipIncome;

    const maintenanceCost = payrollBreakdown.total;
    const debtInterest = DebtCalculatorUtility.calculateInterest(
      nation.nationalDebt,
    );

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
      const maxDebtLimit = DebtCalculatorUtility.getMaxDebtLimit(gdp);
      if (newDebt + deficit > maxDebtLimit && nextSecurityGuarantorId) {
        nextSecurityGuarantorId = null;
        nextIsEmergency = false;
      }
      newDebt += deficit;
      newTreasury = 0;
    }

    let updated: Nation = {
      ...nation,
      treasury: newTreasury,
      nationalDebt: newDebt,
      securityGuarantorId: nextSecurityGuarantorId,
      isEmergencyProtectorate: nextIsEmergency,
      defenseGuarantorIds: activeDefenseGuarantors,
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

    return { updatedNation: updated, updatedProvinces, bankruptcyLog };
  }
}
