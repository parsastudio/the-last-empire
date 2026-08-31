import { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentOption {
  type: GovernmentType | string;
  name: string;
  desc: string;
}

export const GOVERNMENT_TYPE_PERSIAN_MAP: Record<GovernmentType, string> = {
  PLURALIST_PARLIAMENTARY: "جمهوری کثرت‌گرا و پارلمانی",
  CENTRALIZED_PRESIDENTIAL: "جمهوری ریاستی متمرکز",
  IDEOLOGICAL_REGIME: "حاکمیت ایدئولوژیک",
  HEREDITARY_MONARCHY: "پادشاهی سنتی و موروثی",
  TECHNOCRATIC_ONE_PARTY: "تک‌حزبی توسعه‌گرا (تکنوکرات)",
};

export const GOVERNMENT_OPTIONS: GovernmentOption[] = [
  {
    type: "PLURALIST_PARLIAMENTARY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.PLURALIST_PARLIAMENTARY,
    desc: "دموکراسی نهادینه‌شده، تفکیک قوا، اتکا به بازار آزاد و مشارکت عمومی بر مبنای صندوق آرا.",
  },
  {
    type: "CENTRALIZED_PRESIDENTIAL",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.CENTRALIZED_PRESIDENTIAL,
    desc: "دولت اجرایی مقتدر، تمرکز اختیارات حاکمیتی، هدایت ملی و سازوکارهای انتخابی مدیریت‌شده.",
  },
  {
    type: "IDEOLOGICAL_REGIME",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.IDEOLOGICAL_REGIME,
    desc: "تصمیم‌گیری راهبردی بر مبنای دکترین عقیدتی، رهبری معنوی، آرمان‌گرایی و انسجام فراگیر.",
  },
  {
    type: "HEREDITARY_MONARCHY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.HEREDITARY_MONARCHY,
    desc: "ثبات خاندانی، تکیه بر سنت‌های نهادی دیرینه، پیوستگی تاریخی و اقتدار نمادین موروثی.",
  },
  {
    type: "TECHNOCRATIC_ONE_PARTY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.TECHNOCRATIC_ONE_PARTY,
    desc: "برنامه‌ریزی متمرکز دولتی، انضباط فراگیر سازمانی، نخبه‌گرایی علمی و تمرکز کامل بر رشد جهشی.",
  },
];

export function getGovernmentTypeLabel(type: string): string {
  if (type in GOVERNMENT_TYPE_PERSIAN_MAP) {
    return GOVERNMENT_TYPE_PERSIAN_MAP[type as GovernmentType];
  }
  return type;
}
