import { useState, useRef, RefObject } from "react";
import { BitPackedStateFacade } from "@/engine/combat/final/bit-packed-state-facade";
import { findCountryProfileById } from "@/domain/data/countries";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { CountryMapping } from "@/domain/map/country-mapping.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { useHoverNationResolver } from "@/presentation/components/tactical-map/hud/hooks/use-hover-nation-resolver";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

export interface ContextMenuState {
  screenPos: { x: number; y: number };
  countryId: number;
  countryCode: string;
  countryName: string;
}

interface UseWebGLInteractionProps {
  containerRef: RefObject<HTMLDivElement | null>;
  positionRef: RefObject<CameraPosition>;
  scaleRef: RefObject<number>;
  isDraggingRef: RefObject<boolean>;
  hasDraggedRef: RefObject<boolean>;
  countries: CountryMapping[];
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useWebGLInteraction({
  containerRef,
  positionRef,
  scaleRef,
  isDraggingRef,
  hasDraggedRef,
  countries,
  nationsMap,
  humanNationId,
}: UseWebGLInteractionProps) {
  const facadeRef = useRef(new BitPackedStateFacade());
  const lastHoverNationIdRef = useRef<{
    nationId: number;
    enclaveId: number;
  } | null>(null);

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
    if (!container || isDraggingRef.current) {
      if (hoverPos !== null) setHoverPos(null);
      if (hoverData !== null) setHoverData(null);
      lastHoverNationIdRef.current = null;
      return;
    }

    const rect = container.getBoundingClientRect();
    const rx = clientX - rect.left;
    const ry = clientY - rect.top;

    const pos = positionRef.current || { x: 0, y: 0 };
    const scale = scaleRef.current || 1;

    const mapX = Math.floor((rx - pos.x) / scale);
    const mapY = Math.floor((ry - pos.y) / scale);

    const inspected = facadeRef.current.inspectCoordinates(mapX, mapY);
    if (inspected && inspected.nationId >= 11 && inspected.nationId < 250) {
      const last = lastHoverNationIdRef.current;
      const isSameCell =
        last &&
        last.nationId === inspected.nationId &&
        last.enclaveId === inspected.enclaveId;

      if (!isSameCell || !hoverData) {
        const info = resolveHoverInfo(inspected.nationId, inspected.enclaveId);
        if (info) {
          lastHoverNationIdRef.current = {
            nationId: inspected.nationId,
            enclaveId: inspected.enclaveId,
          };
          setHoverPos({ x: clientX, y: clientY });
          setHoverData(info);
          return;
        }
      } else {
        setHoverPos({ x: clientX, y: clientY });
        return;
      }
    }

    lastHoverNationIdRef.current = null;
    if (hoverPos !== null) setHoverPos(null);
    if (hoverData !== null) setHoverData(null);
  };

  const handlePointerLeave = () => {
    lastHoverNationIdRef.current = null;
    setHoverPos(null);
    setHoverData(null);
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      isDraggingRef.current ||
      hasDraggedRef.current ||
      !containerRef.current
    ) {
      return;
    }

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;

    const pos = positionRef.current || { x: 0, y: 0 };
    const scale = scaleRef.current || 1;

    const mapX = Math.floor((rx - pos.x) / scale);
    const mapY = Math.floor((ry - pos.y) / scale);

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
