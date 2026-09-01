import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { PeaceTermsPackage } from "@/domain/diplomacy/peace-terms.schema";
import { PeaceCapitulationBuilder } from "@/domain/diplomacy/peace/peace-capitulation-builder";
import { PeaceWhitePeaceBuilder } from "@/domain/diplomacy/peace/peace-white-peace-builder";
import { PeaceConcessionBuilder } from "@/domain/diplomacy/peace/peace-concession-builder";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";
import { CountryRegistry } from "@/domain/data/countries";

export class PeaceConcessionResolverUtility {
  public static resolveTerms(
    humanNation: Nation,
    aiNation: Nation,
    humanTwmi: number,
    aiTwmi: number,
    provincesMap?: Record<string, Province>,
  ): PeaceTermsPackage {
    const ratio = Number((aiTwmi / humanTwmi).toFixed(2));

    const allAiProvinces = NationGettersUtility.getOwnedProvinces(
      aiNation.id,
      provincesMap,
    );
    const allHumanProvinces = NationGettersUtility.getOwnedProvinces(
      humanNation.id,
      provincesMap,
    );

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
      const canonicalAi = CountryRegistry.resolveCanonicalId(aiNation.id);
      const canonicalHuman = CountryRegistry.resolveCanonicalId(humanNation.id);

      const hasLostProvinceToOpponent = provincesMap
        ? Object.values(provincesMap).some((p) => {
            const owner = CountryRegistry.resolveCanonicalId(p.ownerNationId);
            const original = CountryRegistry.resolveCanonicalId(
              p.originalNationId || p.ownerNationId,
            );
            return owner === canonicalHuman && original === canonicalAi;
          })
        : false;

      if (hasLostProvinceToOpponent) {
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
