import { TurnLogParamValue } from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/domain/shared/persian-number-formatter";

export class DiplomacyLogFormatter {
  public static format(
    eventCode: string,
    sourceName: string,
    targetName: string,
    params: Record<string, TurnLogParamValue>,
  ): string | null {
    switch (eventCode) {
      case "DIPLOMATIC_PROPOSAL_SENT": {
        const rawType = String(params["treatyType"] || "معاهده");
        const treatyTypeFa =
          rawType === "STRATEGIC_PARTNERSHIP"
            ? "شراکت استراتژیک و اقتصادی"
            : rawType === "NON_AGGRESSION_PACT"
              ? "پیمان عدم تخاصم"
              : rawType === "SECURITY_GUARANTEE"
                ? "پیمان چتر امنیتی و تضمین بقا"
                : rawType === "EMERGENCY_PROTECTORATE"
                  ? "معاهده استعماری تحت‌الحمایگی اضطراری"
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

      case "SECURITY_GUARANTEE_SIGNED":
        return `انعقاد پیمان چتر امنیتی: کشور ${sourceName} با پرداخت نوبتی ۲٪ GDP، رسماً تحت چتر تضمین دفاعی امپراتوری ${targetName} قرار گرفت.`;

      case "SECURITY_GUARANTEE_CANCELLED": {
        const reason = String(params["reason"] || "فسخ معاهده");
        return `لغو چتر امنیتی: پیمان تضمین امنیت میان ${sourceName} و ${targetName} لغو گردید (${reason}).`;
      }

      case "EMERGENCY_PROTECTORATE_SIGNED":
        return `امضای معاهده تحت‌الحمایگی استعماری: کشور ${sourceName} در ازای پرداخت ۵٪ خراج نوبتی و واگذاری استقلال سیاسی، تحت حفاظت کامل نیروی ضربت فوق‌پیشرفته ${targetName} (۵۰٪ GDP) قرار گرفت.`;

      case "EMERGENCY_PROTECTORATE_CANCELLED":
        return `لغو معاهده تحت‌الحمایگی: کشور ${sourceName} رسماً به پیمان استعماری با امپراتوری ${targetName} پایان داد و حاکمیت مستقل خود را اعلام کرد.`;

      case "GUARANTOR_CASUALTY_COST_INCURRED": {
        const costNum = Number(params["cost"] || 0);
        const formattedCost = PersianNumberFormatter.formatCurrency(
          costNum,
          true,
        );
        return `گزارش ستاد کل: نیروی ضربت اعزامی شما در دفاع از خاک ${targetName} آسیب دید و مبلغ ${formattedCost} هزینه بازسازی به خزانه‌داری تحمیل شد.`;
      }

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
