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
    } = input;

    const formattedArea = new Intl.NumberFormat("fa-IR").format(
      Math.round(conqueredAreaSqKm),
    );

    let title = "";
    let summary = "";
    let strategicAssessment = "";

    if (isVictory) {
      if (severity === "CRUSHING_VICTORY") {
        title = `برد قاطع در جبهه ${defenderNameFa}! دفاع دشمن کلا پاشید`;
        summary = `نیروهای ${attackerNameFa} با یک حمله سریع و سنگین دفاع ${defenderNameFa} رو نابود کردن و ${formattedArea} کیلومتر مربع از خاکشون رو گرفتن.`;
        strategicAssessment = `تحلیل اتاق جنگ: هماهنگی عالی نیروها باعث شد کمترین تلفات رو بدیم. دشمن کلا گیج شده.`;
      } else if (severity === "PYRRHIC_VICTORY") {
        title = `پیشروی پرهزینه در جبهه ${defenderNameFa}`;
        summary = `تونستیم ${formattedArea} کیلومتر مربع از خاک ${defenderNameFa} رو تصرف کنیم، اما پدافند سنگینشون تلفات زیادی روی دستمون گذاشت.`;
        strategicAssessment = `تحلیل اتاق جنگ: آتش سنگین دشمن به تجهیزات آسیب زده. باید سریع‌تر نیروها رو جایگزین کنیم.`;
      } else {
        title = `پیشروی موفقیت‌آمیز در خاک ${defenderNameFa}`;
        summary = `حمله نیروهای ما به جبهه ${defenderNameFa} جواب داد و ${formattedArea} کیلومتر مربع از اراضیشون تحت کنترل درآمد.`;
        strategicAssessment = `تحلیل اتاق جنگ: مواضع جدید تثبیت شده و نیروها آماده دستورات بعدی هستند.`;
      }
    } else {
      if (severity === "CRITICAL_DEFEAT") {
        title = `شکست سنگین در حمله به ${defenderNameFa}! تلفات بالا`;
        summary = `فرمانده! متاسفانه عملیات علیه ${defenderNameFa} به دیوار سخت پدافند حریف خورد. نیروهای ما با تلفات سنگین مجبور به عقب‌نشینی شدن.`;
        strategicAssessment = `تحلیل اتاق جنگ: پدافند هوایی و خطوط دفاعی دشمن خیلی قوی‌تر از حد انتظار بود. نیاز به بازسازی سریع ارتش داریم.`;
      } else {
        title = `عقب‌نشینی نیروها از خاک ${defenderNameFa}`;
        summary = `حمله نیروهای پیشرو به ${defenderNameFa} موفقیت‌آمیز نبود و برای جلوگیری از تلفات بیشتر، دستور عقب‌نشینی صادر شد.`;
        strategicAssessment = `تحلیل اتاق جنگ: پیشنهاد میشه اول با پهپادها پدافندشون رو ضعیف کنیم بعد دوباره حمله کنیم.`;
      }
    }

    return { title, summary, strategicAssessment };
  }
}
