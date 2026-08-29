import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import {
  getNationGdp,
  getProvinceGdp,
} from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { MilitaryPayrollCalculator } from "@/engine/economy/calculators/payroll-calculator";
import { FiscalRevenueCalculator } from "@/engine/economy/calculators/fiscal-revenue-calculator";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { PeaceTermsPackage, PeaceSettlementType } from "./peace-terms.schema";

export class PeaceTermsCalculator {
  public static calculateTwmi(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): number {
    const gdp = getNationGdp(nation, provincesMap);
    const treasury = Math.max(0, nation.treasury);
    const loanHeadroom = Math.max(
      0,
      Math.floor(gdp * 0.8) - nation.nationalDebt,
    );

    const fiscal = FiscalRevenueCalculator.calculate(
      nation,
      nationsMap,
      provincesMap,
    );
    const payroll = MilitaryPayrollCalculator.calculatePayroll(
      nation,
      provincesMap,
    );
    const debtInterest = Math.floor(nation.nationalDebt * 0.07);
    const securityFee = nation.securityGuarantorId ? Math.floor(gdp * 0.1) : 0;

    const netTurnIncome =
      fiscal.totalRevenue - (payroll.total + debtInterest + securityFee);
    const armyValuation = MilitaryPricingCalculator.calculateTotalArmyValuation(
      nation.military,
    );

    let guarantorValuation = 0;
    if (nation.securityGuarantorId && nationsMap) {
      const gCanonical = CountryRegistry.resolveCanonicalId(
        nation.securityGuarantorId,
      );
      const guarantor =
        nationsMap[gCanonical] || nationsMap[nation.securityGuarantorId];
      if (guarantor && guarantor.isAlive) {
        guarantorValuation = Math.floor(gdp * 0.3);
      }
    }

    const totalScore =
      treasury +
      loanHeadroom +
      Math.max(0, netTurnIncome) +
      armyValuation +
      guarantorValuation;

    return Math.max(1_000_000_000, totalScore);
  }

  public static calculateTerms(
    humanNation: Nation,
    aiNation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): PeaceTermsPackage {
    const humanTwmi = this.calculateTwmi(humanNation, nationsMap, provincesMap);
    const aiTwmi = this.calculateTwmi(aiNation, nationsMap, provincesMap);

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
        Math.max(0, Math.floor(aiGdp * 0.8) - aiNation.nationalDebt),
    );
    const maxHumanCash = Math.max(
      0,
      humanNation.treasury +
        Math.max(0, Math.floor(humanGdp * 0.8) - humanNation.nationalDebt),
    );

    if (ratio >= 2.0) {
      return {
        sourceNationId: aiNation.id,
        targetNationId: humanNation.id,
        settlementType: "FULL_CAPITULATION",
        ratio,
        sourceTwmi: aiTwmi,
        targetTwmi: humanTwmi,
        isAiOffering: false,
        moneyAmount: 0,
        concededProvinceIds: allHumanProvinces.map((p) => p.provinceId),
        concededProvincesNames: allHumanProvinces.map((p) => p.nameFa),
        headline: "مطالبه تسلیم بی‌قیدوشرط و انحلال کامل حاکمیت",
        description: `امپراتوری ${aiNation.name} به دلیل برتری نظامی و اقتصادی قاطع، حاضر به هیچ‌گونه صلح جزئی نیست و تنها تسلیم کامل شما را می‌پذیرد.`,
        canAffordTerms: true,
      };
    }

    if (ratio <= 0.5) {
      const isHopeless =
        allAiProvinces.length <= 2 || aiNation.government.stability <= 20;

      if (isHopeless) {
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
        moneyAmount: Math.floor(maxAiCash * 0.8),
        concededProvinceIds: provsToConcede.map((p) => p.provinceId),
        concededProvincesNames: provsToConcede.map((p) => p.nameFa),
        headline: "پیشنهاد واگذاری حداکثر قلمرو و پرداخت باج سنگین",
        description: `دولت ${aiNation.name} برای نجات بقای خود، پیشنهاد واگذاری ${provsToConcede.length} استان به همراه پرداخت بخش عمده خزانه‌اش را دارد.`,
        canAffordTerms: true,
      };
    }

    if (ratio >= 0.9 && ratio <= 1.1) {
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
        headline: "معاهده صلح سفید و ترک فوری مخاصمه",
        description: `به دلیل موازنه نزدیک قدرت و فرسودگی جنگی، دو کشور بدون هیچ باج مالی یا تغییر مرزی به جنگ پایان می‌دهند.`,
        canAffordTerms: true,
      };
    }

    if (ratio < 0.9) {
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
        Math.max(0, Math.floor(humanGdp * 0.8) - humanNation.nationalDebt) >=
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
