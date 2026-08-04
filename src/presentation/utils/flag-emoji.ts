import { ISO3_TO_ISO2_MAP } from "@/presentation/utils/flag/iso-code-mapping.config";
import { findCountryProfileById } from "@/domain/data/countries";

const flagCache = new Map<string, string>();

export function getFlagEmoji(code: string): string {
  if (!code) return "🌐";

  const cached = flagCache.get(code);
  if (cached) return cached;

  let cleanCode = code.trim().toUpperCase().replace("NATION_", "");

  if (/^\d+$/.test(cleanCode)) {
    const numericId = parseInt(cleanCode, 10);
    const profile = findCountryProfileById(numericId);
    if (profile) {
      cleanCode = profile.flagCode || profile.code;
    }
  }

  let alpha2 = cleanCode;
  if (cleanCode.length === 3) {
    alpha2 = ISO3_TO_ISO2_MAP[cleanCode] || cleanCode.slice(0, 2);
  }

  if (alpha2.length !== 2) {
    flagCache.set(code, "🌐");
    return "🌐";
  }

  const emoji = alpha2
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");

  flagCache.set(code, emoji);
  return emoji;
}
