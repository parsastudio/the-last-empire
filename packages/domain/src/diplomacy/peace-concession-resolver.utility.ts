import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { PeaceTermsPackage } from "@/domain/diplomacy/peace-terms.schema";
import { PeaceWhitePeaceBuilder } from "@/domain/diplomacy/peace/peace-white-peace-builder";
import { PeaceConcessionBuilder } from "@/domain/diplomacy/peace/peace-concession-builder";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";

export class PeaceConcessionResolverUtility {
  public static resolveTerms(
    humanNation: Nation,
    aiNation: Nation,
    humanTwmi: number,
    aiTwmi: number,
    provincesMap?: Record<string, ProvinceDynamicState>,
    currentTurn?: number,
  ): PeaceTermsPackage {
    const ratio = Number((aiTwmi / Math.max(1, humanTwmi)).toFixed(2));
    const rel = NationRelationResolver.getBilateralRelation(
      humanNation,
      aiNation,
    );

    const warDeclaredTurn = rel?.warDeclaredTurn;
    const turnsAtWar =
      warDeclaredTurn !== undefined && currentTurn !== undefined
        ? currentTurn - warDeclaredTurn
        : 1;

    if (turnsAtWar < 1) {
      return {
        sourceNationId: aiNation.id,
        targetNationId: humanNation.id,
        settlementType: "WHITE_PEACE",
        ratio,
        sourceTwmi: aiTwmi,
        targetTwmi: humanTwmi,
        isAiOffering: false,
        moneyAmount: 0,
        concededProvinceIds: [],
        concededProvincesNames: [],
        headline: "ممنوعیت پایان جنگ در نوبت اول",
        description:
          "به دلیل آغاز جنگ در نوبت جاری، تا سپری شدن حداقل یک نوبت کامل امکان هیچ‌گونه مذاکره صلح وجود ندارد.",
        canAffordTerms: false,
      };
    }

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
      );
    }

    if (ratio <= 0.5) {
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
      provincesMap,
    );
  }
}
