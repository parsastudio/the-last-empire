import { useState, useRef, RefObject } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { useHoverNationResolver } from "@/presentation/components/tactical-map/hud/hooks/use-hover-nation-resolver";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { useGridPicker } from "@/presentation/hooks/tactical-map/final/use-grid-picker";
import { useContextMenu } from "@/presentation/hooks/tactical-map/final/use-context-menu";

interface UseWebGLInteractionProps {
  containerRef: RefObject<HTMLDivElement | null>;
  positionRef: RefObject<CameraPosition>;
  scaleRef: RefObject<number>;
  isDraggingRef: RefObject<boolean>;
  hasDraggedRef: RefObject<boolean>;
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
}

export function useWebGLInteraction({
  containerRef,
  positionRef,
  scaleRef,
  isDraggingRef,
  hasDraggedRef,
  provincesMap,
  nationsMap,
  humanNationId,
}: UseWebGLInteractionProps) {
  const lastHoverProvinceIdRef = useRef<number | null>(null);

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [hoverData, setHoverData] = useState<HoverCountryInfo | null>(null);

  const { pickAtScreenPos } = useGridPicker();
  const { contextMenuState, openContextMenu, closeContextMenu } =
    useContextMenu();

  const { resolveHoverInfo } = useHoverNationResolver({
    provincesMap,
    nationsMap,
    humanNationId,
  });

  const handlePointerMove = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container || isDraggingRef.current) {
      if (contextMenuState) {
        closeContextMenu();
      }
      if (hoverPos !== null) setHoverPos(null);
      if (hoverData !== null) setHoverData(null);
      lastHoverProvinceIdRef.current = null;
      return;
    }

    const rect = container.getBoundingClientRect();
    const rx = clientX - rect.left;
    const ry = clientY - rect.top;

    const pos = positionRef.current || { x: 0, y: 0 };
    const scale = scaleRef.current || 1;

    const { provinceId } = pickAtScreenPos(rx, ry, pos, scale);

    if (provinceId > 0) {
      if (lastHoverProvinceIdRef.current !== provinceId || !hoverData) {
        const info = resolveHoverInfo(provinceId);
        if (info) {
          lastHoverProvinceIdRef.current = provinceId;
          setHoverPos({ x: clientX, y: clientY });
          setHoverData(info);
          return;
        }
      } else {
        setHoverPos({ x: clientX, y: clientY });
        return;
      }
    }

    lastHoverProvinceIdRef.current = null;
    if (hoverPos !== null) setHoverPos(null);
    if (hoverData !== null) setHoverData(null);
  };

  const handlePointerLeave = () => {
    lastHoverProvinceIdRef.current = null;
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

    const { provinceId } = pickAtScreenPos(rx, ry, pos, scale);

    if (provinceId <= 0) {
      closeContextMenu();
      return;
    }

    openContextMenu(
      e.clientX,
      e.clientY,
      provinceId,
      provincesMap,
      nationsMap,
      humanNationId,
    );
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
