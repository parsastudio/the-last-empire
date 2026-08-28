import { CountryRegistry } from "@/domain/data/countries";

export function getFlagEmoji(code: unknown): string {
  if (code === null || code === undefined) return "🌐";
  const str = typeof code === "string" ? code : String(code);
  const cleanCode = str.trim().toUpperCase();
  if (!cleanCode) return "🌐";

  const profile = CountryRegistry.getCountry(cleanCode);
  const alpha2 = profile
    ? profile.flagCode || profile.code.slice(0, 2)
    : cleanCode.slice(0, 2);

  if (alpha2.length !== 2) {
    return "🌐";
  }

  return alpha2
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}
