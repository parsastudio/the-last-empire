import { z } from "zod";
import {
  GovernmentType,
  GovernmentTypeSchema,
} from "@/domain/politics/politics.schema";

export const GovernmentTraitModifierSchema = z.object({
  procurementCostMultiplier: z.number().positive(),
  maintenanceCostMultiplier: z.number().positive(),
  militaryResearchCostMultiplier: z.number().positive(),
  industrialResearchCostMultiplier: z.number().positive(),
  peaceStabilityRecoveryMultiplier: z.number().positive(),
  warStabilityFatigueMultiplier: z.number().positive(),
  crisisStabilityResistanceMultiplier: z.number().positive(),
});

export const GovernmentTraitConfigSchema = z.object({
  type: GovernmentTypeSchema,
  nameFa: z.string(),
  headlineFa: z.string(),
  descriptionFa: z.string(),
  prosFa: z.array(z.string()),
  consFa: z.array(z.string()),
  modifiers: GovernmentTraitModifierSchema,
});

export type GovernmentTraitModifier = z.infer<
  typeof GovernmentTraitModifierSchema
>;
export type GovernmentTraitConfig = z.infer<typeof GovernmentTraitConfigSchema>;

export const GOVERNMENT_TRAITS_CONFIG: Record<
  GovernmentType,
  GovernmentTraitConfig
