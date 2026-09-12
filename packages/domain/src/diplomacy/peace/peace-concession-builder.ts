import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";
import {
  PeaceTermsPackage,
  PeaceSettlementType,
} from "@/domain/diplomacy/peace-terms.schema";
import { AppLocale } from "@/domain/shared/locale-number-formatter";
import { CountryRegistry } from "@/domain/data/countries";

export class PeaceConcessionBuilder {
  public static buildHeavyAiAdvantage(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
    locale: AppLocale = "fa",
  ): PeaceTermsPackage {
    const profile = CountryRegistry.getCountry(aiNation.id);
    const aiName =
      locale === "en" ? profile?.nameEn || aiNation.name : aiNation.name;

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
      concededProvincesNames: [],
      headline:
        locale === "en"
          ? "Peace Negotiations Refused (Adversary Holds Decisive Power)"
          : "امتناع قدرت برتر از مذاکره صلح",
      description:
        locale === "en"
          ? `${aiName} refuses all ceasefire proposals due to unquestioned frontline superiority.`
          : `کشور ${aiName} به دلیل قدرت نظامی بالاتر و برتری قاطع بر میدان نبرد، حاضر به هیچ‌گونه مذاکره صلح یا آتش‌بس با کشور شما نیست.`,
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
    locale: AppLocale = "fa",
  ): PeaceTermsPackage {
    const profile = CountryRegistry.getCountry(aiNation.id);
    const aiName =
      locale === "en" ? profile?.nameEn || aiNation.name : aiNation.name;

    const sortedProvs = [...allAiProvinces].sort(
      (a, b) => getProvinceGdp(b) - getProvinceGdp(a),
    );
    const provsToConcedeCount = Math.max(0, allAiProvinces.length - 1);
    const provsToConcede = sortedProvs.slice(0, provsToConcedeCount);

    const settlementType: PeaceSettlementType =
      provsToConcede.length > 0 ? "TERRITORY_CONCESSION" : "INDEMNITY";

    const headline =
      locale === "en"
        ? provsToConcede.length > 0
          ? "Proposal: Cede All Outer Provinces & Empty Sovereign Treasury"
          : "Proposal: Complete Treasury Clearance & Max War Indemnity"
        : provsToConcede.length > 0
          ? "پیشنهاد واگذاری کلیه استان‌ها (به جز تک‌پایتخت) و تخلیه کامل خزانه"
          : "پیشنهاد تخلیه کامل خزانه و پرداخت حداکثر غرامت مالی";

    const description =
      locale === "en"
        ? provsToConcede.length > 0
          ? `${aiName}, facing total collapse, offers ${provsToConcede.length} provinces and full treasury reserves to survive.`
          : `${aiName}, confined to its last sovereign province, offers all liquid cash to end the war.`
        : provsToConcede.length > 0
          ? `کشور ${aiName} به دلیل استیصال در برابر قدرت شما، برای جلوگیری از نابودی کامل، پیشنهاد واگذاری ${provsToConcede.length} استان (تمام خاک به جز یک استان مادری) و پرداخت تمام دارایی‌های مالی خود را دارد.`
          : `کشور ${aiName} به دلیل محصور بودن در تک‌استان باقی‌مانده، تمام دارایی‌های نقد و توان مالی خود را برای پایان جنگ واگذار می‌کند.`;

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
      concededProvincesNames: provsToConcede.map((p) =>
        MapTopologyRegistry.getNameFa(p.provinceId, ""),
      ),
      headline,
      description,
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
    locale: AppLocale = "fa",
  ): PeaceTermsPackage {
    const profile = CountryRegistry.getCountry(aiNation.id);
    const aiName =
      locale === "en" ? profile?.nameEn || aiNation.name : aiNation.name;

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

    const headline =
      locale === "en"
        ? chosenProvs.length > 0
          ? "Proposal: Cede Border Province & Disburse Indemnity"
          : "Proposal: Disburse War Indemnity Payment"
        : chosenProvs.length > 0
          ? "پیشنهاد واگذاری استان مرزی و پرداخت غرامت"
          : "پیشنهاد پرداخت غرامت نقدی جنگی";

    const description =
      locale === "en"
        ? `${aiName} prepared a compromise terms settlement to halt your military advance.`
        : `دولت ${aiName} برای توقف پیشروی ارتش شما، بسته مصالحه آماده کرده است.`;

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
      concededProvincesNames: chosenProvs.map((p) =>
        MapTopologyRegistry.getNameFa(p.provinceId, ""),
      ),
      headline,
      description,
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
    locale: AppLocale = "fa",
  ): PeaceTermsPackage {
    const profile = CountryRegistry.getCountry(aiNation.id);
    const aiName =
      locale === "en" ? profile?.nameEn || aiNation.name : aiNation.name;

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

    const headline =
      locale === "en"
        ? demandedProvs.length > 0
          ? "Demanded: Cede Border Province & Pay War Indemnity"
          : "Demanded: Pay War Indemnity for Ceasefire"
        : demandedProvs.length > 0
          ? "مطالبه واگذاری استان مرزی و غرامت جنگی"
          : "مطالبه پرداخت غرامت نقدی برای آتش‌بس";

    const description =
      locale === "en"
        ? `${aiName} leverages frontline power advantages, setting indemnity as condition for ceasefire.`
        : `امپراتوری ${aiName} با اتکا به برتری نظامی خود، شرط پایان جنگ را پرداخت تاوان اعلام کرده است.`;

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
      concededProvincesNames: demandedProvs.map((p) =>
        MapTopologyRegistry.getNameFa(p.provinceId, ""),
      ),
      headline,
      description,
      canAffordTerms: canAfford,
    };
  }
}
