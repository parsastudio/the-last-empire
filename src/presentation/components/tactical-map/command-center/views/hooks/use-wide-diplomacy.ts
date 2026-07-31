import { useState, useMemo } from "react";
import { resolveProfileRelation } from "../../../sidebar/tabs/diplomacy/utils/relation-resolver";
import { Nation } from "@/domain/nation/nation.schema";
import { NationIdResolver } from "@/domain/shared/nation-id-resolver";
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
          rel.isTradeEmbargoed = directRel.isTradeEmbargoed ?? false;
        }
      }
      return rel;
    });
  }, [liveNationsList, nationsMap, humanNationId]);

  const defaultCode = relationsList[0]?.code || "USA";
  const [activeCode, setActiveCode] = useState<string>(
    selectedTargetCode || defaultCode,
  );
  const [prevTargetCode, setPrevTargetCode] = useState<
    string | null | undefined
  >(selectedTargetCode);

  if (selectedTargetCode !== prevTargetCode) {
    setPrevTargetCode(selectedTargetCode);
    if (selectedTargetCode) {
      setActiveCode(selectedTargetCode);
    }
  }

  const targetNationId = NationIdResolver.resolveCanonicalId(activeCode);
  const targetLiveNation = nationsMap ? nationsMap[targetNationId] : null;
  const selectedRelation = resolveProfileRelation(activeCode, targetLiveNation);

  const humanNation = nationsMap ? nationsMap[humanNationId] : null;
  if (humanNation) {
    const directRel = humanNation.relations[targetNationId];
    if (directRel) {
      selectedRelation.stance = directRel.stance;
      selectedRelation.opinion = directRel.opinion;
      selectedRelation.isTradeEmbargoed = directRel.isTradeEmbargoed ?? false;
    }
  }

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
