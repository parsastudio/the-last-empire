import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";

export class TurnLogFormatter {
  private static resolveName(
    id: string | undefined,
    nationsMap?: Record<string, Nation>,
  ): string {
    if (!id) return "کشور نامشخص";
    const canonical = CountryRegistry.resolveCanonicalId(id);
    const nation = nationsMap ? nationsMap[canonical] || nationsMap[id] : null;
    if (nation) return nation.name;
    const profile = CountryRegistry.getCountry(canonical);
    return profile ? profile.nameFa : canonical;
  }

  public static formatMessage(
    log: TurnLogEntry,
    nationsMap?: Record<string, Nation>,
  ): string {
    const sourceName = this.resolveName(log.sourceNationId, nationsMap);
    const targetName = this.resolveName(log.targetNationId, nationsMap);
    const params = log.params || {};

    switch (log.eventCode) {
      case "COALITION_FORMED": {
        const members = String(params["memberNames"] || "قدرت‌های بزرگ");
        return `پیمان مهار اضطراری: کشورهای [${members}] با امضای معاهده دفاع جمعی، رسماً علیه امپراتوری ${sourceName} اعلام جنگ کرده و صلح را ناممکن دانستند.`;
      }

      case "COALITION_MEMBER_FALLEN": {
        const remaining = String(params["remainingCount"] || "۰");
        return `شکست ضلع ائتلاف جهانی: کشور ${sourceName} سقوط کرد (${remaining} قدرت متخاصم از ائتلاف باقی مانده است).`;
      }

      case "WAR_DECLARED":
        return `اعلان جنگ رسمی: کشور ${sourceName} علیه ${targetName} بیانیه رسمی صادر کرده و فرمان آتش سراسری را ابلاغ نمود.`;

      case "DIPLOMATIC_PROPOSAL_SENT": {
        const rawType = String(params["treatyType"] || "معاهده");
        const treatyTypeFa =
          rawType === "FULL_ALLIANCE"
            ? "اتحاد کامل راهبردی"
            : rawType === "NON_AGGRESSION_PACT"
              ? "پیمان عدم تخاصم"
              : rawType === "PEACE_TREATY"
                ? "معاهده صلح"
                : rawType === "SEND_FOREIGN_AID"
                  ? "کمک مالی"
                  : rawType;
        return `پیشنهاد دیپلماتیک: کشور ${sourceName} پیشنهاد رسمی (${treatyTypeFa}) را برای ${targetName} ارسال کرد.`;
      }

      case "TREATY_ACCEPTED": {
        const treatyLabel = String(params["treatyLabel"] || "معاهده");
        return `توافق دیپلماتیک: کشور ${targetName} پیشنهاد (${treatyLabel}) از سوی ${sourceName} را پذیرفت و امضا کرد.`;
      }

      case "TREATY_REJECTED": {
        const treatyLabel = String(params["treatyLabel"] || "معاهده");
        return `رد معاهده دیپلماتیک: کشور ${targetName} پیشنهاد (${treatyLabel}) از سوی ${sourceName} را نپذیرفت.`;
      }

      case "TREATY_CANCELLED": {
        const newStanceName = String(
          params["newStanceName"] || "دیپلماسی عادی",
        );
        return `تنزل روابط دیپلماتیک: کشور ${sourceName} معاهده پیشین با ${targetName} را لغو کرد و روابط به سطح (${newStanceName}) کاهش یافت.`;
      }

      case "FOREIGN_AID_SENT": {
        return `بسته کمک مالی و اقتصادی از سوی ${sourceName} به خزانه‌داری ${targetName} واریز گردید.`;
      }

      case "ALLIANCE_INTERVENTION":
        return `دفاع جمعی متحدین: کشور ${sourceName} در راستای اجرای تعهدات اتحاد نظامی با ${targetName}، وارد جنگ شد.`;

      case "ALLIANCE_BETRAYED":
        return `پیمان‌شکنی دفاعی: کشور ${sourceName} از اجرای تعهدات اتحاد با ${targetName} سر باز زد و پیمان را لغو نمود.`;

      case "BATTLE_TACTICAL_REPORT": {
        const outcome = String(params["outcome"] || "VICTORY");
        const ratio = params["ratio"] ? String(params["ratio"]) : "۱";
        const betrayal = params["betrayalPenalty"]
          ? ` [جریمه نقض معاهده: -${String(params["betrayalPenalty"])} اعتبار جهانی]`
          : "";

        if (outcome === "CAPITULATION") {
          return `به دلیل برتری رزمی ${ratio} برابری ارتش، حاکمیت ${targetName} به طور کامل فروپاشید و تمامی استان‌ها و غنائم تسلیحاتی تسخیر شدند.${betrayal}`;
        }
        if (outcome === "VICTORY") {
          return `ارتش ${sourceName} در نبرد با ${targetName} پیروز شد و استان هدف را تصرف کرد (۲۵٪ نیروهای مجروح بازسازی شدند).${betrayal}`;
        }
        return `مدافعان ${targetName} با مقاومت در خطوط پدافندی مانع پیشروی ارتش ${sourceName} شدند.${betrayal}`;
      }

      case "BATTLE_GLOBAL_NEWS": {
        const outcome = String(params["outcome"] || "VICTORY");
        if (outcome === "VICTORY") {
          return `گزارش جبهه نبرد: ارتش ${sourceName} موفق به شکست خطوط دفاعی ${targetName} و تصرف قلمرو گردید.`;
        }
        return `گزارش جبهه نبرد: حمله سنگین ارتش ${sourceName} به مواضع ${targetName} با مقاومت مدافعان دفع شد.`;
      }

      case "NATION_ANNEXED":
        return `سقوط قطعی و تاریخی: کشور ${targetName} پس از شکست کامل نظامی، به طور مطلق توسط امپراتوری ${sourceName} تصرف و از جغرافیای جهان حذف شد.`;

      case "NATION_COLLAPSED":
        return `فروپاشی کامل دولت: کشور ${sourceName} به دلیل از دست دادن تمامی قلمروها و ساختار حاکمیتی خود به طور کامل منحل گردید.`;

      case "ESPIONAGE_OPERATION": {
        const rawMsg = params["details"]
          ? String(params["details"])
          : log.message;
        return `عملیات ویژه اطلاعاتی علیه ${targetName}: ${rawMsg}`;
      }

      case "ARMS_TRADE": {
        const qty = String(params["quantity"] || "۱");
        const unitName = String(params["unitName"] || "یگان رزمی");
        const role = String(params["role"] || "BUYER");
        if (role === "BUYER") {
          return `واردات فوری تسلیحات: ${qty} یگان ${unitName} از کشور ${targetName} تحویل ارتش شد.`;
        }
        return `صادرات تسلیحات: ${qty} یگان ${unitName} به ${targetName} صادر و سود آن به خزانه واریز گردید.`;
      }

      case "GENERIC_EVENT":
      default:
        return log.message || "رویداد ثبت‌شده حاکمیتی";
    }
  }
}
