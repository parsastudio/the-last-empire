import { Nation } from "@/domain/nation/nation.schema";
import { PeaceTermsPackage } from "@/domain/diplomacy/peace-terms.schema";
import { AppLocale } from "@/domain/shared/locale-number-formatter";

export class PeaceWhitePeaceBuilder {
  public static build(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
    locale: AppLocale = "fa",
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
      concededProvincesNames: [],
      headline:
        locale === "en"
          ? "White Peace Accord & Mutual Ceasefire"
          : "معاهده صلح سفید و ترک فوری مخاصمه",
      description:
        locale === "en"
          ? "Due to power equilibrium and mutual fatigue, both nations conclude peace without indemnity or territorial concessions."
          : "به دلیل موازنه نزدیک قدرت و فرسودگی جنگی، دو کشور بدون هیچ باج مالی یا تغییر مرزی به جنگ پایان می‌دهند.",
      canAffordTerms: true,
    };
  }
}
