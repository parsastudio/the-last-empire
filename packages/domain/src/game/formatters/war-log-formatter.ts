import { TurnLogParamValue } from "@/domain/game/game-state.schema";
import { AppLocale } from "@/domain/shared/locale-number-formatter";

export class WarLogFormatter {
  public static format(
    eventCode: string,
    sourceName: string,
    targetName: string,
    params: Record<string, TurnLogParamValue>,
    locale: AppLocale = "fa",
  ): string | null {
    switch (eventCode) {
      case "WAR_DECLARED": {
        if (params["isRetaliation"]) {
          const defaultProtected =
            locale === "en" ? "its defense ally" : "متحد دفاعی خود";
          const protectedName = String(
            params["protectedTargetName"] || defaultProtected,
          );

          if (locale === "en") {
            const reasonText =
              params["retaliationReason"] === "DEFENSE_GUARANTOR"
                ? "Mutual Territorial Defense Pact"
                : params["retaliationReason"] === "GUARANTOR"
                  ? "Security Umbrella Defense Protocol"
                  : "Defense Solidarity Accord";
            return `Geopolitical Crisis Alert: ${sourceName} officially declared war and mobilized forces against you citing the ${reasonText} in response to incursion on ${protectedName}!`;
          }

          const reasonText =
            params["retaliationReason"] === "DEFENSE_GUARANTOR"
              ? "پیمان دفاع سرزمینی متقابل"
              : params["retaliationReason"] === "GUARANTOR"
                ? "چتر امنیتی و دفاع سرزمینی"
                : "پیمان همبستگی دفاعی";
          return `هشدار بحران ژئوپلیتیک: امپراتوری ${sourceName} در پاسخ به تهاجم شما به خاک ${protectedName}، با استناد به ${reasonText} رسماً به شما اعلان جنگ کرد و وارد جبهه نبرد شد!`;
        }

        return locale === "en"
          ? `Official Declaration of War: ${sourceName} issued a formal declaration of war against ${targetName}, ordering nationwide military mobilization.`
          : `اعلان جنگ رسمی: کشور ${sourceName} علیه ${targetName} بیانیه رسمی صادر کرده و فرمان آتش سراسری را ابلاغ نمود.`;
      }

      case "VICTORY_ACHIEVED": {
        const reason = String(params["reason"] || "");
        if (reason === "HUMAN_PLAYER_DEFEATED") {
          return locale === "en"
            ? `Total Sovereignty Collapse: The realm of ${sourceName} lost all territorial holdings, garrisons, and governance structure.`
            : `سقوط و فروپاشی کامل: حاکمیت ${sourceName} تمامی استان‌ها و مواضع خود را از دست داد و پرونده حاکمیت آن بسته شد.`;
        }
        return locale === "en"
          ? `Historic Decisive Victory: The empire of ${sourceName} achieved absolute hegemony over global politics and economy.`
          : `فتح قاطع و پیروزی تاریخی: امپراتوری ${sourceName} به برتری مطلق بر جهان دست یافت و سند هژمونی بین‌المللی را امضا کرد.`;
      }

      case "COALITION_FORMED": {
        const defaultMembers =
          locale === "en" ? "Superpowers" : "قدرت‌های بزرگ";
        const members = String(params["memberNames"] || defaultMembers);
        return locale === "en"
          ? `Emergency Containment Coalition: The powers [${members}] enacted a mutual defense containment accord, declaring total war on ${sourceName} with peace permanently barred.`
          : `پیمان مهار اضطراری: کشورهای [${members}] با امضای معاهده دفاع جمعی، رسماً علیه امپراتوری ${sourceName} اعلام جنگ کرده و صلح را ناممکن دانستند.`;
      }

      case "BATTLE_TACTICAL_REPORT": {
        const customHeadline = params["humanHeadline"]
          ? String(params["humanHeadline"])
          : "";
        if (customHeadline) {
          return customHeadline;
        }

        const outcome = String(params["outcome"] || "VICTORY");
        const ratio = params["ratio"] ? String(params["ratio"]) : "1";

        if (locale === "en") {
          const betrayal = params["betrayalPenalty"]
            ? ` [Surprise Aggression Penalty: -${String(params["betrayalPenalty"])} Prestige]`
            : "";
          if (outcome === "CAPITULATION") {
            return `Unconditional Capitulation: ${sourceName} military crushed ${targetName} with a decisive ${ratio}x power ratio, annexing all territories and resources.${betrayal}`;
          }
          if (outcome === "VICTORY") {
            return `Battle Victory: ${sourceName} forces broke through ${targetName} defenses and annexed the target province.${betrayal}`;
          }
          if (outcome === "DEFENDED") {
            return `Heroic Defense: Garrisons of ${sourceName} successfully repelled the major offensive from ${targetName}.${betrayal}`;
          }
          return `Defenders of ${targetName} held fortified defensive lines, stopping the advance of ${sourceName}.${betrayal}`;
        }

        const betrayal = params["betrayalPenalty"]
          ? ` [جریمه نقض معاهده: -${String(params["betrayalPenalty"])} اعتبار جهانی]`
          : "";

        if (outcome === "CAPITULATION") {
          return `تسلیم بی‌قیدوشرط: ارتش ${sourceName} با برتری خردکننده ${ratio} برابری، پایتخت و تمام خاک ${targetName} را فتح و غنائم آن را مصادره کرد.${betrayal}`;
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
        if (locale === "en") {
          if (outcome === "VICTORY") {
            return `Frontline Dispatch: Armed forces of ${sourceName} breached the defensive perimeter of ${targetName}, capturing sovereign territory.`;
          }
          return `Frontline Dispatch: Offensive incursion by ${sourceName} was repelled by the entrenched defenders of ${targetName}.`;
        }

        if (outcome === "VICTORY") {
          return `گزارش جبهه نبرد: ارتش ${sourceName} موفق به شکست خطوط دفاعی ${targetName} و تصرف قلمرو گردید.`;
        }
        return `گزارش جبهه نبرد: تهاجم ارتش ${sourceName} به مواضع ${targetName} با مقاومت مدافعان دفع شد.`;
      }

      case "NATION_ANNEXED":
        return locale === "en"
          ? `Complete Annexation & Sovereign Collapse: The empire of ${sourceName} conquered ${targetName}, annexing its entire territory.`
          : `سقوط کامل و الحاق خاک: امپراتوری ${sourceName} کشور ${targetName} را فتح کرد و خاک آن را به طور کامل به قلمرو خود ضمیمه نمود.`;

      case "NATION_COLLAPSED":
        return locale === "en"
          ? `Total State Dissolution: The realm of ${sourceName} was dissolved after losing all sovereign provinces.`
          : `فروپاشی کامل دولت: کشور ${sourceName} به دلیل از دست دادن تمامی قلمروها به طور کامل منحل گردید.`;

      default:
        return null;
    }
  }
}
