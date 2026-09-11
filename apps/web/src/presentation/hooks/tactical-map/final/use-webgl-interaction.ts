import { useState, useRef, RefObject, useCallback } from "react";
import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { useHoverNationResolver } from "@/presentation/components/tactical-map/hud/hooks/use-hover-nation-resolver";
import { HoverCountryInfo } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { useGridPicker } from "@/presentation/hooks/tactical-map/final/use-grid-picker";
import { useContextMenu } from "@/presentation/hooks/tactical-map/final/use-context-menu";
import { CountryRegistry } from "@/domain/data/countries";
import { HoverHudPositionUtility } from "@/presentation/components/tactical-map/final/hud/utils/hover-hud-position.utility";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

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

  const clearHoverState = useCallback(() => {
    lastHoverProvinceIdRef.current = null;
    setHoverData(null);
    HoverHudPositionUtility.reset();
    setHoveredGpuIndex((prev) => {
      if (prev !== 0) {
        if (onRequestRender) {
          onRequestRender();
        }
        return 0;
      }
      return 0;
    });
  }, [onRequestRender]);

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (
        typeof window !== "undefined" &&
        !window.matchMedia("(hover: hover)").matches
      ) {
        return;
      }

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
        clearHoverState();
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
          TacticalSound.playMapHover();
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

      clearHoverState();
    },
    [
      clearHoverState,
      closeContextMenu,
      containerRef,
      contextMenuState,
      hoveredGpuIndex,
      hudRef,
      isDraggingRef,
      pickAtScreenPos,
      positionRef,
      provincesMap,
      resolveHoverInfo,
      scaleRef,
      onRequestRender,
    ],
  );

  const handlePointerLeave = useCallback(() => {
    clearHoverState();
  }, [clearHoverState]);

  const handleMapClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
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
        clearHoverState();
        return;
      }

      const prov = provincesMap?.[provinceId.toString()];
      const gpuIdx = prov
        ? CountryRegistry.getGpuColorIndex(prov.ownerNationId)
        : 0;

      setHoveredGpuIndex(gpuIdx);
      lastHoverProvinceIdRef.current = provinceId;

      const info = resolveHoverInfo(provinceId);

      HoverHudPositionUtility.applyPositionToElement(
        hudRef.current,
        e.clientX,
        e.clientY,
      );

      setHoverData(info);

      if (onRequestRender) {
        onRequestRender();
      }

      openContextMenu(
        e.clientX,
        e.clientY,
        provinceId,
        provincesMap,
        nationsMap,
        humanNationId,
      );
    },
    [
      clearHoverState,
      closeContextMenu,
      containerRef,
      hasDraggedRef,
      hudRef,
      humanNationId,
      isDraggingRef,
      nationsMap,
      openContextMenu,
      pickAtScreenPos,
      positionRef,
      provincesMap,
      resolveHoverInfo,
      scaleRef,
      onRequestRender,
    ],
  );

  return {
    hoverData,
    hoveredGpuIndex,
    contextMenuState,
    handlePointerMove,
    handlePointerLeave,
    handleMapClick,
    closeContextMenu,
    clearHoverState,
  };
}
