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
        return `هشدار بحران مالی و ورشکستگی ملی: به دلیل رسیدن بدهی به ۱۰۰٪ GDP، خزانه‌داری کشور ${sourceName} تخلیه، بدهی‌ها با نکول رسمی صفر، و بهره‌وری زیرساخت‌های کشور ۲۵٪ تنزل یافت.`;

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
        return defaultMessage || "رویداد ثبت‌شده حاکمیتی";
    }
  }
}
