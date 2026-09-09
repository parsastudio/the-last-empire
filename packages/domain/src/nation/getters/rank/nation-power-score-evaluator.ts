import { CountryRegistry } from "@/domain/data/countries";
import { MilitaryPowerCalculator } from "@/domain/military/military-power-calculator.utility";
import { MilitaryDistributionEngine } from "@/domain/military/military-distribution-engine";
import { MilitaryStack } from "@/domain/military/military.schema";
import { GovernmentType } from "@/domain/politics/politics.schema";

export interface NationRankCandidateInput {
  id: string;
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

    const gdpBillion = (input.gdp || 1_000_000_000) / 1_000_000_000;
    const economicPower = gdpBillion * (1 + (equipmentTech - 1) * 0.2);

    const stack =
      input.military ??
      MilitaryDistributionEngine.calculateStartingStack(
        input.gdp,
        domesticTech,
        equipmentTech,
      );

    const rawCombatPower = MilitaryPowerCalculator.calculateLandAndAirPower({
      military: stack,
    });
    const navalCombatPower = (input.navalFleet ?? 0) * 40;
    const militaryPower = (rawCombatPower + navalCombatPower) * 0.5;

    const popMillion = (input.population || 10_000_000) / 1_000_000;
    const demographicPower = Math.sqrt(popMillion) * 15;

    const stabilityFactor = 0.85 + 0.15 * ((input.stability ?? 50) / 100);
    const reputationFactor =
      0.95 + 0.05 * (((input.globalReputation ?? 50) + 100) / 200);

    const baseCompositePower =
      economicPower * 0.5 + militaryPower * 0.35 + demographicPower * 0.15;

    return baseCompositePower * stabilityFactor * reputationFactor;
  }
}
