import { GovernmentType } from "@/domain/politics/politics.schema";

export const GOVERNMENT_TYPE_PERSIAN_MAP: Record<GovernmentType, string> = {
  DEMOCRACY: "دموکراسی",
  DICTATORSHIP: "حکومت دیکتاتوری",
  MONARCHY: "پادشاهی",
  COMMUNISM: "کمونیسم",
  FASCISM: "فاشیسم",
};

export function getGovernmentTypeLabel(type: string): string {
  if (type in GOVERNMENT_TYPE_PERSIAN_MAP) {
    return GOVERNMENT_TYPE_PERSIAN_MAP[type as GovernmentType];
  }
  return type;
}
