import { TurnLogParamValue } from "@/domain/game/game-state.schema";

export class WarLogFormatter {
  public static format(
    eventCode: string,
    sourceName: string,
    targetName: string,
    params: Record<string, TurnLogParamValue>,
  ): string | null {
    switch (eventCode) {
      case "WAR_DECLARED":
        return `اعلان جنگ رسمی: کشور ${sourceName} علیه ${targetName} بیانیه رسمی صادر کرده و فرمان آتش سراسری را ابلاغ نمود.`;

      case "VICTORY_ACHIEVED": {
        const reason = String(params["reason"] || "");
        if (reason === "HUMAN_PLAYER_DEFEATED") {
          return `سقوط و فروپاشی کامل: حاکمیت ${sourceName} تمامی استان‌ها و مواضع خود را از دست داد و پرونده حاکمیت آن بسته شد.`;
        }
        return `فتح قاطع و پیروزی تاریخی: امپراتوری ${sourceName} به برتری مطلق بر جهان دست یافت و سند هژمونی بین‌المللی را امضا کرد.`;
      }

      case "COALITION_FORMED": {
        const members = String(params["memberNames"] || "قدرت‌های بزرگ");
        return `پیمان مهار اضطراری: کشورهای [${members}] با امضای معاهده دفاع جمعی، رسماً علیه امپراتوری ${sourceName} اعلام جنگ کرده و صلح را ناممکن دانستند.`;
      }

      case "COALITION_MEMBER_FALLEN": {
        const remaining = String(params["remainingCount"] || "۰");
        return `شکست ضلع ائتلاف جهانی: کشور ${sourceName} سقوط کرد (${remaining} قدرت متخاصم از ائتلاف باقی مانده است).`;
      }

      case "BATTLE_TACTICAL_REPORT": {
        const customHeadline = params["humanHeadline"]
          ? String(params["humanHeadline"])
          : "";
        if (customHeadline) {
          return customHeadline;
        }

        const outcome = String(params["outcome"] || "VICTORY");
        const ratio = params["ratio"] ? String(params["ratio"]) : "۱";
        const betrayal = params["betrayalPenalty"]
          ? ` [جریمه نقض معاهده: -${String(params["betrayalPenalty"])} اعتبار جهانی]`
          : "";

        if (outcome === "CAPITULATION") {
          return `به دلیل برتری رزمی ${ratio} برابری ارتش، حاکمیت ${targetName} به طور کامل فروپاشید و تمامی استان‌ها و غنائم تسلیحاتی تسخیر شدند.${betrayal}`;
        }
        if (outcome === "VICTORY") {
          return `ارتش ${sourceName} در نبرد با ${targetName} پیروز شد و استان هدف را تصرف کرد.${betrayal}`;
        }
        if (outcome === "DEFENDED") {
          return `دفاع جانانه: نیروهای مدافع ${sourceName} تهاجم سنگین ارتش ${targetName} را دفع کردند.${betrayal}`;
        }
        return `مدافعان ${targetName} با مقاومت در خطوط پدافندی مانع پیشروی ارتش ${sourceName} شدند.${betrayal}`;
      }

      case "BATTLE_GLOBAL_NEWS": {
        const outcome = String(params["outcome"] || "VICTORY");
        if (outcome === "VICTORY") {
          return `گزارش جبهه نبرد: ارتش ${sourceName} موفق به شکست خطوط دفاعی ${targetName} و تصرف قلمرو گردید.`;
        }
        return `گزارش جبهه نبرد: تهاجم ارتش ${sourceName} به مواضع ${targetName} با مقاومت مدافعان دفع شد.`;
      }

      case "NATION_ANNEXED":
        return `سقوط قطعی و تاریخی: کشور ${targetName} پس از شکست کامل نظامی، به طور مطلق توسط امپراتوری ${sourceName} تصرف و از جغرافیای جهان حذف شد.`;

      case "NATION_COLLAPSED":
        return `فروپاشی کامل دولت: کشور ${sourceName} به دلیل از دست دادن تمامی قلمروها به طور کامل منحل گردید.`;

      default:
        return null;
    }
  }
}
