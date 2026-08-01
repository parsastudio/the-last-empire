import { useMemo } from "react";
import { ALL_COUNTRY_PROFILES, CountryProfile } from "@/domain/data/countries";

export function useAbilityTargetOptions(nationId: string) {
  return useMemo(() => {
    return ALL_COUNTRY_PROFILES.filter(
      (p: CountryProfile) =>
        `NATION_${p.code}` !== nationId && p.code !== nationId,
    ).map((p: CountryProfile) => ({
      code: `NATION_${p.code}`,
      name: p.nameFa,
    }));
  }, [nationId]);
}
