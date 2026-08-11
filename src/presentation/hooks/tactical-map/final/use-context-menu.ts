import { useState, useCallback } from "react";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { BitPackedCellUtility } from "@/domain/map/bit-packed-cell.utility";

export interface ContextMenuState {
  screenPos: { x: number; y: number };
  mapPos: { x: number; y: number };
  provinceId: number;
  provinceName: string;
  countryCode: string;
  countryName: string;
}

export function useContextMenu() {
  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuState | null>(null);

  const openContextMenu = useCallback(
    (
      screenX: number,
      screenY: number,
      provinceId: number,
      mapX: number,
      mapY: number,
      provincesMap?: Record<string, Province>,
      nationsMap?: Record<string, Nation>,
    ) => {
      if (provinceId < BitPackedCellUtility.FIRST_PROVINCE_ID) {
        setContextMenuState(null);
        return;
      }

      const province = provincesMap
        ? provincesMap[provinceId.toString()]
        : null;
      const provinceName = province ? province.nameFa : `استان #${provinceId}`;

      const ownerNation =
        province && nationsMap ? nationsMap[province.ownerNationId] : null;
      const countryName = ownerNation ? ownerNation.name : "نامشخص";
      const countryCode = ownerNation ? ownerNation.id : "NATION_DEFAULT";

      setContextMenuState({
        screenPos: { x: screenX, y: screenY },
        mapPos: { x: mapX, y: mapY },
        provinceId,
        provinceName,
        countryCode,
        countryName,
      });
    },
    [],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenuState(null);
  }, []);

  return {
    contextMenuState,
    openContextMenu,
    closeContextMenu,
  };
}
