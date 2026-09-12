import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { resolveProfileRelation } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/utils/relation-resolver";
import {
  Nation,
  CountryRegistry,
  getNationGdp,
  Province,
  AppLocale,
} from "@geopolitics/domain";
import { useLiveNations } from "@/presentation/hooks/game/use-live-nations";

interface UseWideDiplomacyProps {
  selectedTargetCode?: string | null;
  nationsMap?: Record<string, Nation>;
  humanNationId: string;
  provincesMap?: Record<string, Province>;
}

export function useWideDiplomacy({
  selectedTargetCode,
  nationsMap,
  humanNationId,
  provincesMap,
}: UseWideDiplomacyProps) {
  const currentLocale = useLocale() as AppLocale;
  const locale: AppLocale = currentLocale === "en" ? "en" : "fa";
  const [searchQuery, setSearchQuery] = useState("");
  const activeHumanId = CountryRegistry.resolveCanonicalId(
    humanNationId || "USA",
  );

  const { filteredNations: liveNationsList } = useLiveNations({
    nationsMap,
    provincesMap,
    excludeNationId: activeHumanId,
    searchQuery,
  });

  const humanNation = useMemo(
    () => (nationsMap ? (nationsMap[activeHumanId] ?? null) : null),
    [nationsMap, activeHumanId],
  );

  const relationsList = useMemo(() => {
    const list = liveNationsList.map((item) => {
      return resolveProfileRelation(
        item.id,
        item.rawNation,
        humanNation,
        nationsMap,
        provincesMap,
        locale,
      );
    });

    return list.sort((a, b) => a.rank - b.rank);
  }, [liveNationsList, humanNation, nationsMap, provincesMap, locale]);

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
    return getNationGdp(selectedTargetNation, provincesMap);
  }, [selectedTargetNation, provincesMap]);

  const selectedRelation = useMemo(() => {
    return resolveProfileRelation(
      activeCode,
      selectedTargetNation,
      humanNation,
      nationsMap,
      provincesMap,
      locale,
    );
  }, [
    activeCode,
    selectedTargetNation,
    humanNation,
    nationsMap,
    provincesMap,
    locale,
  ]);

  return {
    searchQuery,
    setSearchQuery,
    activeCode,
    setActiveCode: setUserSelectedCode,
    filteredRelations: relationsList,
    selectedRelation,
    targetNationId,
    selectedTargetGdp,
    humanNation,
    selectedTargetNation,
  };
}
