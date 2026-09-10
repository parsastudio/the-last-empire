import { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentOption {
  type: GovernmentType | string;
  name: string;
  desc: string;
}

export const GOVERNMENT_TYPE_PERSIAN_MAP: Record<GovernmentType, string> = {
  PLURALIST_PARLIAMENTARY: "جمهوری پارلمانی (دموکراسی)",
  CENTRALIZED_PRESIDENTIAL: "جمهوری ریاستی مقتدر",
  IDEOLOGICAL_REGIME: "حاکمیت ایدئولوژیک و انقلابی",
  HEREDITARY_MONARCHY: "پادشاهی سنتی و موروثی",
  TECHNOCRATIC_ONE_PARTY: "دولت تکنوکرات صنعتی (فرماندهی کارخانه‌ها)",
};

export const GOVERNMENT_OPTIONS: GovernmentOption[] = [
  {
    type: "PLURALIST_PARLIAMENTARY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.PLURALIST_PARLIAMENTARY,
    desc: "آزادی پژوهش و رشد سریع علم، رفاه بالا در صلح؛ اما تحمل پایین مردم در جنگ فرسایشی.",
  },
  {
    type: "CENTRALIZED_PRESIDENTIAL",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.CENTRALIZED_PRESIDENTIAL,
    desc: "دولت اجرایی مقتدر، اختیارات متمرکز، تصمیم‌گیری چابک نظامی و توازن در توسعه.",
  },
  {
    type: "IDEOLOGICAL_REGIME",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.IDEOLOGICAL_REGIME,
    desc: "بسیج سراسری ارتش، روحیه پولادین در جنگ‌های سخت و مقاومت بالا در برابر فرسودگی نظامی.",
  },
  {
    type: "HEREDITARY_MONARCHY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.HEREDITARY_MONARCHY,
    desc: "ثبات سیاسی بتنی، وفاداری سنتی ارتش و ایمنی در برابر شورش، با ساختار محافظه‌کارانه.",
  },
  {
    type: "TECHNOCRATIC_ONE_PARTY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.TECHNOCRATIC_ONE_PARTY,
    desc: "ساخت کارخانه و ادوات ارزان‌تر با انضباط شدید دولتی، اما پرهزینه در نگهداری تجهیزات پیشرفته.",
  },
];

export function getGovernmentTypeLabel(type: string): string {
  if (type in GOVERNMENT_TYPE_PERSIAN_MAP) {
    return GOVERNMENT_TYPE_PERSIAN_MAP[type as GovernmentType];
  }
  return type;
}
