import { useState, useMemo } from "react";
import { ALL_COUNTRY_PROFILES } from "@/domain/map/countries";
import { resolveProfileRelation } from "../utils/relation-resolver";
import { Nation } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";

interface UseDiplomacyTabProps {
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  selectedTargetCode?: string | null;
}

export function useDiplomacyTab({
  nationsMap,
  humanNationId = "NATION_118",
  selectedTargetCode,
}: UseDiplomacyTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelationCode, setSelectedRelationCode] = useState<
    string | null
  >(null);

  const idResolver = useMemo(() => new NationIdResolver(), []);

  const relationsList = useMemo(() => {
    if (nationsMap) {
      return Object.values(nationsMap).map((n) => {
        const rel = resolveProfileRelation(n.flagCode || n.id, n);
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
    return ALL_COUNTRY_PROFILES.slice(0, 15).map((p) =>
      resolveProfileRelation(p.code),
    );
  }, [humanNationId, nationsMap]);

  const activeCode = selectedTargetCode || selectedRelationCode;

  const activeRelation = useMemo(() => {
    if (!activeCode) return null;
    return (
      relationsList.find(
        (r) => r.code.toUpperCase() === activeCode.toUpperCase(),
      ) || null
    );
  }, [activeCode, relationsList]);

  return {
    searchQuery,
    setSearchQuery,
    selectedRelationCode,
    setSelectedRelationCode,
    relationsList,
    activeRelation,
    idResolver,
  };
}
