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
  badgeText: z.string().min(1),
});

export type DifficultyConfig = z.infer<typeof DifficultyConfigSchema>;

export const DIFFICULTY_CONFIGS: Record<GameDifficulty, DifficultyConfig> = {
  EASY: {
    id: "EASY",
    nameFa: "آسان",
    taglineFa: "عدالت تجاری و برابری اقتصادی",
    descriptionFa:
      "هوش مصنوعی دقیقاً با ضریب ۱.۰ و بدون هیچ بونوس درآمدی بازی می‌کند. انتخابی عالی برای تمرین و یادگیری مکانیک‌ها.",
    aiRevenueMultiplier: 1.0,
    badgeText: "ضریب ۱.۰x",
  },
  NORMAL: {
    id: "NORMAL",
    nameFa: "متوسط",
    taglineFa: "موازنه استاندارد قوا",
    descriptionFa:
      "هوش مصنوعی ۴۰٪ عواید مالی بیشتری از بازار و ترانزیت کسب می‌کند (ضریب ۱.۴x). حالت استاندارد و متعادل بازی.",
    aiRevenueMultiplier: 1.4,
    badgeText: "ضریب ۱.۴x",
  },
  HARD: {
    id: "HARD",
    nameFa: "سخت",
    taglineFa: "رقابت فشرده و صنایع پرشتاب",
    descriptionFa:
      "هوش مصنوعی ۸۰٪ درآمد بالاتری دارد (ضریب ۱.۸x). کشورها با سرعت بالا زرادخانه‌ها را تجهیز کرده و نوسازی می‌کنند.",
    aiRevenueMultiplier: 1.8,
    badgeText: "ضریب ۱.۸x",
  },
  IMPOSSIBLE: {
    id: "IMPOSSIBLE",
    nameFa: "غیرممکن",
    taglineFa: "بحران فراگیر و نبرد بقا",
    descriptionFa:
      "درآمد رقبا بیش از دو برابر شماست (ضریب ۲.۲x). بقای ملی بدون استفاده بی‌نقص از دیپلماسی و چترهای امنیتی ناممکن است.",
    aiRevenueMultiplier: 2.2,
    badgeText: "ضریب ۲.۲x",
  },
};
