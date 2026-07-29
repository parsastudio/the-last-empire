import { useState, useMemo } from "react";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { resolveProfileRelation } from "../../../sidebar/tabs/diplomacy/utils/relation-resolver";
import { Nation } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "../../../sidebar/tabs/diplomacy/utils/nation-id-resolver";

interface UseWideDiplomacyProps {
  selectedTargetCode?: string | null;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useWideDiplomacy({
  selectedTargetCode,
  nationsMap,
  humanNationId = "NATION_118",
}: UseWideDiplomacyProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const idResolver = useMemo(() => new NationIdResolver(), []);

  const relationsList = useMemo(() => {
    if (nationsMap) {
      return Object.values(nationsMap)
        .filter((n) => n.id !== humanNationId && n.isAlive)
        .map((n) => {
          const rel = resolveProfileRelation(n.id, n);
          const humanNation = nationsMap[humanNationId];
          if (humanNation) {
            const directRel = humanNation.relations[n.id];
            if (directRel) {
              rel.stance = directRel.stance;
              rel.opinion = directRel.opinion;
            }
          }
          return rel;
        });
    }

    return ALL_COUNTRY_PROFILES.filter(
      (p) => `NATION_${p.id}` !== humanNationId,
    ).map((p) => resolveProfileRelation(p.code));
  }, [humanNationId, nationsMap]);

  const defaultCode = relationsList[0]?.code || "USA";
  const [activeCode, setActiveCode] = useState<string>(
    selectedTargetCode || defaultCode,
  );

  const filteredRelations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return relationsList;

    return relationsList.filter(
      (r) =>
        r.name.toLowerCase().includes(query) ||
        r.code.toLowerCase().includes(query) ||
        r.flagCode.toLowerCase().includes(query),
    );
  }, [relationsList, searchQuery]);

  const targetNationId = idResolver.resolveFullNationId(activeCode);
  const targetLiveNation = nationsMap ? nationsMap[targetNationId] : null;
  const selectedRelation = resolveProfileRelation(activeCode, targetLiveNation);

  return {
    searchQuery,
    setSearchQuery,
    activeCode,
    setActiveCode,
    filteredRelations,
    selectedRelation,
    targetNationId,
  };
}
