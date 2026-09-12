import { Nation } from "@/domain/nation/nation.schema";
import { PeaceTermsPackage } from "@/domain/diplomacy/peace-terms.schema";

export class PeaceWhitePeaceBuilder {
  public static build(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
  ): PeaceTermsPackage {
    return {
      sourceNationId: aiNation.id,
      targetNationId: humanNation.id,
      settlementType: "WHITE_PEACE",
      ratio,
      sourceTwmi: aiTwmi,
      targetTwmi: humanTwmi,
      isAiOffering: true,
      moneyAmount: 0,
      concededProvinceIds: [],
      statusCode: "WHITE_PEACE_EQUILIBRIUM",
      canAffordTerms: true,
    };
  }
}
