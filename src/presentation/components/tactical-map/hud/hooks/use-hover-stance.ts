import { useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";

export function useHoverStance() {
  const resolveStanceLabel = useCallback(
    (
      humanNationId: string | undefined,
      fullNationId: string,
      countryCode: string,
      nationsMap?: Record<string, Nation>,
    ): string => {
      if (!humanNationId || !nationsMap || !nationsMap[humanNationId]) {
        return "دیپلماسی عادی";
      }

      const humanNation = nationsMap[humanNationId];
      const relation =
        humanNation.relations[fullNationId] ||
        humanNation.relations[countryCode.toUpperCase()];

      if (relation) {
        if (relation.stance === "WAR") return "وضعیت نبرد";
        if (
          relation.stance === "SEVERED_RELATIONS" ||
          relation.isTradeEmbargoed
        )
          return "قطع روابط تجاری";
        if (relation.stance === "ALLIANCE") return "متحد استراتژیک";
        if (relation.stance === "NON_AGGRESSION_PACT") return "پیمان عدم تخاصم";
      }

      return "دیپلماسی عادی";
    },
    [],
  );

  return { resolveStanceLabel };
}
