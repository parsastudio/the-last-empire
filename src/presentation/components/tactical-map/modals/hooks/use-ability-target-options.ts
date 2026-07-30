import { useMemo } from "react";
import { ALL_COUNTRY_PROFILES } from "@/infrastructure/data/countries";

export function useAbilityTargetOptions(nationId: string) {
  return useMemo(() => {
    return ALL_COUNTRY_PROFILES.filter(
      (p) => `NATION_${p.id}` !== nationId,
    ).map((p) => ({
      code: `NATION_${p.id}`,
      name: p.nameFa,
    }));
  }, [nationId]);
}
