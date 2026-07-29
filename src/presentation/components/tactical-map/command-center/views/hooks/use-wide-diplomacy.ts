import { useState, useMemo } from "react";
import { resolveProfileRelation } from "../../../sidebar/tabs/diplomacy/utils/relation-resolver";
import { Nation } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "../../../sidebar/tabs/diplomacy/utils/nation-id-resolver";
import { useLiveNations } from "@/presentation/hooks/game/use-live-nations";

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

  const { filteredNations: liveNationsList } = useLiveNations({
    nationsMap,
    excludeNationId: humanNationId,
    searchQuery,
  });

  const relationsList = useMemo(() => {
    return liveNationsList.map((item) => {
      const rel = resolveProfileRelation(item.id, item.rawNation);
      const humanNation = nationsMap ? nationsMap[humanNationId] : null;
      if (humanNation) {
        const directRel = humanNation.relations[item.id];
        if (directRel) {
          rel.stance = directRel.stance;
          rel.opinion = directRel.opinion;
        }
      }
      return rel;
    });
  }, [liveNationsList, nationsMap, humanNationId]);

  const defaultCode = relationsList[0]?.code || "USA";
  const [activeCode, setActiveCode] = useState<string>(
    selectedTargetCode || defaultCode,
  );

  const targetNationId = idResolver.resolveFullNationId(activeCode);
  const targetLiveNation = nationsMap ? nationsMap[targetNationId] : null;
  const selectedRelation = resolveProfileRelation(activeCode, targetLiveNation);

  return {
    searchQuery,
    setSearchQuery,
    activeCode,
    setActiveCode,
    filteredRelations: relationsList,
    selectedRelation,
    targetNationId,
  };
}
