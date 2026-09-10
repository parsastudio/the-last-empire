import {
  EconomicDoctrineStance,
  EconomicDoctrineConfig,
} from "./economic-doctrine.schema";

export type { EconomicDoctrineStance, EconomicDoctrineConfig };

export const ECONOMIC_DOCTRINE_CONFIGS: Record<
  EconomicDoctrineStance,
  EconomicDoctrineConfig
> = {
  AUTARKY: {
    stance: "AUTARKY",
    nameFa: "اقتصاد جنگی و خودکفایی مطلق",
    tagline: "تمرکز ۱۰۰٪ بر تولید و منابع درون‌مرزی",
    description:
      "۱۰۰٪ درآمد از داخل؛ مصونیت کامل در برابر تحریم‌ها، محاصره دریایی و باج‌خواهی خارجی.",
    domesticWeight: 1.0,
    globalWeight: 0.0,
    badgeText: "۱۰۰٪ بومی",
  },
  PROTECTIONISM: {
    stance: "PROTECTIONISM",
    nameFa: "اقتصاد ملی و حمایت از کارخانه‌ها",
    tagline: "اولویت ۷۵٪ اقتصاد داخلی و ۲۵٪ تبادلات فرامرزی",
    description:
      "حمایت از صنایع سنگین بومی و حفظ بازارهای استراتژیک در شرایط تنش‌های ژئوپلیتیک.",
    domesticWeight: 0.75,
    globalWeight: 0.25,
    badgeText: "۷۵٪ بومی • ۲۵٪ جهانی",
  },
  BALANCED_MIXED: {
    stance: "BALANCED_MIXED",
    nameFa: "اقتصاد متوازن (تولید ملی + تجارت آزاد)",
    tagline: "موازنه پایدار ۵۰٪ تولید ملی و ۵۰٪ بازرگانی بین‌الملل",
    description:
      "سیاست استاندارد تعادل مالی میان رفاه عمومی، درآمد داخلی و فرصت‌های تجاری با هم‌پیمانان.",
    domesticWeight: 0.5,
    globalWeight: 0.5,
    badgeText: "۵۰٪ بومی • ۵۰٪ جهانی",
  },
  FREE_TRADE: {
    stance: "FREE_TRADE",
    nameFa: "بازرگانی آزاد و بنادر باز",
    tagline: "اتکای ۲۵٪ به داخل و ۷۵٪ به شاهراه‌های بین‌الملل",
    description:
      "گسترش صادرات و جذب سرمایه جهانی با بهره‌گیری حداکثری از دسترسی به آب‌های آزاد.",
    domesticWeight: 0.25,
    globalWeight: 0.75,
    badgeText: "۲۵٪ بومی • ۷۵٪ جهانی",
  },
  MERCANTILE_HUB: {
    stance: "MERCANTILE_HUB",
    nameFa: "شاهراه تجارت جهانی و امپراتوری بنادر",
    tagline: "تمرکز ۱۰۰٪ بر جریان ثروت و ترانزیت غول‌های اقتصادی جهان",
    description:
      "بهره‌برداری کامل از تنگه‌های استراتژیک و مسیرهای دریایی برای خلق ثروت نجومی بدون سقف.",
    domesticWeight: 0.0,
    globalWeight: 1.0,
    badgeText: "۱۰۰٪ تجارت جهانی",
  },
};

export const ALL_ECONOMIC_DOCTRINES: EconomicDoctrineStance[] = [
  "AUTARKY",
  "PROTECTIONISM",
  "BALANCED_MIXED",
  "FREE_TRADE",
  "MERCANTILE_HUB",
];
