import { useState, useRef, RefObject } from "react";
import { CountryMapping } from "@/domain/map/country-mapping.schema";
import { Nation } from "@/domain/nation/nation.schema";
import {
  useHoverNationResolver,
  HoverCountryInfo,
} from "@/presentation/components/tactical-map/hud/hooks/use-hover-nation-resolver";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { useGridPicker } from "@/presentation/hooks/tactical-map/final/use-grid-picker";
import {
  useContextMenu,
  ContextMenuState,
} from "@/presentation/hooks/tactical-map/final/use-context-menu";

export type { ContextMenuState };

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
  const lastHoverNationIdRef = useRef<{
    nationId: number;
    enclaveId: number;
  } | null>(null);

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [hoverData, setHoverData] = useState<HoverCountryInfo | null>(null);

  const { pickAtScreenPos } = useGridPicker();
  const { contextMenuState, openContextMenu, closeContextMenu } =
    useContextMenu();

  const { resolveHoverInfo } = useHoverNationResolver({
    countries,
    nationsMap,
    humanNationId,
  });

  const handlePointerMove = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container || isDraggingRef.current) {
      if (hasDraggedRef.current && contextMenuState) {
        closeContextMenu();
      }
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

    const { nationId, enclaveId } = pickAtScreenPos(rx, ry, pos, scale);

    if (nationId >= 11 && nationId < 250) {
      const last = lastHoverNationIdRef.current;
      const isSameCell =
        last && last.nationId === nationId && last.enclaveId === enclaveId;

      if (!isSameCell || !hoverData) {
        const info = resolveHoverInfo(nationId, enclaveId);
        if (info) {
          lastHoverNationIdRef.current = { nationId, enclaveId };
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
    const container = containerRef.current;

    if (isDraggingRef.current || hasDraggedRef.current || !container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const rx = e.clientX - rect.left;
    const ry = e.clientY - rect.top;

    const pos = positionRef.current || { x: 0, y: 0 };
    const scale = scaleRef.current || 1;

    const { nationId } = pickAtScreenPos(rx, ry, pos, scale);

    if (nationId < 11 || nationId >= 250) {
      closeContextMenu();
      return;
    }

    const mapX = Math.floor((rx - pos.x) / scale);
    const mapY = Math.floor((ry - pos.y) / scale);

    openContextMenu(e.clientX, e.clientY, nationId, mapX, mapY);
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
