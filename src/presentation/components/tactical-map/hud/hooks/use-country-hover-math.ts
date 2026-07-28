import { useCallback, useRef, useState } from "react";
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

  const processMouseMove = useCallback(() => {
    rafIdRef.current = null;
    const lastPos = lastMousePosRef.current;
    if (!lastPos) {
      setHoverData(null);
      setCursorPos(null);
      return;
    }

    setCursorPos({ x: lastPos.clientX, y: lastPos.clientY });
    const projection = projectCoordinates(lastPos.clientX, lastPos.clientY);

    if (!projection) {
      setHoverData(null);
      return;
    }

    const info = resolveHoverInfo(
      projection.nationIdNumber,
      projection.greenChannelVal,
    );
    setHoverData(info);
  }, [projectCoordinates, resolveHoverInfo]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(processMouseMove);
    }
  };

  const handleMouseLeave = () => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    lastMousePosRef.current = null;
    setHoverData(null);
    setCursorPos(null);
  };

  return { hoverData, cursorPos, handleMouseMove, handleMouseLeave };
}
