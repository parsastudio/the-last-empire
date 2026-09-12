import { AbstractIntlMessages } from "next-intl";

export function pickMessages(
  messages: AbstractIntlMessages,
  keys: readonly string[],
): AbstractIntlMessages {
  const result: Record<string, unknown> = {};
  const source = messages as Record<string, unknown>;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]!;
    if (key in source) {
      result[key] = source[key];
    }
  }

  return result as AbstractIntlMessages;
}
