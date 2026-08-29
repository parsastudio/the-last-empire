import { useMemo } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";
import { NationGettersUtility } from "@geopolitics/domain";

interface UseAttackTerritoryReachProps {
  humanNation: Nation | null;
  targetNationName?: string;
  targetProvinceId: number | null;
  gameState: GameState | null;
}

export function useAttackTerritoryReach({
  humanNation,
  targetNationName,
  targetProvinceId,
  gameState,
}: UseAttackTerritoryReachProps) {
  const targetProvince = useMemo(() => {
    if (!gameState || !targetProvinceId) return null;
    return gameState.provinces[targetProvinceId.toString()] || null;
  }, [gameState, targetProvinceId]);

  const isLandNeighbor = useMemo(() => {
    if (!humanNation || !targetProvinceId) return false;
    return LandNeighborResolver.hasProvinceLandBorder(
      targetProvinceId,
      humanNation.id,
      gameState?.provinces,
    );
  }, [humanNation, targetProvinceId, gameState?.provinces]);

  const attackerHasSea = useMemo(() => {
    if (!humanNation) return false;
    return NationGettersUtility.hasSeaAccess(
      humanNation.id,
      gameState?.provinces,
    );
  }, [humanNation, gameState?.provinces]);

  const targetProvinceHasSea = Boolean(targetProvince?.hasSeaAccess);
  const isNavalValid =
    !isLandNeighbor && attackerHasSea && targetProvinceHasSea;
  const attackType: "LAND" | "NAVAL" = isLandNeighbor ? "LAND" : "NAVAL";

  const originRegionName = humanNation
    ? `خاک ${humanNation.name}`
    : "خاک اصلی کشور";

  const targetRegionName = useMemo(() => {
    if (targetProvince) return targetProvince.nameFa;
    if (targetNationName) return `خاک اصلی ${targetNationName}`;
    return "";
  }, [targetProvince, targetNationName]);

  return {
    targetProvince,
    isLandNeighbor,
    isNavalValid,
    attackType,
    originRegionName,
    targetRegionName,
  };
}
