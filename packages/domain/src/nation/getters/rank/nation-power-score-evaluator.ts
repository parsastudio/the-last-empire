import { CountryRegistry } from "@/domain/data/countries";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";
import { MilitaryDistributionEngine } from "@/domain/military/military-distribution-engine";
import { MilitaryStack } from "@/domain/military/military.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";

export interface NationRankCandidateInput {
  id: string;
  name?: string;
  gdp: number;
  population?: number;
  military?: MilitaryStack;
  governmentType?: GovernmentType | string;
  domesticTechLevel?: number;
  equipmentTechLevel?: number;
  startingTechLevel?: number;
  industrialLevel?: number;
  navalFleet?: number;
  stability?: number;
  globalReputation?: number;
}

export class NationPowerScoreEvaluator {
  public static calculatePowerScore(input: NationRankCandidateInput): number {
    const canonicalId = CountryRegistry.resolveCanonicalId(input.id);
    const profile = CountryRegistry.getCountry(canonicalId);

    const domesticTech =
      input.military?.techLevel ??
      input.domesticTechLevel ??
      input.startingTechLevel ??
      profile?.domesticTechLevel ??
      profile?.startingTechLevel ??
      1.0;

    const equipmentTech =
      input.equipmentTechLevel ?? profile?.equipmentTechLevel ?? domesticTech;

    const stack =
      input.military ??
      MilitaryDistributionEngine.calculateStartingStack(
        input.gdp,
        domesticTech,
        equipmentTech,
      );

    const activeCombatPower = MilitaryPowerCalculator.calculateLandAndAirPower({
      military: stack,
    });

    const effectiveFieldTech = Math.max(domesticTech, equipmentTech);
    const techMultiplier =
      MilitaryPowerCalculator.calculateTechMultiplier(effectiveFieldTech);

    const navalPower = (input.navalFleet ?? 0) * 1500 * techMultiplier;
    const totalBattlefieldPower = activeCombatPower + navalPower;

    const economicWarPotential = (input.gdp / 1_000_000_000) * techMultiplier;

    const stabilityFactor = 0.8 + 0.2 * ((input.stability ?? 50) / 100);
    const repBonus = 1 + (((input.globalReputation ?? 50) - 50) / 50) * 0.05;
    const resilienceMultiplier = stabilityFactor * repBonus;

    return (
      (totalBattlefieldPower * 0.6 + economicWarPotential * 0.4) *
      resilienceMultiplier
    );
  }
}
