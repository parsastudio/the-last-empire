import { useEffect, useRef, useState } from "react";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { HoverCountryInfo } from "../country-hover-container";
import { Nation } from "@/domain/nation/nation.schema";
import { useHoverProjectionMath } from "./use-hover-projection-math";
import { useHoverNationResolver } from "./use-hover-nation-resolver";

interface UseCountryHoverMathProps {
  countries: CountryMapping[];
  maskDataRef: React.RefObject<Uint8Array | null>;
  packed1024Ref?: React.RefObject<Uint8Array | null>;
  mapWidth: number;
  mapHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  position: { x: number; y: number };
  rankingsMap: Map<string, number>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  isDragging?: boolean;
}

export function useCountryHoverMath({
  countries,
  maskDataRef,
  packed1024Ref,
  mapWidth,
  mapHeight,
  containerRef,
  scale,
  position,
  rankingsMap,
  nationsMap,
  humanNationId = "NATION_118",
  isDragging = false,
}: UseCountryHoverMathProps) {
  const [hoverData, setHoverData] = useState<HoverCountryInfo | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const rafIdRef = useRef<number | null>(null);
  const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(
    null,
  );

  const { projectCoordinates } = useHoverProjectionMath({
    containerRef,
    maskDataRef,
    packed1024Ref,
    mapWidth,
    mapHeight,
    scale,
    position,
  });

  const { resolveHoverInfo } = useHoverNationResolver({
    countries,
    rankingsMap,
    nationsMap,
    humanNationId,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handlePointerMove = (e: MouseEvent) => {
      if (isDragging) {
        setHoverData(null);
        setCursorPos(null);
        return;
      }

      lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
      if (rafIdRef.current === null) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          const lastPos = lastMousePosRef.current;
          if (!lastPos) {
            setHoverData(null);
            setCursorPos(null);
            return;
          }

          const projection = projectCoordinates(
            lastPos.clientX,
            lastPos.clientY,
          );

          if (!projection) {
            setHoverData(null);
            setCursorPos(null);
            return;
          }

          setCursorPos({ x: lastPos.clientX, y: lastPos.clientY });
          const info = resolveHoverInfo(
            projection.nationIdNumber,
            projection.greenChannelVal,
          );
          setHoverData(info);
        });
      }
    };

    const handlePointerLeave = () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastMousePosRef.current = null;
      setHoverData(null);
      setCursorPos(null);
    };

    container.addEventListener("mousemove", handlePointerMove);
    container.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      container.removeEventListener("mousemove", handlePointerMove);
      container.removeEventListener("mouseleave", handlePointerLeave);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [containerRef, isDragging, projectCoordinates, resolveHoverInfo]);

  return { hoverData, cursorPos };
}
