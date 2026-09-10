import { TurnLogParamValue } from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/domain/shared/persian-number-formatter";
import {
  DIPLOMATIC_PROPOSAL_LABELS_FA,
  DIPLOMATIC_STANCE_LABELS_FA,
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
  ): string | null {
    switch (eventCode) {
      case "DIPLOMATIC_PROPOSAL_SENT": {
        const rawType = String(
          params["treatyType"] || "معاهده",
        ) as DiplomaticProposalType;
        const treatyTypeFa =
          DIPLOMATIC_PROPOSAL_LABELS_FA[rawType] || String(rawType);
        return `پیشنهاد دیپلماتیک: کشور ${sourceName} پیشنهاد رسمی (${treatyTypeFa}) را برای ${targetName} ارسال کرد.`;
      }

      case "TREATY_ACCEPTED": {
        const treatyLabel = String(params["treatyLabel"] || "معاهده");
        const costVal = Number(params["cost"] || 0);
        const costNote =
          costVal > 0
            ? ` با پرداخت ۳٪ حق شراکت (${PersianNumberFormatter.formatCurrency(costVal, true)})`
            : "";
        return `توافق دیپلماتیک: کشور ${targetName} پیشنهاد (${treatyLabel}) از سوی ${sourceName} را${costNote} پذیرفت و امضا کرد.`;
      }

      case "TREATY_REJECTED": {
        const treatyLabel = String(params["treatyLabel"] || "معاهده");
        return `رد معاهده دیپلماتیک: کشور ${targetName} پیشنهاد (${treatyLabel}) از سوی ${sourceName} را نپذیرفت.`;
      }

      case "TREATY_CANCELLED": {
        const rawStance = String(
          params["newStance"] || "NORMAL_DIPLOMACY",
        ) as DiplomaticStance;
        const newStanceName =
          DIPLOMATIC_STANCE_LABELS_FA[rawStance] ||
          String(params["newStanceName"] || "دیپلماسی عادی");
        return `تنزل روابط دیپلماتیک: کشور ${sourceName} معاهده پیشین با ${targetName} را لغو کرد و روابط به سطح (${newStanceName}) کاهش یافت.`;
      }

      case "SECURITY_GUARANTEE_SIGNED": {
        const costVal = Number(params["cost"] || 0);
        const costText =
          costVal > 0
            ? ` با پرداخت هزینه یک‌باره ${PersianNumberFormatter.formatCurrency(costVal, true)} (۱٪ GDP ضامن)`
            : "";
        return `انعقاد پیمان دفاعی: کشور ${sourceName}${costText} رسماً تحت پوشش دفاعی امپراتوری ${targetName} قرار گرفت (ورود مستقیم به جنگ در صورت تهاجم متخاصمان).`;
      }

      case "SECURITY_GUARANTEE_CANCELLED": {
        const reason = String(params["reason"] || "فسخ معاهده");
        return `لغو پیمان دفاعی: تعهد دفاعی متقابل میان ${sourceName} و ${targetName} لغو گردید (${reason}).`;
      }

      case "DEFENSE_PACT_NEUTRALITY": {
        return `تضاد منافع و اعلام بی‌طرفی: کشور ${sourceName} به دلیل تعهد دفاعی همزمان به دو طرف نبرد (${targetName} و مهاجم)، پیمان دفاعی هر دو طرف را لغو کرده و بی‌طرف ماند.`;
      }

      case "DEFENSE_PACT_REFUSAL_COMPENSATION": {
        const compVal = Number(params["compensationAmount"] || 0);
        const compText = PersianNumberFormatter.formatCurrency(compVal, true);
        return `امتناع ضامن از ورود به جنگ به دلیل شراکت استراتژیک با متهاجم: کشور ${sourceName} از اعلان جنگ امتناع کرد و مبلغ ${compText} (معادل ۵۰٪ حق تعهد دفاعی) را به عنوان غرامت به خزانه‌داری ${targetName} پرداخت نمود.`;
      }

      case "EMERGENCY_PROTECTORATE_SIGNED":
        return `امضای معاهده تحت‌الحمایگی استعماری: کشور ${sourceName} در ازای پرداخت ۵٪ خراج نوبتی و واگذاری استقلال سیاسی، تحت حفاظت کامل ارتش ضربت فوق‌پیشرفته ${targetName} (۵۰٪ GDP) قرار گرفت.`;

      case "EMERGENCY_PROTECTORATE_CANCELLED":
        return `لغو معاهده تحت‌الحمایگی: کشور ${sourceName} رسماً به پیمان استعماری با امپراتوری ${targetName} پایان داد و حاکمیت مستقل خود را اعلام کرد.`;

      case "FOREIGN_AID_SENT": {
        const amountNum = Number(params["amount"] || 0);
        const amountText =
          amountNum > 0
            ? ` به مبلغ ${PersianNumberFormatter.formatCurrency(amountNum, true)}`
            : "";
        return `بسته کمک مالی و اقتصادی${amountText} از سوی ${sourceName} به خزانه‌داری ${targetName} واریز گردید.`;
      }

      default:
        return null;
    }
  }
}
