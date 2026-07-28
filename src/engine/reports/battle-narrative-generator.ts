import {
  ReportSeverity,
  CasualtyMetrics,
} from "@/domain/reports/combat-report.schema";

export interface NarrativeInput {
  attackerNameFa: string;
  defenderNameFa: string;
  isVictory: boolean;
  severity: ReportSeverity;
  attackerCasualties: CasualtyMetrics;
  defenderCasualties: CasualtyMetrics;
  conqueredAreaSqKm: number;
  governmentType?: string;
}

export interface NarrativeOutput {
  title: string;
  summary: string;
  strategicAssessment: string;
}

export class BattleNarrativeGenerator {
  public generateBattleNarrative(input: NarrativeInput): NarrativeOutput {
    const {
      attackerNameFa,
      defenderNameFa,
      isVictory,
      severity,
      conqueredAreaSqKm,
      defenderCasualties,
    } = input;

    const formattedArea = new Intl.NumberFormat("fa-IR").format(
      Math.round(conqueredAreaSqKm),
    );

    const defenderRetreated = defenderCasualties.infantryRetreated || 0;
    const militiaPower = defenderCasualties.militiaGarrisonPower || 0;

    let title = "";
    let summary = "";
    let strategicAssessment = "";

    if (isVictory) {
      if (severity === "CRUSHING_VICTORY") {
        title = `برد قاطع در جبهه ${defenderNameFa}! خطوط دفاعی فروپاشید`;
        summary = `نیروهای ${attackerNameFa} با حمله سنگین دفاع ${defenderNameFa} را درهم شکستند. ${formattedArea} km² تصرف شد و ${defenderRetreated.toLocaleString("fa-IR")} یگان دشمن عقب‌نشینی کردند.`;
        strategicAssessment = `تحلیل اتاق جنگ: هماهنگی نیروها مانع تلفات کسر شد. نیروهای پادگان مردمی (${militiaPower} یگان) نیز نتوانستند مانع پیشروی شوند.`;
      } else if (severity === "PYRRHIC_VICTORY") {
        title = `پیشروی پرهزینه در جبهه ${defenderNameFa}`;
        summary = `توانستیم ${formattedArea} km² از اراضی ${defenderNameFa} را تصرف کنیم. مابقی نیروهای دشمن به خطوط پشتی عقب‌نشینی کردند.`;
        strategicAssessment = `تحلیل اتاق جنگ: پدافند دشمن و نیروهای پادگان محلی تلفات قابل توجهی وارد ساختند. نیاز به تسریع در بازسازی یگان‌ها است.`;
      } else {
        title = `پیشروی موفقیت‌آمیز در خاک ${defenderNameFa}`;
        summary = `پیشروی نیروها در جبهه ${defenderNameFa} تثبیت شد و ${formattedArea} km² تحت کنترل درآمد.`;
        strategicAssessment = `تحلیل اتاق جنگ: مواضع جدید مستحکم شده و نیروهای دشمن عقب‌نشینی سازمانی انجام دادند.`;
      }
    } else {
      if (severity === "CRITICAL_DEFEAT") {
        title = `عقب‌نشینی سنگین در حمله به ${defenderNameFa}!`;
        summary = `عملیات علیه ${defenderNameFa} با مقاومت شدید ارتش و نیروهای پادگان مردمی مواجه شد. نیروهای ما پس از متحمل شدن تلفات عقب‌نشینی کردند.`;
        strategicAssessment = `تحلیل اتاق جنگ: قدرت پادگان محلی و کمبود احتمالی لجستیک عامل اصلی عدم موفقیت بود. بازسازی فوری نیروها ضروری است.`;
      } else {
        title = `عقب‌نشینی تاکتیکی نیروها از خاک ${defenderNameFa}`;
        summary = `برای جلوگیری از تلفات بیشتر، دستور عقب‌نشینی منظم نیروها صادر شد و اکثریت یگان‌ها به پادگان بازگشتند.`;
        strategicAssessment = `تحلیل اتاق جنگ: پیشنهاد می‌شود پیش از تهاجم مجدد، با حملات موشکی و پهپادی خطوط پادگانی دشمن تضعیف شود.`;
      }
    }

    return { title, summary, strategicAssessment };
  }
}
