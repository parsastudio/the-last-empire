import { FlagEmojiUtility } from "@geopolitics/domain";

export function getFlagEmoji(code: unknown): string {
  return FlagEmojiUtility.getFlagEmoji(code);
}
