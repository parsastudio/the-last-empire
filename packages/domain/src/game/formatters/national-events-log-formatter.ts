import { TurnLogParamValue } from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/domain/shared/persian-number-formatter";

export class NationalEventsLogFormatter {
  public static format(
    eventCode: string,
    sourceName: string,
    targetName: string,
    params: Record<string, TurnLogParamValue>,
    defaultMessage: string,
  ): string {
    switch (eventCode) {
      case "NATION_BANKRUPTCY":
        return `هشدار بحران مالی و ورشکستگی ملی: به دلیل رسیدن بدهی به ۴۵٪ GDP، خزانه‌داری کشور ${sourceName} تخلیه، بدهی‌ها با نکول رسمی صفر، و بهره‌وری زیرساخت‌های کشور ۲۵٪ تنزل یافت.`;

      case "DILEMMA_RESOLVED": {
        const title = String(params["eventTitle"] || "رویداد ملی");
        const choice = String(params["choiceLabel"] || "تصمیم حاکمیت");
        return `فرمان حاکمیتی در بحران «${title}»: گزینه «${choice}» توسط رهبری کشور ${sourceName} ابلاغ گردید.`;
      }

      case "ESPIONAGE_OPERATION": {
        const role = String(params["role"] || "ATTACKER");
        const rawMsg = params["details"]
          ? String(params["details"])
          : defaultMessage;
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
        const tradeType = String(params["tradeType"] || "ARMS");

        if (tradeType === "MACHINERY") {
          if (role === "BUYER") {
            return `واردات خطوط تولید: خرید و تجهیز ماشین‌آلات صنعتی پیشرفته به ارزش ${formattedAmount} از کشور ${targetName}.`;
          }
          return `صادرات صنعتی و خطوط تولید: کشور ${targetName} تجهیزات و ماشین‌آلات پیشرفته صنعتی را به ارزش ${formattedAmount} از صنایع شما خریداری کرد.`;
        }

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

      case "MACHINERY_EXPORT_SUMMARY": {
        const count = Number(params["buyersCount"] || 0);
        const profit = Number(params["totalProfit"] || 0);
        return `مجموعاً ${PersianNumberFormatter.toPersianDigits(count)} کشور خطوط تولید و ماشین‌آلات پیشرفته صنعتی از شما خریداری کردند و مبلغ ${PersianNumberFormatter.formatCurrency(profit, true)} سود به خزانه واریز گردید.`;
      }

      case "GENERIC_EVENT":
      default:
        return defaultMessage || "رویداد ثبت‌شده حاکمیتی";
    }
  }
}
