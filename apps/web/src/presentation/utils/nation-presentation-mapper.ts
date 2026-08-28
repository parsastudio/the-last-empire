import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { getGovernmentTypeLabel } from "@/domain/politics/government-label.utility";
import { AiDoctrineType } from "@geopolitics/domain";

export interface FormattedNationPresentation {
  id: string;
  name: string;
  code: string;
  flagCode: string;
  flagEmoji: string;
  rank: number;
  powerLabel: string;
  gdpText: string;
  populationText: string;
  treasuryText: string;
  governmentLabel: string;
  doctrineLabel: string;
}

export const DOCTRINE_LABELS: Record<AiDoctrineType, string> = {
  ARMS_IMPORTER_RENTIER: "واردکننده تسلیحات (نفت‌پایه)",
  DOMESTIC_INDUSTRIALIST: "توسعه‌گرای بومی و خودکفا",
  MERCANTILE_ECONOMIC: "بازرگان رفاه‌محور و صنعتی",
  MILITARIST_HAWK: "شاهین تمامیت‌خواه نظامی",
  GLOBAL_HEGEMON: "ابرقدرت جهانی توازن‌بخش",
};

export const DOCTRINE_DESCRIPTIONS: Record<AiDoctrineType, string> = {
  ARMS_IMPORTER_RENTIER:
    "تأمین تسلیحات پیشرفته از بازار صادرکنندگان برتر و اتکا به توان مالی به جای ساخت داخل.",
  DOMESTIC_INDUSTRIALIST:
    "تمرکز بر صنایع دفاعی بومی، پژوهش مستقل و تولید مستقیم تجهیزات در پادگان‌های ملی.",
  MERCANTILE_ECONOMIC:
    "اولویت اول بر توسعه زیرساخت، مسکن، بهره‌وری و انباشت ثروت پایدار با حداقل هزینه ارتش در صلح.",
  MILITARIST_HAWK:
    "حداکثرسازی ظرفیت ارتش، تکیه بر یگان‌های تهاجمی و آمادگی مداوم برای نبردهای سرنوشت‌ساز.",
  GLOBAL_HEGEMON:
    "تلفیق پیشتازی علمی، صنایع دفاع بومی، صادرات تسلیحاتی و تسلط هم‌زمان بر اقتصاد و موازنه قدرت جهان.",
};

export function getDoctrineLabel(doctrine?: AiDoctrineType | string): string {
  if (!doctrine) return "توسعه‌گرای بومی و خودکفا";
  return DOCTRINE_LABELS[doctrine as AiDoctrineType] || doctrine;
}

export function getDoctrineDescription(
  doctrine?: AiDoctrineType | string,
): string {
  if (!doctrine) return "";
  return DOCTRINE_DESCRIPTIONS[doctrine as AiDoctrineType] || "";
}

export class NationPresentationMapper {
  public static getFlagEmoji(code: string | number): string {
    return getFlagEmoji(String(code));
  }

  public static getPowerLabel(gdp: number): string {
    if (gdp >= 10e12) return "ابرقدرت جهانی";
    if (gdp >= 1e12) return "قدرت برتر صنعتی";
    if (gdp >= 200e9) return "قدرت فرامنطقه‌ای";
    return "قدرت منطقه‌ای";
  }

  public static formatPopulation(population: number): string {
    return PersianNumberFormatter.formatCompactNumber(population) + " نفر";
  }

  public static formatTerritoryPixels(pixels: number): string {
    const formatted = PersianNumberFormatter.formatNumberWithCommas(
      Math.round(pixels),
    );
    return `${formatted} پیکسل`;
  }

  public static formatNationSummary(
    id: string,
    nameFa: string,
    code: string,
    flagCode: string,
    rank: number,
    gdp: number,
    population: number,
    governmentType: string,
    treasury?: number,
    doctrine?: AiDoctrineType | string,
  ): FormattedNationPresentation {
    const computedTreasury = treasury ?? Math.floor(gdp * 0.05);
    const cleanCode = code.toUpperCase();

    return {
      id: cleanCode,
      name: nameFa,
      code: cleanCode,
      flagCode: (flagCode || cleanCode).toUpperCase(),
      flagEmoji: this.getFlagEmoji(flagCode || cleanCode),
      rank,
      powerLabel: this.getPowerLabel(gdp),
      gdpText: PersianNumberFormatter.formatCurrency(gdp, true),
      populationText: this.formatPopulation(population),
      treasuryText: PersianNumberFormatter.formatCurrency(computedTreasury),
      governmentLabel: getGovernmentTypeLabel(governmentType),
      doctrineLabel: getDoctrineLabel(doctrine),
    };
  }
}
