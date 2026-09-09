import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import {
  TurnLogBuilder,
  SecurityFeeCalculatorUtility,
  NAVAL_FLEET_CONFIG,
  DebtCalculatorUtility,
  StrategicPartnershipCalculatorUtility,
  FiscalRevenueCalculator,
  MilitaryPayrollCalculator,
  CountryRegistry,
  NationalProjectEffectApplierUtility,
  NationRelationResolver,
} from "@geopolitics/domain";
import { BankruptcyManager } from "@/engine/economy/bankruptcy-manager";
import { TurnContext } from "@/engine/pipeline/turn-context";

export class EconomyTurnProcessor {
  private static bankruptcyManager = new BankruptcyManager();

  public static process(
    nation: Nation,
    turnContext: TurnContext,
  ): {
    updatedNation: Nation;
    updatedProvinces: ProvinceDynamicState[];
    bankruptcyLog?: TurnLogEntry;
  } {
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    let updatedProvinces = [...turnContext.getOwnedProvinces(canonicalId)];

    const currentProvincesMap: Record<string, ProvinceDynamicState> = {
      ...turnContext.state.provinces,
    };
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

    const gdp = turnContext.getNationGdp(canonicalId);

    let securityFee = 0;
    let nextSecurityGuarantorId = nation.securityGuarantorId ?? null;
    let nextIsEmergency = nation.isEmergencyProtectorate ?? false;

    if (nation.securityGuarantorId && nextIsEmergency) {
      const guarantorCanonical = CountryRegistry.resolveCanonicalId(
        nation.securityGuarantorId,
      );
      const guarantor = turnContext.state.nations[guarantorCanonical];
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
        const canonical = CountryRegistry.resolveCanonicalId(gId);
        const g = turnContext.state.nations[canonical];
        return g && g.isAlive;
      },
    );

    let partnershipIncome = 0;
    for (const rel of Object.values(nation.relations || {})) {
      if (rel.stance === "STRATEGIC_PARTNERSHIP") {
        const partnerCanonical = CountryRegistry.resolveCanonicalId(
          rel.targetNationId,
        );
        const partner = turnContext.state.nations[partnerCanonical];
        if (partner && partner.isAlive) {
          const partnerGdp = turnContext.getNationGdp(partnerCanonical);
          partnershipIncome +=
            StrategicPartnershipCalculatorUtility.calculateTurnDividend(
              partnerGdp,
            );
        }
      }
    }

    const petroTributeRate =
      NationalProjectEffectApplierUtility.getCombinedBonus(
        nation.completedProjectIds,
        "petroTributeShare",
      );

    let petroTributeIncome = 0;
    if (petroTributeRate > 0) {
      for (const other of Object.values(turnContext.state.nations)) {
        if (!other.isAlive || other.id === nation.id) continue;
        const isAtWar = NationRelationResolver.isWar(
          nation.relations,
          other.id,
        );
        if (!isAtWar) {
          const otherGdp = turnContext.getNationGdp(other.id);
          petroTributeIncome += Math.floor(otherGdp * petroTributeRate);
        }
      }
    }

    const fiscalResult = FiscalRevenueCalculator.calculate(
      nation,
      turnContext.state.nations,
      currentProvincesMap,
      turnContext.aiRevenueMultiplier,
      turnContext.gdpMap,
      turnContext.totalWorldGdp,
    );

    const totalIncome =
      fiscalResult.totalRevenue +
      navalSecurityIncome +
      partnershipIncome +
      petroTributeIncome;

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
        turnContext.turn,
        updated.id,
      );
    }

    return { updatedNation: updated, updatedProvinces, bankruptcyLog };
  }
}
