import { useState, useRef, RefObject } from "react";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { findCountryProfileById } from "@/domain/data/countries";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/hud/country-hover-container";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { Nation } from "@/domain/nation/nation.schema";
import { useHoverNationResolver } from "@/presentation/components/tactical-map/hud/hooks/use-hover-nation-resolver";

export interface ContextMenuState {
  screenPos: { x: number; y: number };
  countryId: number;
  countryCode: string;
  countryName: string;
}

interface UseWebGLInteractionProps {
  containerRef: RefObject<HTMLDivElement | null>;
  position: { x: number; y: number };
  scale: number;
  isDragging: boolean;
  hasDraggedRef: RefObject<boolean>;
  countries: CountryMapping[];
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useWebGLInteraction({
  containerRef,
  position,
  scale,
  isDragging,
  hasDraggedRef,
  countries,
  nationsMap,
  humanNationId,
}: UseWebGLInteractionProps) {
  const facadeRef = useRef(new BitPackedStateFacade());
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [hoverData, setHoverData] = useState<HoverCountryInfo | null>(null);
  const [contextMenuState, setContextMenuState] =
    useState<ContextMenuState | null>(null);

  const { resolveHoverInfo } = useHoverNationResolver({
    countries,
    nationsMap,
    humanNationId,
  });

  const handlePointerMove = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container || isDragging) {
      setHoverPos(null);
      setHoverData(null);
      return;
    }

    const rect = container.getBoundingClientRect();
    const rx = clientX - rect.left;
    const ry = clientY - rect.top;

    const mapX = Math.floor((rx - position.x) / scale);
    const mapY = Math.floor((ry - position.y) / scale);

    const inspected = facadeRef.current.inspectCoordinates(mapX, mapY);
    if (inspected && inspected.nationId >= 11 && inspected.nationId < 250) {
      const info = resolveHoverInfo(inspected.nationId, inspected.enclaveId);
      if (info) {
        setHoverPos({ x: clientX, y: clientY });
        setHoverData(info);
        return;
      }
    }

    setHoverPos(null);
    setHoverData(null);
  };

  const handlePointerLeave = () => {
    setHoverPos(null);
    setHoverData(null);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || hasDraggedRef.current || !containerRef.current) {
      return;
    }

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;

    const mapX = Math.floor((rx - position.x) / scale);
    const mapY = Math.floor((ry - position.y) / scale);

    const inspected = facadeRef.current.inspectCoordinates(mapX, mapY);
    if (!inspected || inspected.nationId < 11 || inspected.nationId >= 250) {
      setContextMenuState(null);
      return;
    }

    const profile = findCountryProfileById(inspected.nationId);
    const countryName = profile
      ? profile.nameFa
      : `کشور #${inspected.nationId}`;
    const countryCode = profile
      ? `NATION_${profile.code.toUpperCase()}`
      : `NATION_${inspected.nationId}`;

    setContextMenuState({
      screenPos: { x: e.clientX, y: e.clientY },
      countryId: inspected.nationId,
      countryCode,
      countryName,
    });
  };

  const closeContextMenu = () => {
    setContextMenuState(null);
  };

  return {
    hoverPos,
    hoverData,
    contextMenuState,
    handlePointerMove,
    handlePointerLeave,
    handleMapClick,
    closeContextMenu,
  };
}
