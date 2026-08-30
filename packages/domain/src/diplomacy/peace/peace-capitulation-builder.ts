import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { PeaceTermsPackage } from "@/domain/diplomacy/peace-terms.schema";

export class PeaceCapitulationBuilder {
  public static build(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
    allAiProvinces: Province[],
  ): PeaceTermsPackage {
    return {
      sourceNationId: aiNation.id,
      targetNationId: humanNation.id,
      settlementType: "FULL_CAPITULATION",
      ratio,
      sourceTwmi: aiTwmi,
      targetTwmi: humanTwmi,
      isAiOffering: true,
      moneyAmount: Math.max(0, aiNation.treasury),
      concededProvinceIds: allAiProvinces.map((p) => p.provinceId),
      concededProvincesNames: allAiProvinces.map((p) => p.nameFa),
      headline: "پیشنهاد تسلیم کامل و الحاق تمامیت ارضی",
      description: `دولت ${aiNation.name} در آستانه فروپاشی مطلق، حاضر به تسلیم بدون قید و شرط و واگذاری تمام خاک خود به شماست.`,
      canAffordTerms: true,
    };
  }
}
