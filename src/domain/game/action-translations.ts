export const ACTION_TRANSLATIONS: Record<string, string> = {
  TRADE_RESOURCES: "ثبت معامله منابع در بورس جهانی کالا",
  SET_TAX_RATE: "تنظیم و اعمال نرخ جدید مالیات کشوری",
  SET_TARIFF_RATE: "بروزرسانی نرخ تعرفه تجاری گمرک",
  RECRUIT_UNIT: "ثبت سفارش جدید در صف استخدام ارتش",
  INVEST_INFRASTRUCTURE: "نوسازی و توسعه شبکه مواصلاتی مرزی",
  UPGRADE_INDUSTRIAL_LEVEL: "ارتقای سطح صنایع سنگین و تولیدی",
  UNLOCK_DOCTRINE: "آنلاک و فعال‌سازی دکترین راهبردی جدید",
  REQUEST_LOAN: "دریافت تسهیلات و وام اضطراری از بانک جهانی",
  REPAY_DEBT: "تسویه بخشی از بدهی معوق ملی",
  ANTI_CORRUPTION_DRIVE: "تزریق بودجه به آژانس مبارزه با فساد اداری",
  FUND_PROXY_INFLUENCE: "تخصیص بودجه برای عملیات نفوذ پنهان",
  DISBAND_UNIT: "انحلال یگان نظامی و بازگرداندن نیروها",
  CANCEL_RECRUITMENT: "لغو سفارش ساخت در صف ارتش",
  INVEST_RESEARCH: "تزریق بودجه پژوهشی ارتقای فناوری نظامی",
  ACTIVATE_ABILITY: "فعال‌سازی توانمندی ویژه حکومتی",
};

export function translateActionLogMessage(message: string): string {
  for (const [key, translation] of Object.entries(ACTION_TRANSLATIONS)) {
    if (message.includes(key)) {
      return translation;
    }
  }
  return message;
}
