import { TurnLogParamValue } from "@/domain/game/game-state.schema";
import {
  LocaleNumberFormatter,
  AppLocale,
} from "@/domain/shared/locale-number-formatter";

export class NationalEventsLogFormatter {
  public static format(
    eventCode: string,
    sourceName: string,
    targetName: string,
    params: Record<string, TurnLogParamValue>,
    defaultMessage: string,
    locale: AppLocale = "fa",
  ): string {
    switch (eventCode) {
      case "NATION_BANKRUPTCY":
        return locale === "en"
          ? `National Bankruptcy Alert: Due to debt breaching 45% GDP, national treasury reserves of ${sourceName} were liquidated, debt defaulted, and infrastructure productivity penalized by 25%.`
          : `هشدار بحران مالی و ورشکستگی ملی: به دلیل رسیدن بدهی به ۴۵٪ GDP، خزانه‌داری کشور ${sourceName} تخلیه، بدهی‌ها با نکول رسمی صفر، و بهره‌وری زیرساخت‌های کشور ۲۵٪ تنزل یافت.`;

      case "DILEMMA_RESOLVED": {
        const defaultTitle =
          locale === "en" ? "National Dilemma" : "رویداد ملی";
        const defaultChoice =
          locale === "en" ? "Executive Decree" : "تصمیم حاکمیت";
        const title = String(params["eventTitle"] || defaultTitle);
        const choice = String(params["choiceLabel"] || defaultChoice);
        return locale === "en"
          ? `Sovereign Decree in Crisis '${title}': Option '${choice}' was ratified by the leadership of ${sourceName}.`
          : `فرمان حاکمیتی در بحران «${title}»: گزینه «${choice}» توسط رهبری کشور ${sourceName} ابلاغ گردید.`;
      }

      case "ESPIONAGE_OPERATION": {
        const role = String(params["role"] || "ATTACKER");
        const rawMsg = params["details"]
          ? String(params["details"])
          : defaultMessage;
        if (role === "DEFENDER") {
          return rawMsg;
        }
        return locale === "en"
          ? `Covert Special Operation against ${targetName}: ${rawMsg}`
          : `عملیات ویژه اطلاعاتی علیه ${targetName}: ${rawMsg}`;
      }

      case "ARMS_TRADE": {
        const amountNum = Number(params["amount"] || 0);
        const formattedAmount = LocaleNumberFormatter.formatCurrency(
          amountNum,
          true,
          locale,
        );
        const role = String(params["role"] || "BUYER");
        const tradeType = String(params["tradeType"] || "ARMS");

        if (tradeType === "MACHINERY") {
          if (role === "BUYER") {
            return locale === "en"
              ? `Industrial Equipment Import: Acquired cutting-edge manufacturing machinery valued at ${formattedAmount} from ${targetName}.`
              : `واردات خطوط تولید: خرید و تجهیز ماشین‌آلات صنعتی پیشرفته به ارزش ${formattedAmount} از کشور ${targetName}.`;
          }
          return locale === "en"
            ? `Industrial Machinery Export: ${targetName} acquired advanced industrial tooling from your factories valued at ${formattedAmount}.`
            : `صادرات صنعتی و خطوط تولید: کشور ${targetName} تجهیزات و ماشین‌آلات پیشرفته صنعتی را به ارزش ${formattedAmount} از صنایع شما خریداری کرد.`;
        }

        if (role === "BUYER") {
          return locale === "en"
            ? `Arms Import: Procured military hardware valued at ${formattedAmount} from ${targetName}.`
            : `خرید و واردات فوری تسلیحات به ارزش ${formattedAmount} از کشور ${targetName}.`;
        }
        return locale === "en"
          ? `Arms Export: Exported weapons systems valued at ${formattedAmount} to ${targetName}.`
          : `فروش و صادرات تسلیحات به ارزش ${formattedAmount} به کشور ${targetName}.`;
      }

      case "ARMS_EXPORT_SUMMARY": {
        const count = Number(params["buyersCount"] || 0);
        const profit = Number(params["totalProfit"] || 0);
        const countStr = LocaleNumberFormatter.toDigits(count, locale);
        const profitStr = LocaleNumberFormatter.formatCurrency(
          profit,
          true,
          locale,
        );

        return locale === "en"
          ? `Arms Export Summary: A total of ${countStr} foreign powers purchased arms from your defense complex, crediting ${profitStr} in export profits to your treasury.`
          : `مجموعاً ${countStr} کشور از صنایع دفاعی شما تسلیحات خریداری کردند و مبلغ ${profitStr} سود به خزانه واریز گردید.`;
      }

      case "MACHINERY_EXPORT_SUMMARY": {
        const count = Number(params["buyersCount"] || 0);
        const profit = Number(params["totalProfit"] || 0);
        const countStr = LocaleNumberFormatter.toDigits(count, locale);
        const profitStr = LocaleNumberFormatter.formatCurrency(
          profit,
          true,
          locale,
        );

        return locale === "en"
          ? `Industrial Assembly Export Summary: A total of ${countStr} foreign nations purchased advanced manufacturing lines, yielding ${profitStr} in state revenue.`
          : `مجموعاً ${countStr} کشور خطوط تولید و ماشین‌آلات پیشرفته صنعتی از شما خریداری کردند و مبلغ ${profitStr} سود به خزانه واریز گردید.`;
      }

      case "GENERIC_EVENT":
      default:
        return (
          defaultMessage ||
          (locale === "en" ? "Sovereign State Event" : "رویداد ثبت‌شده حاکمیتی")
        );
    }
  }
}
