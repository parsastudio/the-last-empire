import { z } from "zod";

export const GameDifficultySchema = z.enum([
  "EASY",
  "NORMAL",
  "HARD",
  "IMPOSSIBLE",
]);

export type GameDifficulty = z.infer<typeof GameDifficultySchema>;

export const DifficultyConfigSchema = z.object({
  id: GameDifficultySchema,
  nameFa: z.string().min(1),
  taglineFa: z.string().min(1),
  descriptionFa: z.string().min(1),
  aiRevenueMultiplier: z.number().positive(),
});

export type DifficultyConfig = z.infer<typeof DifficultyConfigSchema>;

export const DIFFICULTY_CONFIGS: Record<GameDifficulty, DifficultyConfig> = {
  EASY: {
    id: "EASY",
    nameFa: "آسان",
    taglineFa: "گسترش آرام قلمرو",
    descriptionFa:
      "مناسب برای فرماندهان تازه‌کار و کشورداری بدون فشار سنگین خارجی.",
    aiRevenueMultiplier: 1.0,
  },
  NORMAL: {
    id: "NORMAL",
    nameFa: "متوسط",
    taglineFa: "موازنه استاندارد جهانی",
    descriptionFa: "تجربه اصلی و متوازن بازی با رقبایی هوشیار و فعال.",
    aiRevenueMultiplier: 1.4,
  },
  HARD: {
    id: "HARD",
    nameFa: "سخت",
    taglineFa: "رقابت فشرده قدرت‌ها",
    descriptionFa:
      "رقبای سرسخت و توسعه‌یافته؛ نیازمند مدیریت دقیق منابع و ارتش.",
    aiRevenueMultiplier: 1.8,
  },
  IMPOSSIBLE: {
    id: "IMPOSSIBLE",
    nameFa: "غیرممکن",
    taglineFa: "بحران فراگیر و نبرد بقا",
    descriptionFa:
      "جهانی بی‌رحم با رقبای قدرتمند. بقا تنها با نبوغ دیپلماتیک ممکن است.",
    aiRevenueMultiplier: 2.2,
  },
};
