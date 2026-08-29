import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";

export class TwmiCalculatorUtility {
  public static calculateTwmi(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): number {
    const gdp = getNationGdp(nation, provincesMap);
    const treasury = Math.max(0, nation.treasury);
    const loanHeadroom = Math.max(
      0,
      Math.floor(gdp * 0.8) - nation.nationalDebt,
    );

    const armyValuation = MilitaryPricingCalculator.calculateTotalArmyValuation(
      nation.military,
    );

    const estimatedRevenue = Math.floor(gdp * 0.05);
    const estimatedPayroll = Math.min(
      Math.floor(gdp * 0.06),
      Math.floor(armyValuation * 0.06),
    );
    const debtInterest = Math.floor(nation.nationalDebt * 0.07);
    const securityFeeRatio = nation.isEmergencyProtectorate ? 0.3 : 0.1;
    const securityFee = nation.securityGuarantorId
      ? Math.floor(gdp * securityFeeRatio)
      : 0;

    const netTurnIncome =
      estimatedRevenue - (estimatedPayroll + debtInterest + securityFee);

    let guarantorValuation = 0;
    if (nation.securityGuarantorId && nationsMap) {
      const gCanonical = CountryRegistry.resolveCanonicalId(
        nation.securityGuarantorId,
      );
      const guarantor =
        nationsMap[gCanonical] || nationsMap[nation.securityGuarantorId];
      if (guarantor && guarantor.isAlive) {
        const forceMultiplier = nation.isEmergencyProtectorate ? 3.0 : 0.3;
        const rawBudget = Math.floor(gdp * forceMultiplier);
        const maxSuperpowerLimit = Math.floor(
          getNationGdp(guarantor, provincesMap) * 0.3,
        );
        guarantorValuation = Math.min(rawBudget, maxSuperpowerLimit);
      }
    }

    const totalScore =
      treasury +
      loanHeadroom +
      Math.max(0, netTurnIncome) +
      armyValuation +
      guarantorValuation;

    let activeWarsCount = 0;
    if (nationsMap && nation.relations) {
      const sourceCanonical = CountryRegistry.resolveCanonicalId(nation.id);
      for (const [targetId, rel] of Object.entries(nation.relations)) {
        if (rel.stance === "WAR") {
          const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
          if (canonicalTarget !== sourceCanonical) {
            const enemy = nationsMap[canonicalTarget] || nationsMap[targetId];
            if (enemy && enemy.isAlive) {
              activeWarsCount++;
            }
          }
        }
      }
    }

    const dispersionFactor = 1 + 0.5 * Math.max(0, activeWarsCount - 1);
    return Math.max(1_000_000_000, Math.floor(totalScore / dispersionFactor));
  }
}