> = {
  PLURALIST_PARLIAMENTARY: {
    type: "PLURALIST_PARLIAMENTARY",
    nameFa: "جمهوری کثرت‌گرا و پارلمانی",
    headlineFa: "شکوفایی علمی و رفاه در صلح • فرسودگی شدید در جنگ",
    descriptionFa:
      "جامعه باز با تکیه بر دانشگاه‌ها و بازار آزاد که جهش علمی بالایی دارد، اما در جنگ‌های فرسایشی به سرعت دچار نارضایتی می‌شود.",
    prosFa: [
      "۲۰٪ تخفیف در کل هزینه‌های تحقیقات علمی و R&D",
      "۳۰٪ شتاب بیشتر در بازیابی ثبات در دوران صلح",
    ],
    consFa: [
      "۲۰٪ هزینه بیشتر نگهداری ارتش دائم",
      "۵۰٪ افت شدیدتر ثبات در زمان وقوع جنگ",
    ],
    modifiers: {
      procurementCostMultiplier: 1.0,
      maintenanceCostMultiplier: 1.2,
      militaryResearchCostMultiplier: 0.8,
      industrialResearchCostMultiplier: 0.8,
      peaceStabilityRecoveryMultiplier: 1.3,
      warStabilityFatigueMultiplier: 1.5,
      crisisStabilityResistanceMultiplier: 1.0,
    },
  },
  IDEOLOGICAL_REGIME: {
    type: "IDEOLOGICAL_REGIME",
    nameFa: "حاکمیت ایدئولوژیک",
    headlineFa: "ارتش ارزان و تاب‌آوری بالا در جنگ • رکود در توسعه علمی",
    descriptionFa:
      "ساختار عقیدتی با بسیج توده‌ای که ارتش را بسیار کم‌هزینه و مقاوم در برابر جنگ می‌کند، اما به دلیل انزوای علمی در R&D پرهزینه است.",
    prosFa: [
      "۲۰٪ کاهش هزینه نگهداری و حقوق ماهانه ارتش",
      "۵۰٪ مقاومت بیشتر در برابر فرسودگی ناشی از جنگ",
    ],
    consFa: [
      "۲۰٪ افزایش هزینه تحقیقات و پژوهش‌های علمی",
      "۳۰٪ کندی بیشتر در ارتقای طبیعی ثبات در صلح",
    ],
    modifiers: {
      procurementCostMultiplier: 1.0,
      maintenanceCostMultiplier: 0.8,
      militaryResearchCostMultiplier: 1.2,
      industrialResearchCostMultiplier: 1.2,
      peaceStabilityRecoveryMultiplier: 0.7,
      warStabilityFatigueMultiplier: 0.5,
      crisisStabilityResistanceMultiplier: 1.2,
    },
  },
  TECHNOCRATIC_ONE_PARTY: {
    type: "TECHNOCRATIC_ONE_PARTY",
    nameFa: "تک‌حزبی توسعه‌گرا (تکنوکرات)",
    headlineFa: "تولید ارزان و احداث صنعتی سریع • هزینه‌های بالای ادوات",
    descriptionFa:
      "انضباط مهندسی و مدیریت دولتی متمرکز که احداث کارخانه‌ها و ساخت تسلیحات را ارزان می‌کند، اما نگهداری تجهیزات پیچیده آن گران است.",
    prosFa: [
      "۲۰٪ ارزان‌تر بودن احداث سوله و تجهیزات بومی",
      "۱۵٪ تخفیف در پژوهش‌های صنعتی خطوط تولید",
    ],
    consFa: [
      "۲۰٪ هزینه سنگین‌تر نگهداری سامانه‌ها و ادوات",
      "۲۵٪ حساسیت بیشتر ثبات به بحران‌های مالی و بدهی",
    ],
    modifiers: {
      procurementCostMultiplier: 0.8,
      maintenanceCostMultiplier: 1.2,
      militaryResearchCostMultiplier: 1.0,
      industrialResearchCostMultiplier: 0.85,
      peaceStabilityRecoveryMultiplier: 1.0,
      warStabilityFatigueMultiplier: 1.0,
      crisisStabilityResistanceMultiplier: 0.75,
    },
  },
  HEREDITARY_MONARCHY: {
    type: "HEREDITARY_MONARCHY",
    nameFa: "پادشاهی سنتی و موروثی",
    headlineFa: "ثبات سیاسی بتنی و پایدار • تشریفات گران‌قیمت تولید",
    descriptionFa:
      "مشروعیت خاندانی که امنیت داخلی و وفاداری ارتش را تثبیت می‌کند، اما تشریفات درباری ساخت ادوات و محافظه‌کاری R&D را کند می‌کند.",
    prosFa: [
      "۴۰٪ مقاومت بیشتر در برابر ریزش و نوسانات ثبات",
      "۱۰٪ هزینه کمتر نگهداری نیروها در صلح",
    ],
    consFa: [
      "۲۰٪ هزینه بالاتر خرید ادوات و تجهیزات نوین",
      "۱۵٪ افزایش هزینه در پذیرش و ارتقای فناوری",
    ],
    modifiers: {
      procurementCostMultiplier: 1.2,
      maintenanceCostMultiplier: 0.9,
      militaryResearchCostMultiplier: 1.15,
      industrialResearchCostMultiplier: 1.15,
      peaceStabilityRecoveryMultiplier: 1.0,
      warStabilityFatigueMultiplier: 0.8,
      crisisStabilityResistanceMultiplier: 1.4,
    },
  },
  CENTRALIZED_PRESIDENTIAL: {
    type: "CENTRALIZED_PRESIDENTIAL",
    nameFa: "جمهوری ریاستی متمرکز",
    headlineFa: "تجهیز سریع با اختیارات ویژه • تعادل همه‌جانبه",
    descriptionFa:
      "دولت مقتدر با اختیارات اجرایی متمرکز که فرماندهی دفاعی را چابک می‌کند و در تمامی ارکان در تعادل متقارن قرار دارد.",
    prosFa: [
      "۱۰٪ تخفیف در تجهیز فوری ادوات و تدارکات",
      "۱۰٪ مقاومت بیشتر در برابر فرسودگی جنگ",
    ],
    consFa: [
      "۱۰٪ هزینه بالاتر در نگهداری ساختار اداری ارتش",
      "۱۰٪ کندی در بازیابی طبیعی ثبات در ایام صلح",
    ],
    modifiers: {
      procurementCostMultiplier: 0.9,
      maintenanceCostMultiplier: 1.1,
      militaryResearchCostMultiplier: 1.0,
      industrialResearchCostMultiplier: 1.0,
      peaceStabilityRecoveryMultiplier: 0.9,
      warStabilityFatigueMultiplier: 0.9,
      crisisStabilityResistanceMultiplier: 1.0,
    },
  },
};
