import { TurnLogParamValue } from "@/domain/game/game-state.schema";
import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/domain/shared/locale-number-formatter";
import {
  DIPLOMATIC_PROPOSAL_LABELS_FA,
  DIPLOMATIC_PROPOSAL_LABELS_EN,
  DIPLOMATIC_STANCE_LABELS_FA,
  DIPLOMATIC_STANCE_LABELS_EN,
} from "@/domain/diplomacy/diplomacy.config";
import {
  DiplomaticProposalType,
  DiplomaticStance,
} from "@/domain/diplomacy/diplomacy.schema";

export class DiplomacyLogFormatter {
  public static format(
    eventCode: string,
    sourceName: string,
    targetName: string,
    params: Record<string, TurnLogParamValue>,
    locale: AppLocale = "fa",
  ): string | null {
    switch (eventCode) {
      case "DIPLOMATIC_PROPOSAL_SENT": {
        const rawType = String(
          params["treatyType"] || "PEACE_TREATY",
        ) as DiplomaticProposalType;
        const treatyTypeLabel =
          locale === "en"
            ? DIPLOMATIC_PROPOSAL_LABELS_EN[rawType] || String(rawType)
            : DIPLOMATIC_PROPOSAL_LABELS_FA[rawType] || String(rawType);

        return locale === "en"
          ? `Diplomatic Proposal: ${sourceName} sent an official proposal (${treatyTypeLabel}) to ${targetName}.`
          : `پیشنهاد دیپلماتیک: کشور ${sourceName} پیشنهاد رسمی (${treatyTypeLabel}) را برای ${targetName} ارسال کرد.`;
      }

      case "TREATY_ACCEPTED": {
        const defaultLabel = locale === "en" ? "Treaty" : "معاهده";
        const treatyLabel = String(params["treatyLabel"] || defaultLabel);
        const costVal = Number(params["cost"] || 0);

        if (locale === "en") {
          const costNote =
            costVal > 0
              ? ` with a 3% partnership retainer payment of ${LocaleNumberFormatter.formatCurrency(costVal, true, locale)}`
              : "";
          return `Diplomatic Accord: ${targetName} accepted and ratified the (${treatyLabel}) proposed by ${sourceName}${costNote}.`;
        }

        const costNote =
          costVal > 0
            ? ` با پرداخت ۳٪ حق شراکت (${LocaleNumberFormatter.formatCurrency(costVal, true, locale)})`
            : "";
        return `توافق دیپلماتیک: کشور ${targetName} پیشنهاد (${treatyLabel}) از سوی ${sourceName} را${costNote} پذیرفت و امضا کرد.`;
      }

      case "TREATY_REJECTED": {
        const defaultLabel = locale === "en" ? "Treaty" : "معاهده";
        const treatyLabel = String(params["treatyLabel"] || defaultLabel);
        return locale === "en"
          ? `Treaty Rejected: ${targetName} declined the proposed (${treatyLabel}) from ${sourceName}.`
          : `رد معاهده دیپلماتیک: کشور ${targetName} پیشنهاد (${treatyLabel}) از سوی ${sourceName} را نپذیرفت.`;
      }

      case "TREATY_CANCELLED": {
        const rawStance = String(
          params["newStance"] || "NORMAL_DIPLOMACY",
        ) as DiplomaticStance;
        const newStanceName =
          locale === "en"
            ? DIPLOMATIC_STANCE_LABELS_EN[rawStance] ||
              String(params["newStanceName"] || "Normal Diplomacy")
            : DIPLOMATIC_STANCE_LABELS_FA[rawStance] ||
              String(params["newStanceName"] || "دیپلماسی عادی");

        return locale === "en"
          ? `Diplomatic Downgrade: ${sourceName} revoked the bilateral accord with ${targetName}, resetting relations to (${newStanceName}).`
          : `تنزل روابط دیپلماتیک: کشور ${sourceName} معاهده پیشین با ${targetName} را لغو کرد و روابط به سطح (${newStanceName}) کاهش یافت.`;
      }

      case "SECURITY_GUARANTEE_SIGNED": {
        const costVal = Number(params["cost"] || 0);
        if (locale === "en") {
          const costText =
            costVal > 0
              ? ` with a one-time retainer of ${LocaleNumberFormatter.formatCurrency(costVal, true, locale)} (1% Guarantor GDP)`
              : "";
          return `Defense Pact Ratified: ${sourceName}${costText} ratified a mutual territorial defense accord with ${targetName} (direct military intervention upon invasion).`;
        }

        const costText =
          costVal > 0
            ? ` با پرداخت هزینه یک‌باره ${LocaleNumberFormatter.formatCurrency(costVal, true, locale)} (۱٪ GDP ضامن)`
            : "";
        return `انعقاد پیمان دفاعی: کشور ${sourceName}${costText} رسماً تحت پوشش دفاعی امپراتوری ${targetName} قرار گرفت (ورود مستقیم به جنگ در صورت تهاجم متخاصمان).`;
      }

      case "SECURITY_GUARANTEE_CANCELLED": {
        const defaultReason =
          locale === "en" ? "Treaty Termination" : "فسخ معاهده";
        const reason = String(params["reason"] || defaultReason);
        return locale === "en"
          ? `Defense Pact Terminated: Mutual territorial defense obligations between ${sourceName} and ${targetName} were revoked (${reason}).`
          : `لغو پیمان دفاعی: تعهد دفاعی متقابل میان ${sourceName} و ${targetName} لغو گردید (${reason}).`;
      }

      case "DEFENSE_PACT_NEUTRALITY":
        return locale === "en"
          ? `Conflict of Interest & Neutrality: ${sourceName}, holding mutual defense pacts with both belligerents (${targetName} and the aggressor), dissolved both pacts to remain strictly neutral.`
          : `تضاد منافع و اعلام بی‌طرفی: کشور ${sourceName} به دلیل تعهد دفاعی همزمان به دو طرف نبرد (${targetName} و مهاجم)، پیمان دفاعی هر دو طرف را لغو کرده و بی‌طرف ماند.`;

      case "DEFENSE_PACT_REFUSAL_COMPENSATION": {
        const compVal = Number(params["compensationAmount"] || 0);
        const compText = LocaleNumberFormatter.formatCurrency(
          compVal,
          true,
          locale,
        );
        return locale === "en"
          ? `Defense Pact Non-Intervention Compensation: ${sourceName} declined military intervention due to active partnership with the aggressor and disbursed ${compText} indemnity into your treasury.`
          : `انصراف ضامن از دفاع به دلیل شراکت با مهاجم: کشور ${sourceName} از ورود به جنگ علیه شما خودداری کرد و مبلغ ${compText} غرامت نقدی به خزانه شما واریز نمود.`;
      }

      case "EMERGENCY_PROTECTORATE_SIGNED":
        return locale === "en"
          ? `Emergency Protectorate Ratified: ${sourceName} surrendered diplomatic sovereignty to ${targetName} in exchange for 5% turn tribute and a garrisoned 50% GDP strike force.`
          : `امضای معاهده تحت‌الحمایگی استعماری: کشور ${sourceName} در ازای پرداخت ۵٪ خراج نوبتی و واگذاری استقلال سیاسی، تحت حفاظت کامل ارتش ضربت فوق‌پیشرفته ${targetName} (۵۰٪ GDP) قرار گرفت.`;

      case "EMERGENCY_PROTECTORATE_CANCELLED":
        return locale === "en"
          ? `Protectorate Treaty Terminated: ${sourceName} terminated colonial protectorate ties with ${targetName}, restoring full sovereign autonomy.`
          : `لغو معاهده تحت‌الحمایگی: کشور ${sourceName} رسماً به پیمان استعماری با امپراتوری ${targetName} پایان داد و حاکمیت مستقل خود را اعلام کرد.`;

      case "FOREIGN_AID_SENT": {
        const amountNum = Number(params["amount"] || 0);
        if (locale === "en") {
          const amountText =
            amountNum > 0
              ? ` totaling ${LocaleNumberFormatter.formatCurrency(amountNum, true, locale)}`
              : "";
          return `Foreign Aid Disbursed: Sovereign economic package${amountText} transferred from ${sourceName} into the treasury of ${targetName}.`;
        }

        const amountText =
          amountNum > 0
            ? ` به مبلغ ${LocaleNumberFormatter.formatCurrency(amountNum, true, locale)}`
            : "";
        return `بسته کمک مالی و اقتصادی${amountText} از سوی ${sourceName} به خزانه‌داری ${targetName} واریز گردید.`;
      }

      default:
        return null;
    }
  }
}
