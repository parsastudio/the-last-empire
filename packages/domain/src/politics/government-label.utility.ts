import { GovernmentType } from "@/domain/politics/politics.schema";

export interface GovernmentOption {
  type: GovernmentType;
}

export const GOVERNMENT_OPTIONS: GovernmentOption[] = [
  { type: "PLURALIST_PARLIAMENTARY" },
  { type: "CENTRALIZED_PRESIDENTIAL" },
  { type: "IDEOLOGICAL_REGIME" },
  { type: "HEREDITARY_MONARCHY" },
  { type: "TECHNOCRATIC_ONE_PARTY" },
];

export function getGovernmentTypeLabel(
  type: string,
  locale: "fa" | "en" = "fa",
): string {
  const persianMap: Record<GovernmentType, string> = {
    PLURALIST_PARLIAMENTARY: "جمهوری پارلمانی (دموکراسی)",
    CENTRALIZED_PRESIDENTIAL: "جمهوری ریاستی مقتدر",
    IDEOLOGICAL_REGIME: "حاکمیت ایدئولوژیک و انقلابی",
    HEREDITARY_MONARCHY: "پادشاهی سنتی و موروثی",
    TECHNOCRATIC_ONE_PARTY: "دولت تکنوکرات صنعتی (فرماندهی کارخانه‌ها)",
  };

  const englishMap: Record<GovernmentType, string> = {
    PLURALIST_PARLIAMENTARY: "Pluralist Parliamentary Republic",
    CENTRALIZED_PRESIDENTIAL: "Centralized Presidential Republic",
    IDEOLOGICAL_REGIME: "Ideological Revolutionary Regime",
    HEREDITARY_MONARCHY: "Hereditary Traditional Monarchy",
    TECHNOCRATIC_ONE_PARTY: "Technocratic Industrial State",
  };

  const map = locale === "en" ? englishMap : persianMap;
  if (type in map) {
    return map[type as GovernmentType];
  }
  return type;
}
