import { useState, useRef, RefObject } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { useHoverNationResolver } from "@/presentation/components/tactical-map/hud/hooks/use-hover-nation-resolver";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { useGridPicker } from "@/presentation/hooks/tactical-map/final/use-grid-picker";
import { useContextMenu } from "@/presentation/hooks/tactical-map/final/use-context-menu";
import { CountryRegistry } from "@/domain/data/countries";
import { HoverHudPositionUtility } from "@/presentation/components/tactical-map/final/hud/utils/hover-hud-position.utility";

interface UseWebGLInteractionProps {
  containerRef: RefObject<HTMLDivElement | null>;
  hudRef: RefObject<HTMLDivElement | null>;
  positionRef: RefObject<CameraPosition>;
  scaleRef: RefObject<number>;
  isDraggingRef: RefObject<boolean>;
  hasDraggedRef: RefObject<boolean>;
  provincesMap?: Record<string, ProvinceDynamicState>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  onRequestRender?: () => void;
}

export function useWebGLInteraction({
  containerRef,
  hudRef,
  positionRef,
  scaleRef,
  isDraggingRef,
  hasDraggedRef,
  provincesMap,
  nationsMap,
  humanNationId,
  onRequestRender,
}: UseWebGLInteractionProps) {
  const lastHoverProvinceIdRef = useRef<number | null>(null);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [hoverData, setHoverData] = useState<HoverCountryInfo | null>(null);
  const [hoveredGpuIndex, setHoveredGpuIndex] = useState<number>(0);

  const { pickAtScreenPos } = useGridPicker();
  const { contextMenuState, openContextMenu, closeContextMenu } =
    useContextMenu();

  const { resolveHoverInfo } = useHoverNationResolver({
    provincesMap,
    nationsMap,
    humanNationId,
  });

  const handlePointerMove = (clientX: number, clientY: number) => {
    lastMousePosRef.current = { x: clientX, y: clientY };

    HoverHudPositionUtility.applyPositionToElement(
      hudRef.current,
      clientX,
      clientY,
    );

    const container = containerRef.current;
    if (!container || isDraggingRef.current) {
      if (contextMenuState) {
        closeContextMenu();
      }
      if (hoverData !== null) setHoverData(null);
      if (hoveredGpuIndex !== 0) {
        setHoveredGpuIndex(0);
        if (onRequestRender) onRequestRender();
      }
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
      const prov = provincesMap?.[provinceId.toString()];
      const gpuIdx = prov
        ? CountryRegistry.getGpuColorIndex(prov.ownerNationId)
        : 0;

      if (hoveredGpuIndex !== gpuIdx) {
        setHoveredGpuIndex(gpuIdx);
        if (onRequestRender) onRequestRender();
      }

      if (lastHoverProvinceIdRef.current !== provinceId) {
        lastHoverProvinceIdRef.current = provinceId;
        const info = resolveHoverInfo(provinceId);
        setHoverData(info);

        requestAnimationFrame(() => {
          HoverHudPositionUtility.applyPositionToElement(
            hudRef.current,
            lastMousePosRef.current.x,
            lastMousePosRef.current.y,
          );
        });
      }
      return;
    }

    lastHoverProvinceIdRef.current = null;
    if (hoverData !== null) setHoverData(null);
    if (hoveredGpuIndex !== 0) {
      setHoveredGpuIndex(0);
      if (onRequestRender) onRequestRender();
    }
  };

  const handlePointerLeave = () => {
    lastHoverProvinceIdRef.current = null;
    setHoverData(null);
    if (hoveredGpuIndex !== 0) {
      setHoveredGpuIndex(0);
      if (onRequestRender) onRequestRender();
    }
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
    hoverData,
    hoveredGpuIndex,
    contextMenuState,
    handlePointerMove,
    handlePointerLeave,
    handleMapClick,
    closeContextMenu,
  };
}
