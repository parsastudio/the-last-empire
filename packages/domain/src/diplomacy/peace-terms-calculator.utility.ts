import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { PeaceTermsPackage } from "@/domain/diplomacy/peace-terms.schema";
import { TwmiCalculatorUtility } from "@/domain/diplomacy/twmi-calculator.utility";
import { PeaceConcessionResolverUtility } from "@/domain/diplomacy/peace-concession-resolver.utility";

export class PeaceTermsCalculator {
  public static calculateTwmi(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): number {
    return TwmiCalculatorUtility.calculateTwmi(
      nation,
      nationsMap,
      provincesMap,
    );
  }

  public static calculateTerms(
    humanNation: Nation,
    aiNation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
    currentTurn?: number,
  ): PeaceTermsPackage {
    const humanTwmi = TwmiCalculatorUtility.calculateTwmi(
      humanNation,
      nationsMap,
      provincesMap,
    );
    const aiTwmi = TwmiCalculatorUtility.calculateTwmi(
      aiNation,
      nationsMap,
      provincesMap,
    );

    return PeaceConcessionResolverUtility.resolveTerms(
      humanNation,
      aiNation,
      humanTwmi,
      aiTwmi,
      provincesMap,
      currentTurn,
    );
  }
}
