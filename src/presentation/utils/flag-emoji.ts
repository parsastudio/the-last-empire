export function getFlagEmoji(code: string): string {
  if (!code) return "🌐";
  const cleanCode = code.trim().toUpperCase();
  let alpha2 = cleanCode;
  if (cleanCode.length === 3) {
    alpha2 = cleanCode.slice(0, 2);
  }
  if (alpha2.length !== 2) return "🌐";
  return alpha2
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("");
}
