import type { Province } from "@/domain/map/province.schema";

export function expandCountryProvinces(
  rawProvinces: Record<string, Province>,
): Record<string, Province> {
  return rawProvinces;
}

export function linkCountryProvinces(): void {}
