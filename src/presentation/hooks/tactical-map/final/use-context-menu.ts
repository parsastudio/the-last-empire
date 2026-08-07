import { useState, useCallback } from "react";
import { findCountryProfileById } from "@/domain/data/countries";

export interface ContextMenuState {
  screenPos: { x: number; y: number };
  mapPos: { x: number; y: number };
  countryId: number;
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
      nationId: number,
      mapX: number,
      mapY: number,
    ) => {
      if (nationId < 11 || nationId >= 250) {
        setContextMenuState(null);
        return;
      }

      const profile = findCountryProfileById(nationId);
      const countryName = profile ? profile.nameFa : `کشور #${nationId}`;
      const countryCode = profile
        ? `NATION_${profile.code.toUpperCase()}`
        : `NATION_${nationId}`;

      setContextMenuState({
        screenPos: { x: screenX, y: screenY },
        mapPos: { x: mapX, y: mapY },
        countryId: nationId,
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
