import { GovernmentType } from "@/domain/politics/politics.schema";
import { MIDDLE_EAST_IDENTITY_MAP } from "@/domain/data/countries/sources/identity/middle-east-identity.data";
import { EUROPE_IDENTITY_MAP } from "@/domain/data/countries/sources/identity/europe-identity.data";
import { ASIA_OCEANIA_IDENTITY_MAP } from "@/domain/data/countries/sources/identity/asia-oceania-identity.data";
import { AMERICAS_IDENTITY_MAP } from "@/domain/data/countries/sources/identity/americas-identity.data";
import { AFRICA_IDENTITY_MAP } from "@/domain/data/countries/sources/identity/africa-identity.data";

export interface CountryIdentityInfo {
  flagCode: string;
  startingGovernment: GovernmentType;
}

export const COUNTRY_IDENTITY_MAP: Record<string, CountryIdentityInfo> = {
  ...MIDDLE_EAST_IDENTITY_MAP,
  ...EUROPE_IDENTITY_MAP,
  ...ASIA_OCEANIA_IDENTITY_MAP,
  ...AMERICAS_IDENTITY_MAP,
  ...AFRICA_IDENTITY_MAP,
};
