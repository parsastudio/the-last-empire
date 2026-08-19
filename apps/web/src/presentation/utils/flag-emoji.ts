import { CountryRegistry } from "@/domain/data/countries";

export function getFlagEmoji(code: string | number): string {
  if (!code && code !== 0) return "🌐";

  const profile = CountryRegistry.getCountry(code);
  const alpha2 = profile
    ? profile.flagCode || profile.code.slice(0, 2)
    : code.toString().trim().toUpperCase().slice(0, 2);

  if (alpha2.length !== 2) {
    return "🌐";
  }

  return alpha2
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}
