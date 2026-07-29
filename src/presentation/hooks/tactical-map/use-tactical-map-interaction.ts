import { useState, useCallback } from "react";
import { findCountryProfileById } from "@/domain/map/countries";
import { ContextActionType } from "@/presentation/components/tactical-map/context-menu/map-context-menu";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { CountryMapping } from "./use-map-data";

interface UseTacticalMapInteractionProps {
  mapWidth: number;
  mapHeight: number;
  countries: CountryMapping[];
  maskDataRef: React.RefObject<Uint8Array | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  dimensions: { width: number; height: number };
  scale: number;
  position: { x: number; y: number };
  isDragging: boolean;
  hasDraggedRef: React.RefObject<boolean>;
}

export function useTacticalMapInteraction({
  mapWidth,
  mapHeight,
  countries,
  maskDataRef,
  containerRef,
  dimensions,
  scale,
  position,
  isDragging,
  hasDraggedRef,
}: UseTacticalMapInteractionProps) {
  const [contextMenuState, setContextMenuState] = useState<{
    coordinate: { x: number; y: number };
    countryId: number;
    countryCode: string;
    countryName: string;
  } | null>(null);

  const [attackModalState, setAttackModalState] = useState<{
    isOpen: boolean;
    targetName: string;
    targetCode: string;
    coordinate: { x: number; y: number };
  } | null>(null);

  const [externalSidebarTab, setExternalSidebarTab] =
    useState<SidebarTabType | null>(null);
  const [selectedTargetCode, setSelectedTargetCode] = useState<string | null>(
    null,
  );

  const getScreenPosition = (mapCoord: { x: number; y: number }) => {
    const fx = dimensions.width > 0 ? mapWidth / dimensions.width : 1;
    const fy = dimensions.height > 0 ? mapHeight / dimensions.height : 1;

    const screenX = (mapCoord.x / fx) * scale + position.x;
    const screenY = (mapCoord.y / fy) * scale + position.y;

    return { x: screenX, y: screenY };
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      isDragging ||
      hasDraggedRef.current ||
      !containerRef.current ||
      !maskDataRef.current
    ) {
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const fx = mapWidth / rect.width;
    const fy = mapHeight / rect.height;

    const mapX = Math.floor(((clientX - position.x) / scale) * fx);
    const mapY = Math.floor(((clientY - position.y) / scale) * fy);

    if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) {
      setContextMenuState(null);
      return;
    }

    const pixelIndex = mapY * mapWidth + mapX;
    const nationIdNumber = maskDataRef.current[pixelIndex];

    if (!nationIdNumber || nationIdNumber < 11 || nationIdNumber >= 250) {
      setContextMenuState(null);
      return;
    }

    const matchedCountry = countries.find((c) => c.id === nationIdNumber);
    if (!matchedCountry) {
      setContextMenuState(null);
      return;
    }

    const profile = findCountryProfileById(matchedCountry.id);
    const countryName = profile ? profile.nameFa : matchedCountry.name;

    setContextMenuState({
      coordinate: { x: mapX, y: mapY },
      countryId: matchedCountry.id,
      countryCode: `NATION_${matchedCountry.id}`,
      countryName,
    });
  };

  const handleSelectContextAction = (action: ContextActionType) => {
    if (!contextMenuState) return;

    const targetCode = contextMenuState.countryCode;
    const targetName = contextMenuState.countryName;
    const targetCoord = contextMenuState.coordinate;

    setContextMenuState(null);

    if (action === "attack") {
      setAttackModalState({
        isOpen: true,
        targetName,
        targetCode,
        coordinate: targetCoord,
      });
    } else if (action === "proxy") {
      setSelectedTargetCode(`NATION_${contextMenuState.countryId}`);
      setExternalSidebarTab("politics");
    } else {
      setSelectedTargetCode(targetCode);
      setExternalSidebarTab("diplomacy");
    }
  };

  const handleOpenPendingTab = useCallback((tab?: string) => {
    const targetTab = (tab as SidebarTabType) || "research";
    setExternalSidebarTab(targetTab);
  }, []);

  const clearExternalTab = useCallback(() => {
    setExternalSidebarTab(null);
    setSelectedTargetCode(null);
  }, []);

  const activeScreenPos = contextMenuState
    ? getScreenPosition(contextMenuState.coordinate)
    : { x: 0, y: 0 };

  return {
    contextMenuState,
    attackModalState,
    externalSidebarTab,
    selectedTargetCode,
    activeScreenPos,
    handleMapClick,
    handleSelectContextAction,
    handleOpenPendingTab,
    clearExternalTab,
    closeContextMenu: () => setContextMenuState(null),
    closeAttackModal: () => setAttackModalState(null),
  };
}
