import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

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
      case "NATION_BANKRUPTCY":
        return `هشدار بحران مالی و ورشکستگی ملی: به دلیل رسیدن بدهی به ۱۰۰٪ GDP، خزانه‌داری کشور ${sourceName} تخلیه، بدهی‌ها با نکول رسمی صفر، و بهره‌وری زیرساخت‌های کشور ۲۵٪ تنزل یافت.`;

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

      case "WAR_DECLARED":
        return `اعلان جنگ رسمی: کشور ${sourceName} علیه ${targetName} بیانیه رسمی صادر کرده و فرمان آتش سراسری را ابلاغ نمود.`;

      case "DIPLOMATIC_PROPOSAL_SENT": {
        const rawType = String(params["treatyType"] || "معاهده");
        const treatyTypeFa =
          rawType === "STRATEGIC_PARTNERSHIP"
            ? "شراکت استراتژیک و اقتصادی"
            : rawType === "NON_AGGRESSION_PACT"
              ? "پیمان عدم تخاصم"
              : rawType === "SECURITY_GUARANTEE"
                ? "پیمان چتر امنیتی و تضمین بقا"
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

      case "SECURITY_GUARANTEE_SIGNED": {
        return `انعقاد پیمان چتر امنیتی: کشور ${sourceName} با پرداخت نوبتی ۱۰٪ GDP، رسماً تحت چتر تضمین دفاعی امپراتوری ${targetName} قرار گرفت.`;
      }

      case "SECURITY_GUARANTEE_CANCELLED": {
        const reason = String(params["reason"] || "فسخ معاهده");
        return `لغو چتر امنیتی: پیمان تضمین امنیت میان ${sourceName} و ${targetName} لغو گردید (${reason}).`;
      }

      case "SECURITY_GUARANTEE_DEFENDED": {
        return `مداخله چتر امنیتی: ارتش ${targetName} در راستای اجرای تعهدات پیمان امنیت ملی، نیروی ضربت فوق‌پیشرفته کمکی به میدان نبرد با ${sourceName} اعزام کرد.`;
      }

      case "FOREIGN_AID_SENT": {
        return `بسته کمک مالی و اقتصادی از سوی ${sourceName} به خزانه‌داری ${targetName} واریز گردید.`;
      }

      case "WAR_SUBSIDY_SENT": {
        return `یارانه و کمک جنگی خودکار: در راستای شراکت استراتژیک، کمکی نقدی از سوی ${sourceName} به خزانه‌داری جنگی ${targetName} تزریق شد.`;
      }

      case "ALLIANCE_INTERVENTION":
        return `دفاع جمعی: کشور ${sourceName} در حمایت از ${targetName} وارد نبرد شد.`;

      case "ALLIANCE_BETRAYED":
        return `پیمان‌شکنی دفاعی: کشور ${sourceName} از اجرای تعهدات اتحاد با ${targetName} سر باز زد و پیمان را لغو نمود.`;

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

      case "ESPIONAGE_OPERATION": {
        const role = String(params["role"] || "ATTACKER");
        const rawMsg = params["details"]
          ? String(params["details"])
          : log.message;
        if (role === "DEFENDER") {
          return rawMsg;
        }
        return `عملیات ویژه اطلاعاتی علیه ${targetName}: ${rawMsg}`;
      }

      case "ARMS_TRADE": {
        const amountNum = Number(params["amount"] || 0);
        const formattedAmount = PersianNumberFormatter.formatCurrency(
          amountNum,
          true,
        );
        const role = String(params["role"] || "BUYER");
        if (role === "BUYER") {
          return `خرید و واردات فوری تسلیحات به ارزش ${formattedAmount} از کشور ${targetName}.`;
        }
        return `فروش و صادرات تسلیحات به ارزش ${formattedAmount} به کشور ${targetName}.`;
      }

      case "ARMS_EXPORT_SUMMARY": {
        const count = Number(params["buyersCount"] || 0);
        const profit = Number(params["totalProfit"] || 0);
        return `مجموعاً ${PersianNumberFormatter.toPersianDigits(count)} کشور از صنایع دفاعی شما تسلیحات خریداری کردند و مبلغ ${PersianNumberFormatter.formatCurrency(profit, true)} سود به خزانه واریز گردید.`;
      }

      case "TERRITORY_PURCHASED": {
        const provName = String(params["provinceName"] || "استان");
        return `معامله و الحاق سرزمینی: کشور ${sourceName} استان (${provName}) را از کشور ${targetName} خریداری و رسماً به قلمرو خود الحاق کرد.`;
      }

      case "GENERIC_EVENT":
      default:
        return log.message || "رویداد ثبت‌شده حاکمیتی";
    }
  }
}
