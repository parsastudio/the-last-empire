import { useState, useMemo } from "react";
import { resolveProfileRelation } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-resolver";
import { Nation } from "@/domain/nation/nation.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { useLiveNations } from "@/presentation/hooks/game/use-live-nations";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";

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
  const activeHumanId = CountryRegistry.resolveCanonicalId(
    humanNationId || "USA",
  );

  const { filteredNations: liveNationsList } = useLiveNations({
    nationsMap,
    excludeNationId: activeHumanId,
    searchQuery,
  });

  const humanNation = useMemo(
    () => (nationsMap ? (nationsMap[activeHumanId] ?? null) : null),
    [nationsMap, activeHumanId],
  );

  const relationsList = useMemo(() => {
    const list = liveNationsList.map((item) => {
      const rel = resolveProfileRelation(item.id, item.rawNation);
      if (humanNation) {
        const directRel = humanNation.relations[item.id];
        if (directRel) {
          rel.stance = directRel.stance;
          rel.opinion = directRel.opinion;
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

  const selectedTargetNation = useMemo(() => {
    if (!nationsMap) return null;
    return nationsMap[targetNationId] ?? null;
  }, [nationsMap, targetNationId]);

  const selectedTargetGdp = useMemo(() => {
    if (!selectedTargetNation) return 100000000000;
    return getNationGdp(selectedTargetNation);
  }, [selectedTargetNation]);

  const selectedRelation = useMemo(() => {
    const rel = resolveProfileRelation(activeCode, selectedTargetNation);

    if (humanNation) {
      const directRel = humanNation.relations[targetNationId];
      if (directRel) {
        rel.stance = directRel.stance;
        rel.opinion = directRel.opinion;
      }
    }
    return rel;
  }, [activeCode, targetNationId, selectedTargetNation, humanNation]);

  return {
    searchQuery,
    setSearchQuery,
    activeCode,
    setActiveCode: setUserSelectedCode,
    filteredRelations: relationsList,
    selectedRelation,
    targetNationId,
    selectedTargetGdp,
  };
}
