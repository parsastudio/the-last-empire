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
  aiRevenueMultiplier: z.number().positive(),
});

export type DifficultyConfig = z.infer<typeof DifficultyConfigSchema>;

export const DIFFICULTY_CONFIGS: Record<GameDifficulty, DifficultyConfig> = {
  EASY: {
    id: "EASY",
    aiRevenueMultiplier: 0.9,
  },
  NORMAL: {
    id: "NORMAL",
    aiRevenueMultiplier: 1.2,
  },
  HARD: {
    id: "HARD",
    aiRevenueMultiplier: 1.4,
  },
  IMPOSSIBLE: {
    id: "IMPOSSIBLE",
    aiRevenueMultiplier: 1.5,
  },
};
