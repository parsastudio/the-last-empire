import { NextResponse } from "next/server";
import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/data/countries";

export async function GET(): Promise<NextResponse> {
  const profilesWithAutoId = ALL_COUNTRY_PROFILES.map(
    (p: CountryProfile, idx: number) => ({
      ...p,
      autoId: idx + 1,
    }),
  );

  const countriesList = ALL_COUNTRY_PROFILES.map(
    (p: CountryProfile, idx: number) => ({
      id: p.id ?? idx + 1,
      code: p.code,
      nameFa: p.nameFa,
      pixelCountInPng: p.gdp > 0 ? 100 : 0,
    }),
  );

  const zeroPixelCountries = countriesList.filter(
    (p: { pixelCountInPng: number }) => p.pixelCountInPng === 0,
  );

  const nonZeroPixelCountries = countriesList.filter(
    (p: { pixelCountInPng: number }) => p.pixelCountInPng !== 0,
  );

  return NextResponse.json({
    success: true,
    totalProfiles: profilesWithAutoId.length,
    zeroPixelCountriesCount: zeroPixelCountries.length,
    nonZeroPixelCountriesCount: nonZeroPixelCountries.length,
  });
}
