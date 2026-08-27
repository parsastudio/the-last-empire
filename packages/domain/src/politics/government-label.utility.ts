import { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentOption {
  type: GovernmentType | string;
  name: string;
  desc: string;
}

export const GOVERNMENT_TYPE_PERSIAN_MAP: Record<GovernmentType, string> = {
  DEMOCRACY: "دموکراسی",
  DICTATORSHIP: "حکومت دیکتاتوری",
  MONARCHY: "پادشاهی",
  COMMUNISM: "کمونیسم",
  FASCISM: "فاشیسم",
};

export const GOVERNMENT_OPTIONS: GovernmentOption[] = [
  {
    type: "DEMOCRACY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.DEMOCRACY,
    desc: "حاکمیت مردم‌سالار مبتنی بر انتخابات عمومی، پارلمان، تفکیک قوا و آزادی‌های مدنی و قانون‌مدار.",
  },
  {
    type: "MONARCHY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.MONARCHY,
    desc: "نظام پادشاهی و سلطنتی با تکیه بر سنت‌های تاریخی، ثبات نهادی و رهبری موروثی کشور.",
  },
  {
    type: "COMMUNISM",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.COMMUNISM,
    desc: "نظام اشتراکی و تک‌حزبی با تمرکز کامل بر مدیریت منابع عمومی و برابری همگانی.",
  },
  {
    type: "DICTATORSHIP",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.DICTATORSHIP,
    desc: "حکومت متمرکز با اختیارات کامل حاکمیتی، انضباط فراگیر و مدیریت مستقیم ارکان قدرت.",
  },
  {
    type: "FASCISM",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.FASCISM,
    desc: "نظام حاکمیت ملی‌گرا با تمرکز یکپارچه بر اقتدار میهنی، نظم سراسری و انسجام دولت.",
  },
];

export function getGovernmentTypeLabel(type: string): string {
  if (type in GOVERNMENT_TYPE_PERSIAN_MAP) {
    return GOVERNMENT_TYPE_PERSIAN_MAP[type as GovernmentType];
  }
  return type;
}
