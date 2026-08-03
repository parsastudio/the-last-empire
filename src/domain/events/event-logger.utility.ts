import { DomainEvent } from "@/domain/events/domain-event.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export class EventLoggerUtility {
  public static getEventTitle(type: string): string {
    switch (type) {
      case "SET_TAX_RATE":
        return "تنظیم نرخ مالیات ملی";
      case "SET_TARIFF_RATE":
        return "تنظیم تعرفه تجاری گمرک";
      case "RECRUIT_UNIT":
        return "استخدام و سفارش یگان نظامی";
      case "DISBAND_UNIT":
        return "انحلال یگان و بازبازی نیرو";
      case "INITIATE_BATTLE":
        return "تهاجم نظامی مستقیم";
      case "TRADE_RESOURCES":
        return "معامله بورس منابع استراتژیک";
      case "REQUEST_LOAN":
        return "دریافت تسهیلات وام اضطراری";
      case "REPAY_DEBT":
        return "تسویه بدهی معوق ملی";
      case "UPGRADE_INDUSTRIAL_LEVEL":
        return "ارتقای توسعه صنعتی کشور";
      case "INVEST_INFRASTRUCTURE":
        return "نوسازی شبکه زیرساخت و مواصلات";
      case "FUND_PROXY_INFLUENCE":
        return "اجرای عملیات پنهان و جنگ نیابتی";
      case "UNLOCK_DOCTRINE":
        return "آنلاک دکترین راهبردی جدید";
      case "ANTI_CORRUPTION_DRIVE":
        return "اجرای طرح مبارزه با فساد اداری";
      case "ACTIVATE_ABILITY":
        return "فعال‌سازی توانمندی ویژه حکومتی";
      default:
        return type;
    }
  }

  public static formatEventSummary(event: DomainEvent): string {
    const seqText = PersianNumberFormatter.toPersianDigits(
      event.metadata.sequence,
    );
    const turnText = PersianNumberFormatter.toPersianDigits(
      event.metadata.turn,
    );
    const title = this.getEventTitle(event.type);
    const patchCount = PersianNumberFormatter.toPersianDigits(
      event.deltaPatches.length,
    );

    return `رویداد #${seqText} (نوبت ${turnText}): ${title} با ${patchCount} تغییر در ساختار داده.`;
  }
}
