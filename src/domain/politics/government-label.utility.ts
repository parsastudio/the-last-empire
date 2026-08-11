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
    desc: "باعث رشد اقتصادی سریع‌تر و پاداش دیپلماتیک می‌شود، اما در برابر جنگ‌افروزی و فرسایش بحران آسیب‌پذیرتر است.",
  },
  {
    type: "DICTATORSHIP",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.DICTATORSHIP,
    desc: "قدرت متمرکز و پایداری نظامی بالا، اما با هزینه بالای فساد ساختاری و نارضایتی شدید مردمی همراه است.",
  },
  {
    type: "MONARCHY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.MONARCHY,
    desc: "ثبات سنتی بالا، مشروعیت بالا و هزینه‌های بهینه فرمانروایی با انعطاف‌پذیری متوسط در برابر بحران‌ها.",
  },
  {
    type: "COMMUNISM",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.COMMUNISM,
    desc: "بسیج عمومی بالا برای صنایع و ارتش، کاهش هزینه‌های نگهداری ادوات جنگی و تمرکز شدید دولتی.",
  },
  {
    type: "FASCISM",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.FASCISM,
    desc: "قدرت مرگبار تهاجمی و پاداش فوق‌العاده در نبردها، در عوض انزوای جهانی و فرسایش شدید ساختاری.",
  },
];

export function getGovernmentTypeLabel(type: string): string {
  if (type in GOVERNMENT_TYPE_PERSIAN_MAP) {
    return GOVERNMENT_TYPE_PERSIAN_MAP[type as GovernmentType];
  }
  return type;
}
