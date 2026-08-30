import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { PeaceTermsPackage } from "@/domain/diplomacy/peace-terms.schema";
import { PeaceCapitulationBuilder } from "@/domain/diplomacy/peace/peace-capitulation-builder";
import { PeaceWhitePeaceBuilder } from "@/domain/diplomacy/peace/peace-white-peace-builder";
import { PeaceConcessionBuilder } from "@/domain/diplomacy/peace/peace-concession-builder";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";

export class PeaceConcessionResolverUtility {
  public static resolveTerms(
    humanNation: Nation,
    aiNation: Nation,
    humanTwmi: number,
    aiTwmi: number,
    provincesMap?: Record<string, Province>,
  ): PeaceTermsPackage {
    const ratio = Number((aiTwmi / humanTwmi).toFixed(2));

    const aiCanonical = CountryRegistry.resolveCanonicalId(aiNation.id);
    const humanCanonical = CountryRegistry.resolveCanonicalId(humanNation.id);

    const allAiProvinces = provincesMap
      ? Object.values(provincesMap).filter(
          (p) =>
            CountryRegistry.resolveCanonicalId(p.ownerNationId) === aiCanonical,
        )
      : [];

    const allHumanProvinces = provincesMap
      ? Object.values(provincesMap).filter(
          (p) =>
            CountryRegistry.resolveCanonicalId(p.ownerNationId) ===
            humanCanonical,
        )
      : [];

    const aiGdp = getNationGdp(aiNation, provincesMap);
    const humanGdp = getNationGdp(humanNation, provincesMap);

    const maxAiCash = Math.max(
      0,
      aiNation.treasury +
        DebtCalculatorUtility.getAvailableLoanHeadroom(
          aiNation.nationalDebt,
          aiGdp,
        ),
    );
    const maxHumanCash = Math.max(
      0,
      humanNation.treasury +
        DebtCalculatorUtility.getAvailableLoanHeadroom(
          humanNation.nationalDebt,
          humanGdp,
        ),
    );

    if (ratio >= 2.0) {
      return PeaceConcessionBuilder.buildHeavyAiAdvantage(
        aiNation,
        humanNation,
        ratio,
        aiTwmi,
        humanTwmi,
        allHumanProvinces,
        maxHumanCash,
        humanGdp,
      );
    }

    if (ratio <= 0.5) {
      const isHopeless =
        allAiProvinces.length <= 2 || aiNation.government.stability <= 20;

      if (isHopeless) {
        return PeaceCapitulationBuilder.build(
          aiNation,
          humanNation,
          ratio,
          aiTwmi,
          humanTwmi,
          allAiProvinces,
        );
      }

      return PeaceConcessionBuilder.buildHeavyHumanAdvantage(
        aiNation,
        humanNation,
        ratio,
        aiTwmi,
        humanTwmi,
        allAiProvinces,
        maxAiCash,
      );
    }

    if (ratio >= 0.9 && ratio <= 1.1) {
      return PeaceWhitePeaceBuilder.build(
        aiNation,
        humanNation,
        ratio,
        aiTwmi,
        humanTwmi,
      );
    }

    if (ratio < 0.9) {
      return PeaceConcessionBuilder.buildModerateHumanAdvantage(
        aiNation,
        humanNation,
        ratio,
        aiTwmi,
        humanTwmi,
        allAiProvinces,
        maxAiCash,
        provincesMap,
      );
    }

    return PeaceConcessionBuilder.buildModerateAiAdvantage(
      aiNation,
      humanNation,
      ratio,
      aiTwmi,
      humanTwmi,
      allHumanProvinces,
      maxHumanCash,
      humanGdp,
      provincesMap,
    );
  }
}
