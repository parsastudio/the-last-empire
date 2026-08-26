import { CountryRegistry } from "@/domain/data/countries";

export function getFlagEmoji(code: string): string {
  if (!code) return "🌐";

  const profile = CountryRegistry.getCountry(code);
  const alpha2 = profile
    ? profile.flagCode || profile.code.slice(0, 2)
    : code.trim().toUpperCase().slice(0, 2);

  if (alpha2.length !== 2) {
    return "🌐";
  }

  return alpha2
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}
