export class ProvinceNameFormatter {
  public static format(rawName?: string | null): string {
    if (!rawName) return "استان نامشخص";
    const trimmed = rawName.trim();
    if (trimmed.startsWith("استان")) {
      return trimmed;
    }
    return `استان ${trimmed}`;
  }
}
