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
    desc: "رشد سریع ثبات در صلح (+۱.۶) و امکان وضع نرخ مالیات تا ۳۱٪ برای انباشت ثروت و رشد جمعیت؛ با توان رزمی پایه کمتر (۰.۸۵).",
  },
  {
    type: "MONARCHY",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.MONARCHY,
    desc: "ثبات سنتی بالا و رشد مطمئن در صلح (+۱.۱) با ارتش استاندارد (۱.۰۰)؛ مناسب برای توسعه امن و استراتژی‌های منعطف.",
  },
  {
    type: "COMMUNISM",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.COMMUNISM,
    desc: "تاب‌آوری استثنایی در جنگ‌های طولانی با کمترین افت ثبات در شکست‌ها (-۱.۵) و قدرت نظامی بالاتر (۱.۰۵).",
  },
  {
    type: "DICTATORSHIP",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.DICTATORSHIP,
    desc: "تمرکز قدرت هجومی با ارتش قدرتمند (۱.۱۵) و پاداش بالای پیروزی در نبردها (+۴.۰) با ریسک کنترل‌شده.",
  },
  {
    type: "FASCISM",
    name: GOVERNMENT_TYPE_PERSIAN_MAP.FASCISM,
    desc: "نیروی رزمی ویرانگر (۱.۲۵) و غنائم و ثبات سرشار از فتوحات (+۴.۵)؛ به شدت وابسته به تهاجم مداوم و آسیب‌پذیر در صلح طولانی (+۰.۳).",
  },
];

export function getGovernmentTypeLabel(type: string): string {
  if (type in GOVERNMENT_TYPE_PERSIAN_MAP) {
    return GOVERNMENT_TYPE_PERSIAN_MAP[type as GovernmentType];
  }
  return type;
}
