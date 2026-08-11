import { useState, useMemo } from "react";
import { resolveProfileRelation } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-resolver";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { useLiveNations } from "@/presentation/hooks/game/use-live-nations";

interface UseWideDiplomacyProps {
  selectedTargetCode?: string | null;
  nationsMap?: Record<string, Nation>;
  humanNationId: string;
}

export function useWideDiplomacy({
  selectedTargetCode,
  nationsMap,
  humanNationId,
}: UseWideDiplomacyProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const { filteredNations: liveNationsList } = useLiveNations({
    nationsMap,
    excludeNationId: humanNationId,
    searchQuery,
  });

  const humanNation = useMemo(
    () => (nationsMap ? (nationsMap[humanNationId] ?? null) : null),
    [nationsMap, humanNationId],
  );

  const relationsList = useMemo(() => {
    const list = liveNationsList.map((item) => {
      const rel = resolveProfileRelation(item.id, item.rawNation);
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

    return list.sort((a, b) => a.rank - b.rank);
  }, [liveNationsList, humanNation]);

  const defaultCode = relationsList[0]?.code || "";
  const [userSelectedCode, setUserSelectedCode] = useState<string | null>(null);

  const activeCode = userSelectedCode || selectedTargetCode || defaultCode;

  const targetNationId = useMemo(
    () => CountryRegistry.resolveCanonicalId(activeCode),
    [activeCode],
  );

  const selectedRelation = useMemo(() => {
    const targetLiveNation = nationsMap
      ? (nationsMap[targetNationId] ?? null)
      : null;
    const rel = resolveProfileRelation(activeCode, targetLiveNation);

    if (humanNation) {
      const directRel = humanNation.relations[targetNationId];
      if (directRel) {
        rel.stance = directRel.stance;
        rel.opinion = directRel.opinion;
        rel.isTradeEmbargoed = directRel.isTradeEmbargoed ?? false;
      }
    }
    return rel;
  }, [activeCode, targetNationId, nationsMap, humanNation]);

  return {
    searchQuery,
    setSearchQuery,
    activeCode,
    setActiveCode: setUserSelectedCode,
    filteredRelations: relationsList,
    selectedRelation,
    targetNationId,
  };
}
