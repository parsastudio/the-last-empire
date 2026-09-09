import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { MapTopologyRegistry } from "@/domain/map/map-topology-registry";
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
      concededProvincesNames: [],
      headline: "امتناع قدرت برتر از مذاکره صلح",
      description: `کشور ${aiNation.name} به دلیل قدرت نظامی بالاتر و برتری قاطع بر میدان نبرد، حاضر به هیچ‌گونه مذاکره صلح یا آتش‌بس با کشور شما نیست.`,
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

    const headline =
      provsToConcede.length > 0
        ? "پیشنهاد واگذاری کلیه استان‌ها (به جز تک‌پایتخت) و تخلیه کامل خزانه"
        : "پیشنهاد تخلیه کامل خزانه و پرداخت حداکثر غرامت مالی";

    const description =
      provsToConcede.length > 0
        ? `کشور ${aiNation.name} به دلیل استیصال در برابر قدرت شما، برای جلوگیری از نابودی کامل، پیشنهاد واگذاری ${provsToConcede.length} استان (تمام خاک به جز یک استان مادری) و پرداخت تمام دارایی‌های مالی خود را دارد.`
        : `کشور ${aiNation.name} به دلیل محصور بودن در تک‌استان باقی‌مانده، تمام دارایی‌های نقد و توان مالی خود را برای پایان جنگ واگذار می‌کند.`;

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

    const headline =
      chosenProvs.length > 0
        ? "پیشنهاد واگذاری استان مرزی و پرداخت غرامت"
        : "پیشنهاد پرداخت غرامت نقدی جنگی";

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
      description: `دولت ${aiNation.name} برای توقف پیشروی ارتش شما، بسته مصالحه آماده کرده است.`,
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
    humanGdp: number,
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

    const headline =
      demandedProvs.length > 0
        ? "مطالبه واگذاری استان مرزی و غرامت جنگی"
        : "مطالبه پرداخت غرامت نقدی برای آتش‌بس";

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
      description: `امپراتوری ${aiNation.name} با اتکا به برتری نظامی خود، شرط پایان جنگ را پرداخت تاوان اعلام کرده است.`,
      canAffordTerms: canAfford,
    };
  }
}
