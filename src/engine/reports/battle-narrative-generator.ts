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
      attackerCasualties,
      defenderCasualties,
    } = input;

    const formattedArea = conqueredAreaSqKm.toLocaleString("fa-IR");

    let title = "";
    let summary = "";
    let strategicAssessment = "";

    if (isVictory) {
      if (severity === "CRUSHING_VICTORY") {
        title = `پیروزی قاطع در جبهه ${defenderNameFa}`;
        summary = `نیروهای ${attackerNameFa} با هجوم هماهنگ، دفاع ${defenderNameFa} را درهم شکستند. ${formattedArea} km² تصرف شد. تلفات دشمن: ${defenderCasualties.infantryLost} یگان پیاده، ${defenderCasualties.airForceLost} جنگنده.`;
        strategicAssessment =
          "تلفات دشمن به حد بحرانی رسیده و خطوط پدافندی منطقه هدف سقوط کرد.";
      } else if (severity === "PYRRHIC_VICTORY") {
        title = `پیشروی پرهزینه در جبهه ${defenderNameFa}`;
        summary = `موفق به تصرف ${formattedArea} km² از اراضی ${defenderNameFa} شدیم، اما تلفات سنگینی به یگان‌های مهاجم وارد شد (${attackerCasualties.infantryLost} پیاده‌نظام و ${attackerCasualties.airForceLost} جنگنده).`;
        strategicAssessment =
          "مقاومت مدافع سنگین‌تر از برآورد اولیه بود. تجدید قوا قبل از عملیات بعدی الزامی است.";
      } else {
        title = `پیشروی و تثبیت مواضع در خاک ${defenderNameFa}`;
        summary = `عملیات نبرد با موفقیت اجرا شد و ${formattedArea} km² از منطقه هدف تحت کنترل درآمد.`;
        strategicAssessment =
          "مواضع پدافندی جدید در منطقه تصرف‌شده مستقر گردید.";
      }
    } else {
      if (severity === "CRITICAL_DEFEAT") {
        title = `شکست سنگین عملیات در جبهه ${defenderNameFa}`;
        summary = `تهاجم علیه ${defenderNameFa} با پاتک شدید مدافع شکست خورد. تلفات خودی: ${attackerCasualties.infantryLost} پیاده‌نظام و ${attackerCasualties.airForceLost} فروند جنگنده.`;
        strategicAssessment =
          "نیروها مجبور به عقب‌نشینی به پایگاه اولیه شدند. تجدید ساختار ارتش الزامی است.";
      } else {
        title = `عقب‌نشینی تاکتیکی از جبهه ${defenderNameFa}`;
        summary = `پیشروی نیروها متوقف شد و یگان‌ها برای جلوگیری از تلفات بیشتر به خطوط پشتی بازگشتند.`;
        strategicAssessment =
          "پدافند بومی دشمن مانع از پیشروی کامل شد. تقویت پوشش هوایی پیشنهاد می‌شود.";
      }
    }

    return { title, summary, strategicAssessment };
  }
}
