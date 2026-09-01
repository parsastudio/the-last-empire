import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getProvinceGdp } from "@/domain/nation/gdp-calculator.utility";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";
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
    allHumanProvinces: Province[],
    maxHumanCash: number,
    humanGdp: number,
  ): PeaceTermsPackage {
    const sortedHumanProvs = [...allHumanProvinces].sort(
      (a, b) => getProvinceGdp(b) - getProvinceGdp(a),
    );
    const provsToCedeCount = Math.min(
      2,
      Math.max(1, allHumanProvinces.length - 1),
    );
    const demandedProvs = sortedHumanProvs.slice(0, provsToCedeCount);
    const demandedMoney = Math.floor(maxHumanCash * 0.6);

    const canAfford =
      humanNation.treasury >= demandedMoney ||
      humanNation.treasury +
        DebtCalculatorUtility.getAvailableLoanHeadroom(
          humanNation.nationalDebt,
          humanGdp,
        ) >=
        demandedMoney;

    return {
      sourceNationId: aiNation.id,
      targetNationId: humanNation.id,
      settlementType: "TERRITORY_CONCESSION",
      ratio,
      sourceTwmi: aiTwmi,
      targetTwmi: humanTwmi,
      isAiOffering: false,
      moneyAmount: demandedMoney,
      concededProvinceIds: demandedProvs.map((p) => p.provinceId),
      concededProvincesNames: demandedProvs.map((p) => p.nameFa),
      headline: "صلح تلخ و آتش‌بس با واگذاری استان مرزی و تاوان سنگین",
      description: `امپراتوری ${aiNation.name} به دلیل برتری قاطع، شرط توقف تهاجم را واگذاری ${demandedProvs.length} استان و پرداخت غرامت جنگی تعیین کرده است.`,
      canAffordTerms: canAfford,
    };
  }

  public static buildHeavyHumanAdvantage(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
    allAiProvinces: Province[],
    maxAiCash: number,
  ): PeaceTermsPackage {
    const sortedProvs = [...allAiProvinces].sort(
      (a, b) => getProvinceGdp(b) - getProvinceGdp(a),
    );
    const provsToConcede = sortedProvs.slice(
      0,
      Math.max(1, sortedProvs.length - 1),
    );

    return {
      sourceNationId: aiNation.id,
      targetNationId: humanNation.id,
      settlementType: "TERRITORY_CONCESSION",
      ratio,
      sourceTwmi: aiTwmi,
      targetTwmi: humanTwmi,
      isAiOffering: true,
      moneyAmount: maxAiCash,
      concededProvinceIds: provsToConcede.map((p) => p.provinceId),
      concededProvincesNames: provsToConcede.map((p) => p.nameFa),
      headline: "پیشنهاد واگذاری حداکثر قلمرو و تخلیه کامل خزانه و وام‌ها",
      description: `دولت ${aiNation.name} برای نجات بقای خود، پیشنهاد واگذاری ${provsToConcede.length} استان به همراه پرداخت ۱۰۰٪ کل موجودی نقد و توان استقراض خزانه‌اش را دارد.`,
      canAffordTerms: true,
    };
  }

  public static buildModerateHumanAdvantage(
    aiNation: Nation,
    humanNation: Nation,
    ratio: number,
    aiTwmi: number,
    humanTwmi: number,
    allAiProvinces: Province[],
    maxAiCash: number,
    provincesMap?: Record<string, Province>,
  ): PeaceTermsPackage {
    const f = (1.0 - ratio) / 0.5;
    const money = Math.floor(maxAiCash * f * 0.5);

    const borderProvs = allAiProvinces.filter((p) =>
      LandNeighborResolver.hasProvinceLandBorder(
        p.provinceId,
        humanNation.id,
        provincesMap,
      ),
    );
    const chosenProvs =
      f >= 0.5 && borderProvs.length > 0
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
      concededProvincesNames: chosenProvs.map((p) => p.nameFa),
      headline:
        chosenProvs.length > 0
          ? "پیشنهاد واگذاری استان مرزی و پرداخت غرامت"
          : "پیشنهاد پرداخت غرامت نقدی جنگی",
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
    allHumanProvinces: Province[],
    maxHumanCash: number,
    humanGdp: number,
    provincesMap?: Record<string, Province>,
  ): PeaceTermsPackage {
    const v = (ratio - 1.0) / 1.0;
    const demandedMoney = Math.floor(maxHumanCash * v * 0.5);

    const humanBorderProvs = allHumanProvinces.filter((p) =>
      LandNeighborResolver.hasProvinceLandBorder(
        p.provinceId,
        aiNation.id,
        provincesMap,
      ),
    );
    const demandedProvs =
      v >= 0.5 && humanBorderProvs.length > 0
        ? [
            [...humanBorderProvs].sort(
              (a, b) => getProvinceGdp(b) - getProvinceGdp(a),
            )[0]!,
          ]
        : [];

    const settlementType: PeaceSettlementType =
      demandedProvs.length > 0 ? "TERRITORY_CONCESSION" : "INDEMNITY";

    const canAfford =
      humanNation.treasury >= demandedMoney ||
      humanNation.treasury +
        DebtCalculatorUtility.getAvailableLoanHeadroom(
          humanNation.nationalDebt,
          humanGdp,
        ) >=
        demandedMoney;

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
      concededProvincesNames: demandedProvs.map((p) => p.nameFa),
      headline:
        demandedProvs.length > 0
          ? "مطالبه واگذاری استان مرزی و غرامت جنگی"
          : "مطالبه پرداخت غرامت نقدی برای آتش‌بس",
      description: `امپراتوری ${aiNation.name} با اتکا به برتری نظامی خود، شرط پایان جنگ را پرداخت تاوان اعلام کرده است.`,
      canAffordTerms: canAfford,
    };
  }
}
