import { useCallback, useRef, useState } from "react";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { findCountryProfileById } from "@/domain/map/countries";
import { HoverCountryInfo } from "../country-hover-container";

interface UseCountryHoverMathProps {
  countries: CountryMapping[];
  maskDataRef: React.RefObject<Uint8Array | null>;
  mapWidth: number;
  mapHeight: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  position: { x: number; y: number };
  rankingsCacheRef: React.RefObject<Map<string, number>>;
}

export function useCountryHoverMath({
  countries,
  maskDataRef,
  mapWidth,
  mapHeight,
  containerRef,
  scale,
  position,
  rankingsCacheRef,
}: UseCountryHoverMathProps) {
  const [hoverData, setHoverData] = useState<HoverCountryInfo | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const lastMousePosRef = useRef<{ clientX: number; clientY: number } | null>(
    null,
  );

  const processMouseMove = useCallback(() => {
    rafIdRef.current = null;
    const lastPos = lastMousePosRef.current;
    const container = containerRef.current;
    if (!lastPos || !container || !maskDataRef.current) {
      setHoverData(null);
      return;
    }

    const rect = container.getBoundingClientRect();
    const clientX = lastPos.clientX - rect.left;
    const clientY = lastPos.clientY - rect.top;

    const fx = mapWidth / rect.width;
    const fy = mapHeight / rect.height;

    const mapX = Math.floor(((clientX - position.x) / scale) * fx);
    const mapY = Math.floor(((clientY - position.y) / scale) * fy);

    if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) {
      setHoverData(null);
      return;
    }

    const pixelIndex = mapY * mapWidth + mapX;
    const nationIdNumber = maskDataRef.current[pixelIndex];

    if (!nationIdNumber || nationIdNumber < 11 || nationIdNumber >= 250) {
      setHoverData(null);
      return;
    }

    const matchedCountry = countries.find((c) => c.id === nationIdNumber);
    if (!matchedCountry) {
      setHoverData(null);
      return;
    }

    const profile = findCountryProfileById(matchedCountry.id);
    const realName = profile ? profile.nameFa : matchedCountry.name;
    const areaVal = matchedCountry.areaSqKm ?? 50000;
    const realGdp = profile ? profile.gdp : areaVal * 1500;

    const gdpBillionsNum = realGdp / 1e9;
    const gdpFormatted = Number.isInteger(gdpBillionsNum)
      ? gdpBillionsNum.toString()
      : gdpBillionsNum.toFixed(1);

    const flagCode = profile ? profile.flagCode : matchedCountry.code;
    const nationKey = `NATION_${matchedCountry.id}`;
    const cachedRank =
      rankingsCacheRef.current?.get(nationKey) ?? matchedCountry.id;

    setHoverData({
      name: realName,
      code: matchedCountry.code,
      flagCode: flagCode,
      rank: cachedRank,
      stance: "صلح و دیپلماسی عادی",
      gdp: `$${gdpFormatted} میلیارد دلار`,
    });
  }, [
    countries,
    maskDataRef,
    mapWidth,
    mapHeight,
    containerRef,
    scale,
    position,
    rankingsCacheRef,
  ]);

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
  };

  return {
    hoverData,
    handleMouseMove,
    handleMouseLeave,
  };
}
