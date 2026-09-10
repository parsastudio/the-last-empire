import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import {
  TurnLogBuilder,
  DebtCalculatorUtility,
  CountryRegistry,
  NationalBudgetCalculator,
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

    const budget = NationalBudgetCalculator.calculate(
      nation,
      turnContext.state.nations,
      currentProvincesMap,
      nation.treasury,
      turnContext.aiRevenueMultiplier,
      turnContext.gdpMap,
      turnContext.totalWorldGdp,
    );

    let nextSecurityGuarantorId = nation.securityGuarantorId ?? null;
    let nextIsEmergency = nation.isEmergencyProtectorate ?? false;

    if (nation.securityGuarantorId && nextIsEmergency) {
      const guarantorCanonical = CountryRegistry.resolveCanonicalId(
        nation.securityGuarantorId,
      );
      const guarantor = turnContext.state.nations[guarantorCanonical];
      if (!guarantor || !guarantor.isAlive) {
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

    let actualRepayment = 0;
    let newDebt = nation.nationalDebt;

    if (nation.isAi && newDebt > 0 && budget.grossRevenue > 0) {
      const maxRepayment = Math.floor(budget.grossRevenue * 0.3);
      actualRepayment = Math.min(newDebt, maxRepayment);
      newDebt -= actualRepayment;
    }

    const totalExpenses = budget.fixedExpenses + actualRepayment;
    const netChange = budget.grossRevenue - totalExpenses;

    let newTreasury = nation.treasury + netChange;

    if (newTreasury < 0) {
      const deficit = Math.abs(newTreasury);
      const maxDebtLimit = DebtCalculatorUtility.getMaxDebtLimit(budget.gdp);
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
