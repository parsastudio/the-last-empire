import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import {
  PeaceTermsPackage,
  PeaceSettlementType,
} from "@/domain/diplomacy/peace-terms.schema";

export class PeaceConcessionBuilder {
  public static buildHeavyAiAdvantage(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
  ): PeaceTermsPackage {
    return {
      sourceNationId: aiNation.id,
      targetNationId: humanNation.id,
      settlementType: "INDEMNITY",
      ratio,
      sourceTwmi: aiTwmi,
      targetTwmi: humanTwmi,
      isAiOffering: false,
      moneyAmount: 0,
      concededProvinceIds: [],
      statusCode: "AI_DOMINANT_REFUSAL",
      canAffordTerms: false,
    };
  }

  public static buildHeavyHumanAdvantage(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
    allAiProvinces: ProvinceDynamicState[],
    maxAiCash: number,
  ): PeaceTermsPackage {
    const sortedProvs = [...allAiProvinces].sort(
      (a, b) => getProvinceGdp(b) - getProvinceGdp(a),
    );
    const provsToConcedeCount = Math.max(0, allAiProvinces.length - 1);
    const provsToConcede = sortedProvs.slice(0, provsToConcedeCount);

    const settlementType: PeaceSettlementType =
      provsToConcede.length > 0 ? "TERRITORY_CONCESSION" : "INDEMNITY";

    return {
      sourceNationId: aiNation.id,
      targetNationId: humanNation.id,
      settlementType,
      ratio,
      sourceTwmi: aiTwmi,
      targetTwmi: humanTwmi,
      isAiOffering: true,
      moneyAmount: maxAiCash,
      concededProvinceIds: provsToConcede.map((p) => p.provinceId),
      statusCode: "AI_DESPERATE_CAPITULATION",
      canAffordTerms: true,
    };
  }

  public static buildModerateHumanAdvantage(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
    allAiProvinces: ProvinceDynamicState[],
    maxAiCash: number,
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): PeaceTermsPackage {
    const f = (1.0 - ratio) / 0.5;
    const money = Math.floor(maxAiCash * f * 0.5);

    const canCedeProvince = allAiProvinces.length > 1;
    const borderProvs = canCedeProvince
      ? allAiProvinces.filter((p) =>
          LandNeighborResolver.hasProvinceLandBorder(
            p.provinceId,
            humanNation.id,
            provincesMap,
          ),
        )
      : [];

    const chosenProvs =
      canCedeProvince && f >= 0.5 && borderProvs.length > 0
        ? [
            [...borderProvs].sort(
              (a, b) => getProvinceGdp(b) - getProvinceGdp(a),
            )[0]!,
          ]
        : [];

    const settlementType: PeaceSettlementType =
      chosenProvs.length > 0 ? "TERRITORY_CONCESSION" : "INDEMNITY";

    return {
      sourceNationId: aiNation.id,
      targetNationId: humanNation.id,
      settlementType,
      ratio,
      sourceTwmi: aiTwmi,
      targetTwmi: humanTwmi,
      isAiOffering: true,
      moneyAmount: money,
      concededProvinceIds: chosenProvs.map((p) => p.provinceId),
      statusCode: "HUMAN_MODERATE_ADVANTAGE",
      canAffordTerms: true,
    };
  }

  public static buildModerateAiAdvantage(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
    allHumanProvinces: ProvinceDynamicState[],
    maxHumanCash: number,
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): PeaceTermsPackage {
    const v = (ratio - 1.0) / 1.0;
    const demandedMoney = Math.floor(maxHumanCash * v * 0.5);

    const canCedeProvince = allHumanProvinces.length > 1;
    const humanBorderProvs = canCedeProvince
      ? allHumanProvinces.filter((p) =>
          LandNeighborResolver.hasProvinceLandBorder(
            p.provinceId,
            aiNation.id,
            provincesMap,
          ),
        )
      : [];

    const demandedProvs =
      canCedeProvince && v >= 0.5 && humanBorderProvs.length > 0
        ? [
            [...humanBorderProvs].sort(
              (a, b) => getProvinceGdp(b) - getProvinceGdp(a),
            )[0]!,
          ]
        : [];

    const settlementType: PeaceSettlementType =
      demandedProvs.length > 0 ? "TERRITORY_CONCESSION" : "INDEMNITY";

    const canAfford = humanNation.treasury >= demandedMoney;

    return {
      sourceNationId: aiNation.id,
      targetNationId: humanNation.id,
      settlementType,
      ratio,
      sourceTwmi: aiTwmi,
      targetTwmi: humanTwmi,
      isAiOffering: false,
      moneyAmount: demandedMoney,
      concededProvinceIds: demandedProvs.map((p) => p.provinceId),
      statusCode: "AI_MODERATE_DEMAND",
      canAffordTerms: canAfford,
    };
  }
}
