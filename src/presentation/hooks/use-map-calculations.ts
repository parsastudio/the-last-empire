import { useActiveBorders } from "./map/use-active-borders";
import { useEmpireStats } from "./map/use-empire-stats";
import { useConquests } from "./map/use-conquests";
import { useActivePowersData } from "./map/use-active-powers-data";
import type { Province } from "@/domain/map/province.schema";

interface UseMapCalculationsProps {
  playerCountryCode: string | null;
  provincesMap: Record<string, Province[]>;
  provincesState: Record<string, Province>;
  occupations: Record<string, number>;
}

export function useMapCalculations({
  playerCountryCode,
  provincesMap,
  provincesState,
  occupations,
}: UseMapCalculationsProps) {
  const activeBorders = useActiveBorders({
    playerCountryCode,
    provincesState,
  });

  const empireStats = useEmpireStats({
    playerCountryCode,
    provincesState,
    occupations,
  });

  const conquests = useConquests({
    playerCountryCode,
    provincesState,
    occupations,
  });

  const activePowersListData = useActivePowersData({
    provincesMap,
    provincesState,
  });

  return {
    activeBorders,
    empireStats,
    conquests,
    activePowersListData,
  };
}
