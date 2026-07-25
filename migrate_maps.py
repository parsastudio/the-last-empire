import os
import shutil

FILES_TO_WRITE = {
    "src/app/test1/page.tsx": """'use client';

import MapTestPage from "@/map-systems/test1/page";

export default function Page() {
  return <MapTestPage />;
}
""",
    "src/app/test2/page.tsx": """'use client';

import WorldDividerTestPage from "@/map-systems/test2/page";

export default function Page() {
  return <WorldDividerTestPage />;
}
""",
    "src/app/test3/page.tsx": """'use client';

import WorldDividerSimplifiedTestPage from "@/map-systems/test3/page";

export default function Page() {
  return <WorldDividerSimplifiedTestPage />;
}
""",
    "src/map-systems/test1/page.tsx": """'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useMapLoader } from "./hooks/use-map-loader";
import { GameMap } from "./components/game-map";
import { StrategicDashboard } from "@/presentation/components/strategic-dashboard";
import { useMapCalculations } from "./hooks/use-map-calculations";
import { useMapTestSimulation } from "./hooks/use-map-test-simulation";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import { processProvincesAndVectors } from "@/application/map-processor";
import { expandCountryProvinces } from "@/application/province-engine";
import type { Province } from "@/domain/map/province.schema";
import type { GeoJsonData } from "./engine/types";

export default function MapTestPage() {
  const { vectorProvinces, provinces, loading, error, loadMapFromData } =
    useMapLoader();
  const [playerCountryCode, setPlayerCountryCode] = useState<string | null>(
    null,
  );
  const [occupiedProvinceIds, setOccupiedProvinceIds] = useState<Set<string>>(
    new Set(),
  );

  useEffect(() => {
    async function autoLoadWorldMap() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_1_states_provinces.geojson",
        );
        if (!response.ok) {
          throw new Error("Local map file not found in public folder");
        }
        const geoJson = (await response.json()) as GeoJsonData;
        await loadMapFromData(geoJson, 1200, 600);
      } catch {
        await loadMapFromData(FALLBACK_WORLD_MAP, 1200, 600);
      }
    }
    autoLoadWorldMap();
  }, [loadMapFromData]);

  const processedMap = useMemo(() => {
    if (!vectorProvinces || !provinces) return null;
    return processProvincesAndVectors(provinces, vectorProvinces);
  }, [vectorProvinces, provinces]);

  const provincesMap = useMemo((): Record<string, Province[]> => {
    if (!processedMap) return {};
    const expanded = expandCountryProvinces(processedMap.provinces);
    const grouped: Record<string, Province[]> = {};

    for (const prov of Object.values(expanded)) {
      if (!grouped[prov.ownerNationId]) {
        grouped[prov.ownerNationId] = [];
      }
      grouped[prov.ownerNationId].push(prov);
    }

    for (const list of Object.values(grouped)) {
      for (const p of list) {
        if (playerCountryCode && p.ownerNationId === playerCountryCode) {
          p.isOccupied = true;
        }
        if (occupiedProvinceIds.has(p.id)) {
          p.isOccupied = true;
        }
      }
    }
    return grouped;
  }, [processedMap, occupiedProvinceIds, playerCountryCode]);

  const occupations = useMemo((): Record<string, number> => {
    const occs: Record<string, number> = {};
    for (const [code, provs] of Object.entries(provincesMap)) {
      if (code === playerCountryCode || provs.length === 0) continue;
      const occupiedCount = provs.filter((p: Province) => p.isOccupied).length;
      if (occupiedCount > 0) {
        occs[code] = Number(((occupiedCount / provs.length) * 100).toFixed(1));
      }
    }
    return occs;
  }, [provincesMap, playerCountryCode]);

  const provincesState = useMemo((): Record<string, Province> => {
    if (!processedMap) return {};
    const state: Record<string, Province> = {};
    for (const prov of Object.values(processedMap.provinces)) {
      const countryCode = prov.id.substring(0, prov.id.indexOf("_P"));
      const occupiedPercent = occupations[countryCode] || 0;
      state[prov.id] = {
        ...prov,
        ownerNationId:
          playerCountryCode && occupiedPercent >= 100
            ? playerCountryCode
            : prov.ownerNationId,
      };
    }
    return state;
  }, [processedMap, occupations, playerCountryCode]);

  const { activeBorders, empireStats, conquests } = useMapCalculations({
    playerCountryCode,
    provincesMap,
    provincesState,
    occupations,
  });

  const { assaultVector, handleCountryClick } = useMapTestSimulation({
    playerCountryCode,
    setPlayerCountryCode,
    provincesMap,
    setOccupiedProvinceIds,
  });

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white select-none">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Generating Strategic Vector Atlas...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50">
          Error: {error}
        </div>
      )}

      {processedMap && !loading && (
        <div className="w-full h-full relative">
          <GameMap
            vectorProvinces={processedMap.vectorProvinces}
            provincesState={provincesState}
            width={1200}
            height={600}
            onCountryClick={handleCountryClick}
            occupations={occupations}
            allProvinces={provincesMap}
            playerCountryCode={playerCountryCode}
            activeAssaultVector={assaultVector}
          />

          <div className="absolute top-6 right-6 w-80 pointer-events-none z-40">
            <div className="pointer-events-auto">
              <StrategicDashboard
                playerCountryCode={playerCountryCode}
                empireStats={empireStats}
                activeBorders={activeBorders}
                conquests={conquests}
                onReset={() => {
                  setPlayerCountryCode(null);
                  setOccupiedProvinceIds(new Set());
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
""",
    "src/map-systems/test1/components/game-map.tsx": """'use client';

import React, { useState } from "react";
import { MapOverlayNodes } from "./map-overlay-nodes";
import { MapControls } from "./map-controls";
import { useMapGesture } from "../hooks/use-map-gesture";
import { MapDefs } from "./map-defs";
import { MapCountryPaths } from "./map-country-paths";
import { MapTooltip } from "./map-tooltip";
import type { VectorProvince } from "../engine/grid-generator";
import type { Province } from "@/domain/map/province.schema";

interface GameMapProps {
  vectorProvinces: VectorProvince[];
  provincesState: Record<string, Province>;
  width: number;
  height: number;
  onCountryClick: (countryCode: string, angle: number) => void;
  occupations?: Record<string, number>;
  allProvinces?: Record<string, Province[]>;
  playerCountryCode?: string | null;
  activeAssaultVector?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null;
}

export function GameMap({
  vectorProvinces,
  provincesState,
  width,
  height,
  onCountryClick,
  occupations = {},
  allProvinces = {},
  playerCountryCode = null,
  activeAssaultVector = null,
}: GameMapProps) {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const {
    scale,
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView,
  } = useMapGesture();

  const getNationColor = (countryCode: string): string => {
    if (playerCountryCode && countryCode === playerCountryCode) {
      return "rgb(16, 185, 129)";
    }
    let hash = 0;
    for (let i = 0; i < countryCode.length; i++) {
      hash = countryCode.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 100) + 50;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 100) + 50;
    const b = (Math.abs(hash & 0x0000ff) % 100) + 50;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const stripeId = playerCountryCode
    ? `military-stripes-${playerCountryCode}`
    : "military-stripes-IRN";

  const getCountryFullName = (code: string): string => {
    const provId = `${code}_P1`;
    const prov = provincesState[provId];
    return prov ? prov.name.replace(" Region", "") : code;
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`w-full h-full relative overflow-hidden bg-slate-950 cursor-grab ${
        isDragging ? "cursor-grabbing" : ""
      }`}
    >
      <div
        className="w-full h-full transition-transform duration-75 ease-out select-none origin-center flex items-center justify-center"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full pointer-events-auto"
        >
          <MapDefs
            stripeId={stripeId}
            vectorProvinces={vectorProvinces}
            occupations={occupations}
            playerCountryCode={playerCountryCode}
            getNationColor={getNationColor}
            provincesState={provincesState}
          />

          <rect width={width} height={height} fill="rgb(10, 15, 30)" />

          <MapCountryPaths
            vectorProvinces={vectorProvinces}
            provincesState={provincesState}
            playerCountryCode={playerCountryCode}
            hoveredCountry={hoveredCountry}
            stripeId={stripeId}
            occupations={occupations}
            getNationColor={getNationColor}
            setHoveredCountry={setHoveredCountry}
            onCountryClick={onCountryClick}
          />

          <MapOverlayNodes
            hoveredCountry={hoveredCountry}
            allProvinces={allProvinces}
            activeAssaultVector={activeAssaultVector}
          />
        </svg>
      </div>

      <MapControls
        scale={scale}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={resetView}
      />

      {hoveredCountry && (
        <MapTooltip
          hoveredCountry={hoveredCountry}
          playerCountryCode={playerCountryCode}
          occupations={occupations}
          getCountryFullName={getCountryFullName}
        />
      )}
    </div>
  );
}
""",
    "src/map-systems/test1/components/map-country-paths.tsx": """import React from "react";
import type { VectorProvince } from "../engine/grid-generator";
import type { Province } from "@/domain/map/province.schema";

interface MapCountryPathsProps {
  vectorProvinces: VectorProvince[];
  provincesState: Record<string, Province>;
  playerCountryCode: string | null;
  hoveredCountry: string | null;
  stripeId: string;
  occupations: Record<string, number>;
  getNationColor: (code: string) => string;
  setHoveredCountry: (code: string | null) => void;
  onCountryClick: (code: string, angle: number) => void;
}

export function MapCountryPaths({
  vectorProvinces,
  provincesState,
  playerCountryCode,
  hoveredCountry,
  stripeId,
  occupations,
  getNationColor,
  setHoveredCountry,
  onCountryClick,
}: MapCountryPathsProps) {
  return (
    <>
      {vectorProvinces.map((prov) => {
        const isHovered = hoveredCountry === prov.countryCode;
        const provData = provincesState[prov.id];
        const currentOwner = provData
          ? provData.ownerNationId
          : prov.countryCode;
        const occupiedPercent = occupations[prov.countryCode] || 0;

        let fillValue = getNationColor(currentOwner);

        if (prov.countryCode !== playerCountryCode) {
          if (currentOwner === playerCountryCode || occupiedPercent >= 100) {
            fillValue = `url(#${stripeId})`;
          } else if (occupiedPercent > 0) {
            fillValue = `url(#occupied-grad-${prov.countryCode})`;
          } else if (isHovered) {
            fillValue = "rgb(14, 165, 233)";
          }
        } else if (isHovered) {
          fillValue = "rgb(52, 211, 153)";
        }

        const isOriginallyDifferent = !prov.id.startsWith(currentOwner);
        const strokeColor =
          isOriginallyDifferent ||
          (isHovered && currentOwner === hoveredCountry)
            ? fillValue
            : "rgba(10, 15, 30, 0.6)";

        return (
          <g key={prov.id}>
            <path
              d={prov.pathData}
              fill={fillValue}
              stroke={strokeColor}
              strokeWidth={isHovered ? "1.5" : "0.5"}
              className="transition-all duration-150 cursor-pointer"
              onMouseEnter={() => setHoveredCountry(prov.countryCode)}
              onMouseLeave={() => setHoveredCountry(null)}
              onClick={(e) => {
                e.stopPropagation();
                onCountryClick(prov.countryCode, 0);
              }}
            />
          </g>
        );
      })}
    </>
  );
}
""",
    "src/map-systems/test1/components/map-defs.tsx": """import React from "react";
import type { VectorProvince } from "../engine/grid-generator";
import type { Province } from "@/domain/map/province.schema";

interface MapDefsProps {
  stripeId: string;
  vectorProvinces: VectorProvince[];
  occupations: Record<string, number>;
  playerCountryCode: string | null;
  getNationColor: (code: string) => string;
  provincesState: Record<string, Province>;
}

export function MapDefs({
  stripeId,
  vectorProvinces,
  occupations,
  playerCountryCode,
  getNationColor,
  provincesState,
}: MapDefsProps) {
  return (
    <defs>
      <pattern
        id={stripeId}
        width="12"
        height="12"
        patternTransform="rotate(45)"
        patternUnits="userSpaceOnUse"
      >
        <rect width="12" height="12" fill="rgb(16, 185, 129)" />
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="12"
          stroke="rgba(10, 15, 30, 0.35)"
          strokeWidth="4"
        />
      </pattern>

      {vectorProvinces.map((prov) => {
        const occupiedPercent = occupations[prov.countryCode] || 0;
        if (
          occupiedPercent > 0 &&
          occupiedPercent < 100 &&
          prov.countryCode !== playerCountryCode
        ) {
          const baseColor = getNationColor(prov.countryCode);

          let x1 = "0%";
          let y1 = "0%";
          let x2 = "100%";
          let y2 = "0%";

          if (playerCountryCode) {
            const playerCapital = provincesState[`${playerCountryCode}_P1`];
            const targetCapital = provincesState[`${prov.countryCode}_P1`];

            if (playerCapital && targetCapital) {
              const dx = playerCapital.x - targetCapital.x;
              const dy = playerCapital.y - targetCapital.y;
              const theta = Math.atan2(dy, dx);

              const cosT = Math.cos(theta);
              const sinT = Math.sin(theta);

              x1 = `${(50 + 50 * cosT).toFixed(1)}%`;
              y1 = `${(50 + 50 * sinT).toFixed(1)}%`;
              x2 = `${(50 - 50 * cosT).toFixed(1)}%`;
              y2 = `${(50 - 50 * sinT).toFixed(1)}%`;
            }
          }

          return (
            <linearGradient
              key={`grad-${prov.id}`}
              id={`occupied-grad-${prov.countryCode}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
            >
              <stop
                offset={`${occupiedPercent}%`}
                stopColor="rgb(16, 185, 129)"
              />
              <stop offset={`${occupiedPercent}%`} stopColor={baseColor} />
            </linearGradient>
          );
        }
        return null;
      })}
    </defs>
  );
}
""",
    "src/map-systems/test1/components/map-overlay-nodes.tsx": """import React from "react";
import { TacticalAssaultLaser } from "./tactical-assault-laser";
import type { Province } from "@/domain/map/province.schema";

interface MapOverlayNodesProps {
  hoveredCountry: string | null;
  allProvinces: Record<string, Province[]>;
  activeAssaultVector?: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null;
}

export function MapOverlayNodes({
  activeAssaultVector = null,
  ..._unused
}: MapOverlayNodesProps) {
  return (
    <g className="pointer-events-none">
      {activeAssaultVector && (
        <TacticalAssaultLaser vector={activeAssaultVector} />
      )}
    </g>
  );
}
""",
    "src/map-systems/test1/components/map-controls.tsx": """import React from "react";

interface MapControlsProps {
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export function MapControls({
  scale,
  onZoomIn,
  onZoomOut,
  onResetView,
}: MapControlsProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-800/80 flex items-center gap-4 shadow-2xl pointer-events-auto z-50">
      <button
        onClick={onZoomOut}
        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center font-bold text-lg select-none transition-colors border border-slate-700/50"
      >
        -
      </button>
      <span className="text-xs font-mono font-bold text-slate-400 select-none min-w-[32px] text-center">
        {scale.toFixed(1)}x
      </span>
      <button
        onClick={onZoomIn}
        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 active:bg-slate-600 flex items-center justify-center font-bold text-lg select-none transition-colors border border-slate-700/50"
      >
        +
      </button>
      <div className="w-px h-6 bg-slate-800" />
      <button
        onClick={onResetView}
        className="text-xs bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-full font-semibold transition-colors border border-slate-700/50"
      >
        Reset View
      </button>
    </div>
  );
}
""",
    "src/map-systems/test1/components/map-tooltip.tsx": """import React from "react";

interface MapTooltipProps {
  hoveredCountry: string;
  playerCountryCode: string | null;
  occupations: Record<string, number>;
  getCountryFullName: (code: string) => string;
}

export function MapTooltip({
  hoveredCountry,
  playerCountryCode,
  occupations,
  getCountryFullName,
}: MapTooltipProps) {
  return (
    <div className="absolute top-6 left-6 bg-slate-900/90 backdrop-blur-md px-5 py-3 rounded-2xl border border-slate-800/80 text-xs font-semibold shadow-2xl pointer-events-none z-40">
      <div className="text-slate-400">Target Country</div>
      <div className="text-lg font-bold text-white mt-0.5">
        {getCountryFullName(hoveredCountry)}
      </div>
      {playerCountryCode &&
        hoveredCountry !== playerCountryCode &&
        (occupations[hoveredCountry] || 0) > 0 && (
          <div className="text-[10px] text-emerald-400 mt-1 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            {occupations[hoveredCountry]}% occupied by {playerCountryCode}
          </div>
        )}
    </div>
  );
}
""",
    "src/map-systems/test1/components/tactical-assault-laser.tsx": """import React from "react";

interface TacticalAssaultLaserProps {
  vector: {
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  };
}

export function TacticalAssaultLaser({ vector }: TacticalAssaultLaserProps) {
  return (
    <g>
      <style>{`
        @keyframes tacticalDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .tactical-assault-laser {
          animation: tacticalDash 1.2s linear infinite;
        }
      `}</style>
      <path
        d={`M ${vector.fromX},${vector.fromY} Q ${(vector.fromX + vector.toX) / 2},${Math.min(vector.fromY, vector.toY) - 80} ${vector.toX},${vector.toY}`}
        fill="none"
        stroke="rgb(244, 63, 94)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="6 4"
        className="tactical-assault-laser"
        filter="drop-shadow(0 0 4px rgb(244, 63, 94))"
      />
      <circle
        cx={vector.fromX}
        cy={vector.fromY}
        r="6"
        fill="rgb(16, 185, 129)"
        className="animate-ping"
      />
      <circle
        cx={vector.toX}
        cy={vector.toY}
        r="8"
        fill="none"
        stroke="rgb(244, 63, 94)"
        strokeWidth="2"
        className="animate-ping"
      />
    </g>
  );
}
""",
    "src/map-systems/test1/components/coastal-node-indicators.tsx": """import React from "react";
import type { Province } from "@/domain/map/province.schema";

interface CoastalNodeIndicatorsProps {
  targetProvs: Province[];
}

export function CoastalNodeIndicators({
  targetProvs,
}: CoastalNodeIndicatorsProps) {
  return (
    <>
      {targetProvs.map((p) => (
        <g key={`node-${p.id}`}>
          <circle
            cx={p.x}
            cy={p.y}
            r={p.isCoastal ? "4.5" : "3"}
            fill={p.isOccupied ? "rgb(16, 185, 129)" : "rgb(239, 68, 68)"}
            stroke="rgb(10, 15, 30)"
            strokeWidth="1"
            className="animate-pulse"
          />
          {p.isCoastal && (
            <circle
              cx={p.x}
              cy={p.y}
              r="7"
              fill="none"
              stroke="rgb(14, 165, 233)"
              strokeWidth="0.75"
              strokeDasharray="1.5 1.5"
            />
          )}
        </g>
      ))}
    </>
  );
}
""",
    "src/map-systems/test1/components/network-connection-lines.tsx": """import React from "react";
import type { Province } from "@/domain/map/province.schema";

interface NetworkConnectionLinesProps {
  targetProvs: Province[];
}

export function NetworkConnectionLines({
  targetProvs,
}: NetworkConnectionLinesProps) {
  return (
    <>
      {targetProvs.map((p) =>
        p.neighbors.map((nId) => {
          const targetProv = targetProvs.find((tp) => tp.id === nId);
          if (targetProv && p.id < nId) {
            return (
              <line
                key={`line-${p.id}-${nId}`}
                x1={p.x}
                y1={p.y}
                x2={targetProv.x}
                y2={targetProv.y}
                stroke="rgba(16, 185, 129, 0.45)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
            );
          }
          return null;
        }),
      )}
    </>
  );
}
""",
    "src/map-systems/test1/hooks/use-map-gesture.ts": """import React, { useState, useCallback } from "react";

export function useMapGesture() {
  const [scale, setScale] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.5, 6));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.5, 1));
  }, []);

  const resetView = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  return {
    scale,
    position,
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetView,
  };
}
""",
    "src/map-systems/test1/hooks/use-map-loader.ts": """import { useState, useCallback, useMemo } from "react";
import { GridGenerator } from "../engine/grid-generator";
import type { GeoJsonData, VectorProvince } from "../engine/grid-generator";
import type { Province } from "@/domain/map/province.schema";

export function useMapLoader() {
  const [vectorProvinces, setVectorProvinces] = useState<
    VectorProvince[] | null
  >(null);
  const [provinces, setProvinces] = useState<Record<string, Province> | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generator = useMemo(() => new GridGenerator(), []);

  const loadMapFromData = useCallback(
    async (geoJson: GeoJsonData, width: number, height: number) => {
      setLoading(true);
      setError(null);
      try {
        const payload = generator.generateVectorMap(geoJson, width, height);
        setVectorProvinces(payload.vectorProvinces);
        setProvinces(payload.provinces);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Map conversion failed");
      } finally {
        setLoading(false);
      }
    },
    [generator],
  );

  return {
    vectorProvinces,
    provinces,
    loading,
    error,
    loadMapFromData,
  };
}
""",
    "src/map-systems/test1/hooks/use-map-calculations.ts": """import { useActiveBorders } from "./map/use-active-borders";
import { useEmpireStats } from "./map/use-empire-stats";
import { useConquests } from "./map/use-conquests";
import { useActivePowersData } from "./map/use-active-powers-data";
import type { Province } from "@/domain/map/province.schema";

interface UseMapCalculationsProps {
  playerCountryCode: string | null;
  provincesMap: Record<string, Province[]>;
  provincesState: Record<string, Province>;
  occupations: Record<string, number>;
}

export function useMapCalculations({
  playerCountryCode,
  provincesMap,
  provincesState,
  occupations,
}: UseMapCalculationsProps) {
  const activeBorders = useActiveBorders({
    playerCountryCode,
    provincesState,
  });

  const empireStats = useEmpireStats({
    playerCountryCode,
    provincesState,
    occupations,
  });

  const conquests = useConquests({
    playerCountryCode,
    provincesState,
    occupations,
  });

  const activePowersListData = useActivePowersData({
    provincesMap,
    provincesState,
  });

  return {
    activeBorders,
    empireStats,
    conquests,
    activePowersListData,
  };
}
""",
    "src/map-systems/test1/hooks/use-map-interaction.ts": """import React, { useState, useCallback } from "react";
import type { GridCell } from "@/domain/map/grid.schema";

interface UseMapInteractionProps {
  grid: GridCell[][] | null;
  gridWidth: number;
  gridHeight: number;
}

export function useMapInteraction({
  grid,
  gridWidth,
  gridHeight,
}: UseMapInteractionProps) {
  const [hoveredNationId, setHoveredNationId] = useState<string | null>(null);
  const [selectedNationId, setSelectedNationId] = useState<string | null>(null);

  const getCellFromEvent = useCallback(
    (
      e: React.MouseEvent<HTMLCanvasElement>,
      canvasElement: HTMLCanvasElement,
    ): GridCell | null => {
      if (!grid) return null;

      const rect = canvasElement.getBoundingClientRect();
      const scaleX = gridWidth / rect.width;
      const scaleY = gridHeight / rect.height;

      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const gridX = Math.floor(clientX * scaleX);
      const gridY = Math.floor(clientY * scaleY);

      if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
        const row = grid[gridY];
        if (row) {
          return row[gridX] || null;
        }
      }
      return null;
    },
    [grid, gridWidth, gridHeight],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const cell = getCellFromEvent(e, canvas);
      if (cell && cell.type === "LAND") {
        setHoveredNationId(cell.ownerId);
      } else {
        setHoveredNationId(null);
      }
    },
    [getCellFromEvent],
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredNationId(null);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const cell = getCellFromEvent(e, canvas);
      if (cell && cell.type === "LAND" && cell.ownerId) {
        setSelectedNationId(cell.ownerId);
      }
    },
    [getCellFromEvent],
  );

  return {
    hoveredNationId,
    selectedNationId,
    setHoveredNationId,
    setSelectedNationId,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
  };
}
""",
    "src/map-systems/test1/hooks/use-map-test-simulation.ts": """import { useState, useCallback } from "react";
import { executeProvinceAttack } from "@/application/province-engine";
import type { Province } from "@/domain/map/province.schema";

interface UseMapTestSimulationProps {
  playerCountryCode: string | null;
  setPlayerCountryCode: (code: string | null) => void;
  provincesMap: Record<string, Province[]>;
  setOccupiedProvinceIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

export function useMapTestSimulation({
  playerCountryCode,
  setPlayerCountryCode,
  provincesMap,
  setOccupiedProvinceIds,
}: UseMapTestSimulationProps) {
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [assaultVector, setAssaultVector] = useState<{
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null>(null);

  const handleCountryClick = useCallback(
    (countryCode: string) => {
      if (!playerCountryCode) {
        const confirmed = window.confirm(
          "Are you sure you want to select this nation?",
        );
        if (confirmed) {
          setPlayerCountryCode(countryCode);
        }
        return;
      }

      if (countryCode === playerCountryCode || isAttacking) return;

      const result = executeProvinceAttack(
        countryCode,
        provincesMap,
        playerCountryCode,
      );

      if (result.newlyConqueredProvIds.length > 0) {
        setIsAttacking(true);

        const fromProv = Object.values(provincesMap)
          .flat()
          .find((p) => p.id === result.attackerSourceId);
        const toProv = Object.values(provincesMap)
          .flat()
          .find((p) => p.id === result.defenderEntryId);

        if (fromProv && toProv) {
          setAssaultVector({
            fromX: fromProv.x,
            fromY: fromProv.y,
            toX: toProv.x,
            toY: toProv.y,
          });
        }

        let index = 0;
        const queuedIds = result.newlyConqueredProvIds;

        const interval = setInterval(() => {
          if (index < queuedIds.length) {
            const nextId = queuedIds[index];
            if (nextId) {
              setOccupiedProvinceIds((prev) => {
                const next = new Set(prev);
                next.add(nextId);
                return next;
              });
            }
            index++;
          } else {
            clearInterval(interval);
            setIsAttacking(false);
            setAssaultVector(null);
          }
        }, 150);
      }
    },
    [
      playerCountryCode,
      isAttacking,
      provincesMap,
      setPlayerCountryCode,
      setOccupiedProvinceIds,
    ],
  );

  return {
    isAttacking,
    assaultVector,
    handleCountryClick,
    setAssaultVector,
  };
}
""",
    "src/map-systems/test1/hooks/map/use-active-borders.ts": """import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";

interface UseActiveBordersProps {
  playerCountryCode: string | null;
  provincesState: Record<string, Province>;
}

export function useActiveBorders({
  playerCountryCode,
  provincesState,
}: UseActiveBordersProps): string[] {
  return useMemo(() => {
    if (!playerCountryCode) return [];
    const borderSet = new Set<string>();

    Object.values(provincesState).forEach((p) => {
      if (p.ownerNationId === playerCountryCode) {
        p.neighbors.forEach((neighborId) => {
          const neighborProv = provincesState[neighborId];
          if (neighborProv) {
            const neighborOwner = neighborProv.ownerNationId;
            if (neighborOwner !== playerCountryCode) {
              borderSet.add(neighborOwner);
            }
          } else {
            const neighborCountry = neighborId.replace("_P1", "");
            if (neighborCountry !== playerCountryCode) {
              borderSet.add(neighborCountry);
            }
          }
        });
      }
    });

    return Array.from(borderSet);
  }, [provincesState, playerCountryCode]);
}
""",
    "src/map-systems/test1/hooks/map/use-conquests.ts": """import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";

interface UseConquestsProps {
  playerCountryCode: string | null;
  provincesState: Record<string, Province>;
  occupations: Record<string, number>;
}

export function useConquests({
  playerCountryCode,
  provincesState,
  occupations,
}: UseConquestsProps): (Province & { occupiedPercent: number })[] {
  return useMemo(() => {
    if (!playerCountryCode) return [];
    return Object.values(provincesState)
      .filter((p) => p.id !== `${playerCountryCode}_P1`)
      .map((p) => {
        const countryCode = p.id.replace("_P1", "");
        const occupiedPercent = occupations[countryCode] || 0;
        return {
          ...p,
          occupiedPercent,
        };
      })
      .filter((p) => p.occupiedPercent > 0);
  }, [provincesState, occupations, playerCountryCode]);
}
""",
    "src/map-systems/test1/hooks/map/use-empire-stats.ts": """import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";

interface UseEmpireStatsProps {
  playerCountryCode: string | null;
  provincesState: Record<string, Province>;
  occupations: Record<string, number>;
}

export function useEmpireStats({
  playerCountryCode,
  provincesState,
  occupations,
}: UseEmpireStatsProps) {
  return useMemo(() => {
    let totalGdp = 0;
    let totalPopulation = 0;
    let totalTerritories = 0;

    if (!playerCountryCode) {
      return { totalGdp, totalPopulation, totalTerritories };
    }

    Object.values(provincesState).forEach((p) => {
      const countryCode = p.id.replace("_P1", "");
      const occupiedPercent = occupations[countryCode] || 0;

      if (p.id === `${playerCountryCode}_P1`) {
        totalGdp += p.gdp;
        totalPopulation += p.population;
        totalTerritories += 1;
      } else {
        if (p.ownerNationId === playerCountryCode) {
          totalGdp += p.gdp;
          totalPopulation += p.population;
          totalTerritories += 1;
        } else if (occupiedPercent > 0) {
          totalGdp += p.gdp * (occupiedPercent / 100);
          totalPopulation += p.population * (occupiedPercent / 100);
          totalTerritories += occupiedPercent / 100;
        }
      }
    });

    return { totalGdp, totalPopulation, totalTerritories };
  }, [provincesState, occupations, playerCountryCode]);
}
""",
    "src/map-systems/test1/hooks/map/use-active-powers-data.ts": """import { useMemo } from "react";
import type { Province } from "@/domain/map/province.schema";
import type { ActivePowerNation } from "@/presentation/components/active-powers-list";

interface UseActivePowersDataProps {
  provincesMap: Record<string, Province[]>;
  provincesState: Record<string, Province>;
}

export function useActivePowersData({
  provincesMap,
  provincesState,
}: UseActivePowersDataProps): ActivePowerNation[] {
  return useMemo(() => {
    const list: ActivePowerNation[] = [];
    for (const [code, provs] of Object.entries(provincesMap)) {
      const provId = `${code}_P1`;
      const prov = provincesState[provId];
      if (prov) {
        list.push({
          id: code,
          name: prov.name.replace(" Region", ""),
          gdp: provs.reduce((sum, p) => sum + p.gdp, 0),
          population: provs.reduce((sum, p) => sum + p.population, 0),
          provinceCount: provs.length,
        });
      }
    }
    return list;
  }, [provincesMap, provincesState]);
}
""",
    "src/map-systems/test1/engine/projection.ts": """import type { Coordinate } from "@/domain/shared/primitives";

export class EquirectangularProjection {
  public project(
    longitude: number,
    latitude: number,
    width: number,
    height: number,
  ): Coordinate {
    const x = ((longitude + 180) / 360) * width;
    const y = ((90 - latitude) / 180) * height;
    return { x, y };
  }
}
""",
    "src/map-systems/test1/engine/types.ts": """import { Province } from "@/domain/map/province.schema";

export interface GeoJsonFeature {
  type: string;
  id?: string;
  properties: {
    ISO_A3?: string;
    iso_a3?: string;
    adm0_a3?: string;
    NAME?: string;
    name?: string;
    POP_EST?: number;
    pop_est?: number;
    GDP_MD?: number;
    gdp_md?: number;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

export interface VectorProvince {
  id: string;
  countryCode: string;
  name: string;
  pathData: string;
}

export interface GeneratedVectorMapPayload {
  provinces: Record<string, Province>;
  vectorProvinces: VectorProvince[];
}
""",
    "src/map-systems/test1/engine/polygon-geometry.ts": """export interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export function getBoundingBox(polygons: [number, number][][]): Box {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const poly of polygons) {
    for (const pt of poly) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[1] > maxY) maxY = pt[1];
    }
  }
  return { minX, maxX, minY, maxY };
}

export function isPointInPolygon(
  point: [number, number],
  vs: [number, number][],
): boolean {
  const x = point[0];
  const y = point[1];
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    const xi = vs[i][0];
    const yi = vs[i][1];
    const xj = vs[j][0];
    const yj = vs[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function isPointInCountry(
  point: [number, number],
  polygons: [number, number][][],
): boolean {
  return polygons.some((poly) => isPointInPolygon(point, poly));
}

export function calculateRingArea(ring: [number, number][]): number {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const p1 = ring[i];
    const p2 = ring[i + 1];
    if (p1 && p2) {
      area += p1[0] * p2[1] - p2[0] * p1[1];
    }
  }
  return Math.abs(area) / 2;
}

export function snapCoord(val: number): number {
  return Math.round(val * 1000) / 1000;
}
""",
    "src/map-systems/test1/engine/polygon-dissolver.ts": """import { snapCoord } from "./polygon-geometry";

export class PolygonDissolver {
  public dissolve(polygons: [number, number][][]): [number, number][][] {
    const segmentCounts = new Map<string, number>();
    const segmentMap = new Map<string, [[number, number], [number, number]]>();

    polygons.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        if (!p1 || !p2) continue;

        const k1 = `${snapCoord(p1[0])},${snapCoord(p1[1])}_${snapCoord(p2[0])},${snapCoord(p2[1])}`;
        const k2 = `${snapCoord(p2[0])},${snapCoord(p2[1])}_${snapCoord(p1[0])},${snapCoord(p1[1])}`;
        const sortedKey = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;

        segmentCounts.set(sortedKey, (segmentCounts.get(sortedKey) || 0) + 1);
        segmentMap.set(sortedKey, [p1, p2]);
      }
    });

    const adj = new Map<string, string[]>();
    const points = new Map<string, [number, number]>();

    segmentCounts.forEach((count, key) => {
      if (count === 1) {
        const seg = segmentMap.get(key);
        if (seg) {
          const [p1, p2] = seg;
          const k1 = `${snapCoord(p1[0])},${snapCoord(p1[1])}`;
          const k2 = `${snapCoord(p2[0])},${snapCoord(p2[1])}`;

          points.set(k1, p1);
          points.set(k2, p2);

          if (!adj.has(k1)) adj.set(k1, []);
          adj.get(k1)!.push(k2);
        }
      }
    });

    const visited = new Set<string>();
    const loops: [number, number][][] = [];

    for (const startKey of adj.keys()) {
      if (visited.has(startKey)) continue;

      const loop: [number, number][] = [];
      let currentKey: string | undefined = startKey;

      while (currentKey && !visited.has(currentKey)) {
        visited.add(currentKey);
        const pt = points.get(currentKey);
        if (pt) loop.push(pt);

        const neighbors: string[] = adj.get(currentKey) || [];
        let nextKey: string | undefined = neighbors.find(
          (n: string) => !visited.has(n),
        );
        if (!nextKey && neighbors.includes(startKey)) {
          nextKey = startKey;
        }
        currentKey = nextKey;
        if (nextKey === startKey) {
          const ptStart = points.get(startKey);
          if (ptStart) loop.push(ptStart);
          break;
        }
      }

      if (loop.length >= 3) {
        loops.push(loop);
      }
    }

    return loops.length > 0 ? loops : polygons;
  }

  public buildPath(polygons: [number, number][][]): string {
    let path = "";
    polygons.forEach((poly) => {
      if (poly.length === 0) return;
      let ringPath = "";
      poly.forEach((coord, idx) => {
        if (coord[0] !== undefined && coord[1] !== undefined) {
          if (idx === 0) {
            ringPath += `M ${coord[0].toFixed(1)},${coord[1].toFixed(1)}`;
          } else {
            ringPath += ` L ${coord[0].toFixed(1)},${coord[1].toFixed(1)}`;
          }
        }
      });
      ringPath += " Z";
      path += ringPath + " ";
    });
    return path.trim();
  }
}
""",
    "src/map-systems/test1/engine/border-graph-calculator.ts": """import type { Province } from "@/domain/map/province.schema";

export class BorderGraphCalculator {
  public calculateActiveBorders(
    nationId: string,
    allProvinces: Record<string, Province>,
    staticAdjacencyList: Record<string, string[]>,
  ): string[] {
    const ownedProvinceIds = Object.values(allProvinces)
      .filter((p) => p.ownerNationId === nationId)
      .map((p) => p.id);

    const adjacentNations = new Set<string>();

    ownedProvinceIds.forEach((provId) => {
      const neighbors = staticAdjacencyList[provId] || [];
      neighbors.forEach((neighborId) => {
        const neighborProvince = allProvinces[neighborId];
        if (neighborProvince) {
          if (neighborProvince.ownerNationId !== nationId) {
            adjacentNations.add(neighborProvince.ownerNationId);
          }
        } else {
          adjacentNations.add(neighborId);
        }
      });
    });

    return Array.from(adjacentNations);
  }
}
""",
    "src/map-systems/test1/engine/adjacency-calculator.ts": """import { getBoundingBox } from "./polygon-geometry";

export function areCountriesAdjacent(
  polyA: [number, number][][],
  polyB: [number, number][][],
): boolean {
  const boxA = getBoundingBox(polyA);
  const boxB = getBoundingBox(polyB);
  if (
    boxA.minX - 15 > boxB.maxX ||
    boxB.minX - 15 > boxA.maxX ||
    boxA.minY - 15 > boxB.maxY ||
    boxB.minY - 15 > boxA.maxY
  ) {
    return false;
  }
  const threshold = 15;
  for (const pA of polyA) {
    for (let i = 0; i < pA.length; i += 3) {
      const ptA = pA[i];
      if (!ptA) continue;
      for (const pB of polyB) {
        for (let j = 0; j < pB.length; j += 3) {
          const ptB = pB[j];
          if (!ptB) continue;
          const dist = Math.hypot(ptA[0] - ptB[0], ptA[1] - ptB[1]);
          if (dist < threshold) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

export function checkSeaAccessAndGetCoastalPoints(
  codeA: string,
  polygonsCache: Record<string, [number, number][][]>,
): { hasSeaAccess: boolean; coastalVertices: [number, number][] } {
  const polyA = polygonsCache[codeA];
  if (!polyA) return { hasSeaAccess: false, coastalVertices: [] };
  const coastalVertices: [number, number][] = [];
  const keys = Object.keys(polygonsCache).filter((k) => k !== codeA);

  for (const pA of polyA) {
    for (let i = 0; i < pA.length; i += 5) {
      const ptA = pA[i];
      if (!ptA) continue;
      let minDistanceToAnyOther = Infinity;

      for (const codeB of keys) {
        const polyB = polygonsCache[codeB];
        if (!polyB) continue;
        const boxB = getBoundingBox(polyB);
        if (
          ptA[0] - 30 > boxB.maxX ||
          boxB.minX - 30 > ptA[0] ||
          ptA[1] - 30 > boxB.maxY ||
          boxB.minY - 30 > ptA[1]
        ) {
          continue;
        }
        for (const pB of polyB) {
          for (let j = 0; j < pB.length; j += 10) {
            const ptB = pB[j];
            if (!ptB) continue;
            const dist = Math.hypot(ptA[0] - ptB[0], ptA[1] - ptB[1]);
            if (dist < minDistanceToAnyOther) {
              minDistanceToAnyOther = dist;
            }
          }
        }
      }

      if (minDistanceToAnyOther > 25) {
        coastalVertices.push(ptA);
      }
    }
  }

  return {
    hasSeaAccess: coastalVertices.length > 0,
    coastalVertices,
  };
}

export function computeAdjacencyList(
  polygonsCache: Record<string, [number, number][][]>,
): Record<string, string[]> {
  const adjacency: Record<string, string[]> = {};
  const keys = Object.keys(polygonsCache);
  for (const key of keys) {
    adjacency[`${key}_P1`] = [];
  }
  for (let i = 0; i < keys.length; i++) {
    for (let j = i + 1; j < keys.length; j++) {
      const codeA = keys[i];
      const codeB = keys[j];
      if (codeA && codeB) {
        const polyA = polygonsCache[codeA];
        const polyB = polygonsCache[codeB];
        if (polyA && polyB && areCountriesAdjacent(polyA, polyB)) {
          adjacency[`${codeA}_P1`].push(`${codeB}_P1`);
          adjacency[`${codeB}_P1`].push(`${codeA}_P1`);
        }
      }
    }
  }
  return adjacency;
}
""",
    "src/map-systems/test1/engine/grid-generator.ts": """import type { Province } from "@/domain/map/province.schema";
import { calculateRingArea } from "./polygon-geometry";
import { PolygonDissolver } from "./polygon-dissolver";
import type { GeoJsonData } from "./types";

export type {
  GeoJsonFeature,
  GeoJsonData,
  VectorProvince,
  GeneratedVectorMapPayload,
} from "./types";

export const COUNTRY_POLYGONS_CACHE: Record<string, [number, number][][]> = {};

export class GridGenerator {
  private readonly minPixelArea = 10;
  private dissolver = new PolygonDissolver();

  public generateVectorMap(
    geoJson: GeoJsonData,
    width: number,
    height: number,
  ): {
    provinces: Record<string, Province>;
    vectorProvinces: {
      id: string;
      countryCode: string;
      name: string;
      pathData: string;
    }[];
  } {
    const provinces: Record<string, Province> = {};
    const vectorProvinces: {
      id: string;
      countryCode: string;
      name: string;
      pathData: string;
    }[] = [];

    const validFeatures = geoJson.features.filter((f) => {
      const code =
        f.properties?.adm0_a3 ||
        f.properties?.ISO_A3 ||
        f.properties?.iso_a3 ||
        f.id;
      return code && code !== "-99" && code !== "ATA";
    });

    let provinceIndex = 1;

    validFeatures.forEach((feature) => {
      const rawCode =
        feature.properties?.adm0_a3 ||
        feature.properties?.ISO_A3 ||
        feature.properties?.iso_a3 ||
        "";
      const countryCode = rawCode.toString().toUpperCase();
      const stateName = feature.properties?.name || "Region";

      const rawGdp = feature.properties?.gdp_md || 10000;
      const rawPop = feature.properties?.pop_est || 1000000;

      const geometry = feature.geometry;
      const countryPolygons: [number, number][][] = [];

      const processRing = (ring: number[][]) => {
        const polyPoints: [number, number][] = [];
        ring.forEach((coord) => {
          if (coord[0] !== undefined && coord[1] !== undefined) {
            const x = ((coord[0] + 180) / 360) * width;
            const y = ((90 - coord[1]) / 180) * height;
            polyPoints.push([x, y]);
          }
        });
        if (polyPoints.length > 0) {
          const area = calculateRingArea(polyPoints);
          if (area >= this.minPixelArea) {
            countryPolygons.push(polyPoints);
          }
        }
      };

      if (geometry.type === "Polygon") {
        const rings = geometry.coordinates as number[][][];
        rings.forEach((ring) => processRing(ring));
      } else if (geometry.type === "MultiPolygon") {
        const multiRings = geometry.coordinates as number[][][][];
        multiRings.forEach((polygonCoords) => {
          polygonCoords.forEach((ring) => processRing(ring));
        });
      }

      if (countryPolygons.length > 0) {
        const dissolvedPolygons = this.dissolver.dissolve(countryPolygons);
        const provinceId = `${countryCode}_P${provinceIndex}`;
        provinceIndex++;

        COUNTRY_POLYGONS_CACHE[provinceId] = dissolvedPolygons;

        let minX = Infinity,
          maxX = -Infinity,
          minY = Infinity,
          maxY = -Infinity;
        let sumX = 0,
          sumY = 0,
          vertexCount = 0;

        dissolvedPolygons.forEach((poly) => {
          poly.forEach(([x, y]) => {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
            sumX += x;
            sumY += y;
            vertexCount++;
          });
        });

        const centerX = vertexCount > 0 ? sumX / vertexCount : width / 2;
        const centerY = vertexCount > 0 ? sumY / vertexCount : height / 2;
        const areaWidth = maxX - minX;
        const areaHeight = maxY - minY;
        const boundingBoxArea = Math.max(
          10,
          Math.round(areaWidth * areaHeight),
        );

        provinces[provinceId] = {
          id: provinceId,
          name: `${stateName} - ${countryCode}`,
          ownerNationId: countryCode,
          gdp: rawGdp * 1000000,
          population: rawPop,
          isCapital: provinceId.endsWith("_P1") || provinceId.endsWith("_P2"),
          territorySize: boundingBoxArea,
          x: centerX,
          y: centerY,
          isCoastal: false,
          isOccupied: false,
          neighbors: [],
        };

        const pathData = this.dissolver.buildPath(dissolvedPolygons);
        vectorProvinces.push({
          id: provinceId,
          countryCode: countryCode,
          name: stateName,
          pathData,
        });
      }
    });

    const provinceList = Object.values(provinces);
    for (let i = 0; i < provinceList.length; i++) {
      for (let j = i + 1; j < provinceList.length; j++) {
        const p1 = provinceList[i];
        const p2 = provinceList[j];
        if (p1 && p2) {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 32) {
            p1.neighbors.push(p2.id);
            p2.neighbors.push(p1.id);
          }
        }
      }
    }

    return {
      provinces,
      vectorProvinces,
    };
  }
}
""",
    "src/map-systems/test2/engine/types.ts": """export interface InputFeature {
  type: "Feature";
  id?: string | number;
  properties?: {
    adm0_a3?: string | number;
    ISO_A3?: string | number;
    iso_a3?: string | number;
    name?: string;
    NAME?: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface SubdividedRegion {
  id: string;
  countryCode: string;
  countryName: string;
  polygons: [number, number][][];
  neighbors: string[];
  isCoastal: boolean;
  area: number;
  center: [number, number];
}

export interface GridBox {
  box: [number, number, number, number];
  clippedPolygons: [number, number][][];
  area: number;
}

export interface GeoJsonData {
  type: string;
  features: InputFeature[];
}
""",
    "src/map-systems/test2/engine/geometry-utils.ts": """export function calculatePolygonArea(polygon: [number, number][]): number {
  let area = 0;
  for (let i = 0; i < polygon.length; i++) {
    const j = (i + 1) % polygon.length;
    const p1 = polygon[i];
    const p2 = polygon[j];
    if (p1 && p2) {
      area += p1[0] * p2[1] - p2[0] * p1[1];
    }
  }
  return Math.abs(area) / 2;
}

export function getBoundingBox(
  polygons: [number, number][][],
): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poly of polygons) {
    for (const pt of poly) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] > maxY) maxY = pt[1];
    }
  }
  return [minX, minY, maxX, maxY];
}

export function getDistance(
  p1: [number, number],
  p2: [number, number],
): number {
  return Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
}

export function getPointToSegmentDistance(
  p: [number, number],
  s1: [number, number],
  s2: [number, number],
): number {
  const dx = s2[0] - s1[0];
  const dy = s2[1] - s1[1];
  if (dx === 0 && dy === 0) {
    return Math.hypot(p[0] - s1[0], p[1] - s1[1]);
  }
  const t = ((p[0] - s1[0]) * dx + (p[1] - s1[1]) * dy) / (dx * dx + dy * dy);
  const clampedT = Math.max(0, Math.min(1, t));
  const projX = s1[0] + clampedT * dx;
  const projY = s1[1] + clampedT * dy;
  return Math.hypot(p[0] - projX, p[1] - projY);
}
""",
    "src/map-systems/test2/engine/sutherland-hodgman.ts": """export function clipPolygonToBox(
  polygon: [number, number][],
  box: [number, number, number, number],
): [number, number][] {
  const [xmin, ymin, xmax, ymax] = box;
  let outputList = polygon;

  outputList = clipEdge(
    outputList,
    (p) => p[0] >= xmin,
    (p1, p2) => {
      const t = (xmin - p1[0]) / (p2[0] - p1[0]);
      return [xmin, p1[1] + t * (p2[1] - p1[1])];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[0] <= xmax,
    (p1, p2) => {
      const t = (xmax - p1[0]) / (p2[0] - p1[0]);
      return [xmax, p1[1] + t * (p2[1] - p1[1])];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[1] >= ymin,
    (p1, p2) => {
      const t = (ymin - p1[1]) / (p2[1] - p1[1]);
      return [p1[0] + t * (p2[0] - p1[0]), ymin];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[1] <= ymax,
    (p1, p2) => {
      const t = (ymax - p1[1]) / (p2[1] - p1[1]);
      return [p1[0] + t * (p2[0] - p1[0]), ymax];
    },
  );

  return outputList;
}

function clipEdge(
  polygon: [number, number][],
  isInside: (p: [number, number]) => boolean,
  getIntersection: (
    p1: [number, number],
    p2: [number, number],
  ) => [number, number],
): [number, number][] {
  if (polygon.length === 0) return [];
  const result: [number, number][] = [];
  let s = polygon[polygon.length - 1];
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i];
    if (isInside(p)) {
      if (isInside(s)) {
        result.push(p);
      } else {
        result.push(getIntersection(s, p));
        result.push(p);
      }
    } else if (isInside(s)) {
      result.push(getIntersection(s, p));
    }
    s = p;
  }
  return result;
}
""",
    "src/map-systems/test2/engine/coastal-classifier.ts": """import { getPointToSegmentDistance } from "./geometry-utils";

export const LANDLOCKED_COUNTRIES = new Set([
  "MNG", "KAZ", "UZB", "TKM", "TJK", "KGZ", "AFG", "NPL", "BTN", "LAO", "ARM", "AZE",
  "CHE", "AUT", "HUN", "SVK", "CZE", "BLR", "BOL", "PRY", "ETH", "SSD", "TCD", "NER",
  "MLI", "RWA", "BDI", "UGA", "MWI", "ZMB", "ZWE", "BWA", "LSO", "SWZ", "AND", "LUX", "MDA"
]);

export interface CountryCoastalEdge {
  p1: [number, number];
  p2: [number, number];
}

export function classifyCoastalRegion(
  mid: [number, number],
  countryCode: string,
  originalCoastalEdges: CountryCoastalEdge[],
): boolean {
  if (LANDLOCKED_COUNTRIES.has(countryCode)) {
    return false;
  }

  let matchesCoast = false;
  for (const cEdge of originalCoastalEdges) {
    if (getPointToSegmentDistance(mid, cEdge.p1, cEdge.p2) < 0.005) {
      matchesCoast = true;
      break;
    }
  }

  if (matchesCoast) {
    const isCaspianEdge =
      mid[0] >= 45.0 && mid[0] <= 56.0 && mid[1] >= 35.5 && mid[1] <= 48.0;

    return !isCaspianEdge;
  }

  return false;
}
""",
    "src/map-systems/test2/engine/world-divider.ts": """import {
  getBoundingBox,
  calculatePolygonArea,
  getDistance,
} from "./geometry-utils";
import { clipPolygonToBox } from "./sutherland-hodgman";
import { InputFeature, SubdividedRegion, GridBox } from "./types";
import {
  classifyCoastalRegion,
  CountryCoastalEdge,
} from "./coastal-classifier";

export function subdivideWorld(
  features: InputFeature[],
  targetRegionsTotal = 3000,
): SubdividedRegion[] {
  const validFeatures = features.filter((f) => {
    const code =
      f.properties?.adm0_a3 ||
      f.properties?.ISO_A3 ||
      f.properties?.iso_a3 ||
      f.id;
    return code && code !== "-99" && code !== "ATA";
  });

  const countriesData = validFeatures.map((f) => {
    const code = (
      f.properties?.adm0_a3 ||
      f.properties?.ISO_A3 ||
      f.properties?.iso_a3 ||
      f.id ||
      ""
    )
      .toString()
      .toUpperCase();
    const name = f.properties?.name || f.properties?.NAME || "Region";
    const polygons: [number, number][][] = [];

    const geom = f.geometry;
    if (geom.type === "Polygon") {
      const coords = geom.coordinates as number[][][];
      coords.forEach((ring) => {
        const polyPoints: [number, number][] = ring.map((pt) => [pt[0], pt[1]]);
        polygons.push(polyPoints);
      });
    } else if (geom.type === "MultiPolygon") {
      const multiCoords = geom.coordinates as number[][][][];
      multiCoords.forEach((poly) => {
        poly.forEach((ring) => {
          const polyPoints: [number, number][] = ring.map((pt) => [
            pt[0],
            pt[1],
          ]);
          polygons.push(polyPoints);
        });
      });
    }

    let countryArea = 0;
    polygons.forEach((p) => {
      countryArea += calculatePolygonArea(p);
    });

    const originalEdges: {
      p1: [number, number];
      p2: [number, number];
      mid: [number, number];
    }[] = [];
    polygons.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        if (p1 && p2) {
          originalEdges.push({
            p1,
            p2,
            mid: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2],
          });
        }
      }
    });

    return {
      code,
      name,
      polygons,
      area: countryArea,
      originalEdges,
      originalCoastalEdges: [] as CountryCoastalEdge[],
    };
  });

  countriesData.forEach((c1) => {
    c1.originalEdges.forEach((e1) => {
      let isLandBorder = false;
      for (const c2 of countriesData) {
        if (c1.code !== c2.code) {
          for (const e2 of c2.originalEdges) {
            if (getDistance(e1.mid, e2.mid) < 0.05) {
              isLandBorder = true;
              break;
            }
          }
        }
        if (isLandBorder) break;
      }
      if (!isLandBorder) {
        c1.originalCoastalEdges.push({ p1: e1.p1, p2: e1.p2 });
      }
    });
  });

  const targetWeights = countriesData.map((c) => {
    const weight = Math.pow(c.area, 0.45);
    return { code: c.code, weight };
  });

  const totalWeight = targetWeights.reduce((sum, w) => sum + w.weight, 0);

  const regionAllocations: Record<string, number> = {};
  countriesData.forEach((c, idx) => {
    const w = targetWeights[idx]?.weight || 0;
    const count = Math.max(
      3,
      Math.round(targetRegionsTotal * (w / totalWeight)),
    );
    regionAllocations[c.code] = count;
  });

  const allRegions: SubdividedRegion[] = [];

  countriesData.forEach((country) => {
    const targetN = regionAllocations[country.code] || 3;
    if (country.polygons.length === 0) return;

    const fullBbox = getBoundingBox(country.polygons);
    const activeBoxes: GridBox[] = [
      { box: fullBbox, clippedPolygons: country.polygons, area: country.area },
    ];

    while (activeBoxes.length < targetN) {
      let bestIdx = -1;
      let maxArea = -1;
      for (let i = 0; i < activeBoxes.length; i++) {
        const item = activeBoxes[i];
        if (item && item.area > maxArea) {
          maxArea = item.area;
          bestIdx = i;
        }
      }

      if (bestIdx === -1) break;

      const targetBox = activeBoxes[bestIdx];
      if (!targetBox) break;
      activeBoxes.splice(bestIdx, 1);

      const [xmin, ymin, xmax, ymax] = targetBox.box;
      const w = xmax - xmin;
      const h = ymax - ymin;

      let box1: [number, number, number, number];
      let box2: [number, number, number, number];

      if (w > h) {
        const xmid = (xmin + xmax) / 2;
        box1 = [xmin, ymin, xmid, ymax];
        box2 = [xmid, ymin, xmax, ymax];
      } else {
        const ymid = (ymin + ymax) / 2;
        box1 = [xmin, ymin, xmax, ymid];
        box2 = [xmin, ymid, xmax, ymax];
      }

      const polys1: [number, number][][] = [];
      let area1 = 0;
      const polys2: [number, number][][] = [];
      let area2 = 0;

      for (const poly of targetBox.clippedPolygons) {
        const clip1 = clipPolygonToBox(poly, box1);
        if (clip1.length >= 3) {
          const a1 = calculatePolygonArea(clip1);
          if (a1 > 1e-6) {
            polys1.push(clip1);
            area1 += a1;
          }
        }

        const clip2 = clipPolygonToBox(poly, box2);
        if (clip2.length >= 3) {
          const a2 = calculatePolygonArea(clip2);
          if (a2 > 1e-6) {
            polys2.push(clip2);
            area2 += a2;
          }
        }
      }

      if (polys1.length > 0) {
        activeBoxes.push({ box: box1, clippedPolygons: polys1, area: area1 });
      }
      if (polys2.length > 0) {
        activeBoxes.push({ box: box2, clippedPolygons: polys2, area: area2 });
      }
    }

    activeBoxes.forEach((gBox, idx) => {
      let sumX = 0;
      let sumY = 0;
      let totalPts = 0;
      gBox.clippedPolygons.forEach((poly) => {
        poly.forEach((pt) => {
          sumX += pt[0];
          sumY += pt[1];
          totalPts++;
        });
      });

      const centerX =
        totalPts > 0 ? sumX / totalPts : (gBox.box[0] + gBox.box[2]) / 2;
      const centerY =
        totalPts > 0 ? sumY / totalPts : (gBox.box[1] + gBox.box[3]) / 2;

      allRegions.push({
        id: `${country.code}_R${idx + 1}`,
        countryCode: country.code,
        countryName: country.name,
        polygons: gBox.clippedPolygons,
        neighbors: [],
        isCoastal: false,
        area: gBox.area,
        center: [centerX, centerY],
      });
    });
  });

  const edgeMap = new Map<string, string[]>();

  allRegions.forEach((region) => {
    region.polygons.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        if (!p1 || !p2) continue;

        const x1 = Math.round(p1[0] * 10000);
        const y1 = Math.round(p1[1] * 10000);
        const x2 = Math.round(p2[0] * 10000);
        const y2 = Math.round(p2[1] * 10000);

        const key1 = `${x1},${y1}`;
        const key2 = `${x2},${y2}`;
        const edgeKey = key1 < key2 ? `${key1}#${key2}` : `${key2}#${key1}`;

        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, []);
        }
        const list = edgeMap.get(edgeKey)!;
        if (!list.includes(region.id)) {
          list.push(region.id);
        }
      }
    });
  });

  edgeMap.forEach((regions, edgeKey) => {
    if (regions.length > 1) {
      for (let i = 0; i < regions.length; i++) {
        for (let j = i + 1; j < regions.length; j++) {
          const r1 = regions[i];
          const r2 = regions[j];
          const reg1 = allRegions.find((r) => r.id === r1);
          const reg2 = allRegions.find((r) => r.id === r2);
          if (reg1 && reg2) {
            if (!reg1.neighbors.includes(reg2.id)) reg1.neighbors.push(reg2.id);
            if (!reg2.neighbors.includes(reg1.id)) reg2.neighbors.push(reg1.id);
          }
        }
      }
    } else {
      const regId = regions[0];
      const reg = allRegions.find((r) => r.id === regId);
      if (reg) {
        const parts = edgeKey.split("#");
        if (parts[0] && parts[1]) {
          const c1 = parts[0].split(",");
          const c2 = parts[1].split(",");
          const p1: [number, number] = [
            Number(c1[0]) / 10000,
            Number(c1[1]) / 10000,
          ];
          const p2: [number, number] = [
            Number(c2[0]) / 10000,
            Number(c2[1]) / 10000,
          ];
          const mid: [number, number] = [
            (p1[0] + p2[0]) / 2,
            (p1[1] + p2[1]) / 2,
          ];

          const country = countriesData.find((c) => c.code === reg.countryCode);
          if (country) {
            const matchesCoast = classifyCoastalRegion(
              mid,
              reg.countryCode,
              country.originalCoastalEdges,
            );
            if (matchesCoast) {
              reg.isCoastal = true;
            }
          }
        }
      }
    }
  });

  return allRegions;
}
""",
    "src/map-systems/test2/components/world-map-svg.tsx": """import React, { useMemo } from "react";
import { SubdividedRegion } from "../engine/types";

interface WorldMapSvgProps {
  regions: SubdividedRegion[];
  hoveredRegionId: string | null;
  onHoverRegion: (region: SubdividedRegion | null) => void;
  mapWidth: number;
  mapHeight: number;
}

export function WorldMapSvg({
  regions,
  hoveredRegionId,
  onHoverRegion,
  mapWidth,
  mapHeight,
}: WorldMapSvgProps) {
  const getCountryColor = (code: string): string => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 150) + 40;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 150) + 40;
    const b = (Math.abs(hash & 0x0000ff) % 150) + 40;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderPaths = useMemo(() => {
    return regions.map((region) => {
      const color = getCountryColor(region.countryCode);
      const isHovered = hoveredRegionId === region.id;

      let dPath = "";
      region.polygons.forEach((poly) => {
        let ringPath = "";
        poly.forEach((pt, idx) => {
          const x = ((pt[0] + 180) / 360) * mapWidth;
          const y = ((90 - pt[1]) / 180) * mapHeight;
          if (idx === 0) {
            ringPath += `M ${x.toFixed(1)},${y.toFixed(1)}`;
          } else {
            ringPath += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
          }
        });
        if (ringPath) ringPath += " Z";
        dPath += ringPath + " ";
      });

      return (
        <path
          key={region.id}
          d={dPath.trim()}
          fill={isHovered ? "rgb(16, 185, 129)" : color}
          stroke={isHovered ? "#ffffff" : "rgba(0,0,0,0.25)"}
          strokeWidth={isHovered ? "1.5" : "0.5"}
          className="transition-all duration-100 cursor-pointer"
          onMouseEnter={() => onHoverRegion(region)}
          onMouseLeave={() => onHoverRegion(null)}
        />
      );
    });
  }, [regions, hoveredRegionId, mapWidth, mapHeight, onHoverRegion]);

  return (
    <svg
      viewBox={`0 0 ${mapWidth} ${mapHeight}`}
      className="w-full h-full max-h-[85vh]"
    >
      <rect width={mapWidth} height={mapHeight} fill="rgb(10, 15, 30)" />
      {renderPaths}
    </svg>
  );
}
""",
    "src/map-systems/test2/components/region-tooltip.tsx": """import React from "react";
import { SubdividedRegion } from "../engine/types";

interface RegionTooltipProps {
  region: SubdividedRegion;
}

export function RegionTooltip({ region }: RegionTooltipProps) {
  return (
    <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
      <div className="text-slate-400">Sector ID</div>
      <div className="text-sm font-bold text-white">{region.id}</div>
      <hr className="border-slate-800" />
      <div>
        <span className="text-slate-500">Country:</span> {region.countryName} (
        {region.countryCode})
      </div>
      <div>
        <span className="text-slate-500">Direct Ocean Access:</span>{" "}
        <span
          className={region.isCoastal ? "text-emerald-400" : "text-rose-500"}
        >
          {region.isCoastal ? "YES" : "NO"}
        </span>
      </div>
      <div>
        <span className="text-slate-500">Neighbors:</span>{" "}
        <div className="max-h-24 overflow-y-auto mt-1 flex flex-wrap gap-1">
          {region.neighbors.length === 0 ? (
            <span className="text-slate-600 italic">None</span>
          ) : (
            region.neighbors.map((n) => (
              <span
                key={n}
                className="px-1.5 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px]"
              >
                {n}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
""",
    "src/map-systems/test2/components/test-page-header.tsx": """import React from "react";

interface TestPageHeaderProps {
  regionCount: number;
}

export function TestPageHeader({ regionCount }: TestPageHeaderProps) {
  return (
    <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center z-10">
      <div>
        <h1 className="text-sm font-bold uppercase tracking-wider">
          Precision Global Grid Subdivision Engine
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Continuous bisection grid logic with perfect border snapping.
        </p>
      </div>
      <div className="text-right">
        <span className="text-xs font-mono bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
          {regionCount} Active Regions Generated
        </span>
      </div>
    </div>
  );
}
""",
    "src/map-systems/test2/page.tsx": """'use client';

import React, { useEffect, useState, useRef } from "react";
import { SubdividedRegion } from "./engine/types";
import { MapControls } from "../test1/components/map-controls";
import { TestPageHeader } from "./components/test-page-header";
import { RegionTooltip } from "./components/region-tooltip";
import { WorldMapSvg } from "./components/world-map-svg";

export default function WorldDividerTestPage() {
  const [regions, setRegions] = useState<SubdividedRegion[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<SubdividedRegion | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [baking, setBaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const mapWidth = 1200;
  const mapHeight = 600;

  useEffect(() => {
    async function initLifecycle() {
      try {
        const check = await fetch("/world-map-subdivided.json");
        if (check.ok) {
          const cached = await check.json();
          setRegions(cached);
        } else {
          setBaking(true);
          const bakeRes = await fetch("/api/bake-map?type=full");
          const bakeJson = await bakeRes.json();
          if (bakeJson.success) {
            const getBaked = await fetch("/world-map-subdivided.json");
            const data = await getBaked.json();
            setRegions(data);
          } else {
            throw new Error();
          }
        }
      } catch {
        setError("Failed to load or bake world map data");
      } finally {
        setLoading(false);
        setBaking(false);
      }
    }
    initLifecycle();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev * zoomFactor, 20));
    } else {
      setScale((prev) => Math.max(prev / zoomFactor, 0.8));
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 20));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.8));
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans text-left">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            {baking
              ? "Pre-Processing & Baking Global 3D Vector Assets..."
              : "Loading Baked Geopolitical Grid..."}
          </p>
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50">
          {error}
        </div>
      )}

      <TestPageHeader regionCount={regions.length} />

      <div
        className="flex-1 relative bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="w-full h-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <WorldMapSvg
            regions={regions}
            hoveredRegionId={hoveredRegion?.id || null}
            onHoverRegion={setHoveredRegion}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
          />
        </div>

        <MapControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={resetView}
        />

        {hoveredRegion && <RegionTooltip region={hoveredRegion} />}
      </div>
    </div>
  );
}
""",
    "src/map-systems/test3/page.tsx": """'use client';

import React, { useEffect, useState, useRef } from "react";
import { SubdividedRegion } from "../test2/engine/types";
import { MapControls } from "../test1/components/map-controls";
import { TestPageHeader } from "../test2/components/test-page-header";
import { RegionTooltip } from "../test2/components/region-tooltip";
import { WorldMapSvg } from "../test2/components/world-map-svg";

export default function WorldDividerSimplifiedTestPage() {
  const [regions, setRegions] = useState<SubdividedRegion[]>([]);
  const [hoveredRegion, setHoveredRegion] = useState<SubdividedRegion | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [baking, setBaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const mapWidth = 1200;
  const mapHeight = 600;

  useEffect(() => {
    async function initLifecycle() {
      try {
        setBaking(true);
        const bakeRes = await fetch("/api/bake-map?type=simplified");
        const bakeJson = await bakeRes.json();
        if (bakeJson.success) {
          const getBaked = await fetch(
            "/world-map-simplified.json?t=" + Date.now(),
          );
          const data = await getBaked.json();
          setRegions(data);
        } else {
          throw new Error();
        }
      } catch {
        setError("Failed to load or bake simplified map data");
      } finally {
        setLoading(false);
        setBaking(false);
      }
    }
    initLifecycle();
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(prev * zoomFactor, 20));
    } else {
      setScale((prev) => Math.max(prev / zoomFactor, 0.8));
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.5, 20));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 0.8));
  };

  const resetView = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans text-left">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            {baking
              ? "Pre-Processing & Baking Simplified 120-Country World Assets..."
              : "Loading Baked Geopolitical Grid..."}
          </p>
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50">
          {error}
        </div>
      )}

      <TestPageHeader regionCount={regions.length} />

      <div
        className="flex-1 relative bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="w-full h-full origin-center transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          }}
        >
          <WorldMapSvg
            regions={regions}
            hoveredRegionId={hoveredRegion?.id || null}
            onHoverRegion={setHoveredRegion}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
          />
        </div>

        <MapControls
          scale={scale}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetView={resetView}
        />

        {hoveredRegion && <RegionTooltip region={hoveredRegion} />}
      </div>
    </div>
  );
}
""",
    "src/map-systems/test3/engine/world-consolidator.ts": """import { InputFeature } from "../../test2/engine/types";
import { calculatePolygonArea } from "../../test2/engine/geometry-utils";
import { PolygonDissolver } from "../../test1/engine/polygon-dissolver";
import { DELETED_COUNTRIES } from "./deleted-countries";
import { MINOR_MERGE_MAP } from "./minor-merge-map";

export function consolidateWorldMap(features: InputFeature[]): InputFeature[] {
  const countryPolygons = new Map<string, [number, number][][]>();
  const countryNames = new Map<string, string>();

  features.forEach((f) => {
    const rawCode =
      f.properties?.adm0_a3 ||
      f.properties?.ISO_A3 ||
      f.properties?.iso_a3 ||
      f.id ||
      "";
    const code = rawCode.toString().toUpperCase();
    if (code === "-99" || code === "ATA") return;

    const name = f.properties?.name || f.properties?.NAME || code;

    const rawPolygons: [number, number][][] = [];
    const geom = f.geometry;
    if (geom.type === "Polygon") {
      const coords = geom.coordinates as number[][][];
      coords.forEach((ring) => {
        rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
      });
    } else if (geom.type === "MultiPolygon") {
      const multi = geom.coordinates as number[][][][];
      multi.forEach((poly) => {
        poly.forEach((ring) => {
          rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
        });
      });
    }

    const minAreaLimit = code === "CAN" || code === "RUS" ? 12.0 : 0.005;
    const filteredPolygons: [number, number][][] = [];

    rawPolygons.forEach((poly) => {
      const area = calculatePolygonArea(poly);
      if (area >= minAreaLimit) {
        filteredPolygons.push(poly);
      }
    });

    if (filteredPolygons.length === 0) return;

    let targetCode = code;
    if (DELETED_COUNTRIES.has(code)) {
      const mappedTarget = MINOR_MERGE_MAP[code];
      if (mappedTarget) {
        targetCode = mappedTarget;
      } else {
        return;
      }
    }

    if (!countryPolygons.has(targetCode)) {
      countryPolygons.set(targetCode, []);
      countryNames.set(targetCode, name);
    }

    countryPolygons.get(targetCode)!.push(...filteredPolygons);
  });

  const dissolver = new PolygonDissolver();
  const resultFeatures: InputFeature[] = [];

  countryPolygons.forEach((polys, code) => {
    if (polys.length === 0) return;
    const name = countryNames.get(code) || code;
    const dissolved = dissolver.dissolve(polys);

    resultFeatures.push({
      type: "Feature",
      properties: {
        adm0_a3: code,
        ISO_A3: code,
        iso_a3: code,
        name,
        NAME: name,
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: dissolved.map((poly) => [poly]),
      },
    });
  });

  return resultFeatures;
}
""",
    "src/map-systems/test3/engine/famous-countries.ts": """export const FAMOUS_COUNTRIES = new Set([
  "USA", "CAN", "MEX", "BRA", "ARG", "COL", "VEN", "CHL", "PER", "GBR", "FRA", "DEU",
  "ITA", "ESP", "UKR", "POL", "SWE", "NOR", "FIN", "RUS", "CHN", "IND", "JPN", "KOR",
  "IDN", "AUS", "TUR", "IRN", "IRQ", "SAU", "EGY", "ZAF", "NGA", "KEN", "ETH", "PAK",
  "KAZ", "THA", "VNM", "PHL", "NZL", "ARE", "ISR", "JOR", "SYR", "YEM", "OMN", "KWT",
  "QAT", "LBN", "AFG", "AZE", "ARM", "GEO", "GRC", "ROU", "AUT", "CHE", "NLD", "BEL",
  "SDN", "AGO", "COD", "CIV", "GHA", "SEN", "TZA", "MAR", "DZA", "MYS"
]);
""",
    "src/map-systems/test3/engine/deleted-countries.ts": """export const DELETED_COUNTRIES = new Set([
  "LSO", "SWZ", "AND", "MCO", "SMR", "VAT", "LIE", "LUX", "MLT", "CYP", "SGP", "BRN",
  "BHR", "MDV", "SYC", "MUS", "COM", "STP", "CPV", "BRB", "DMA", "GRD", "LCA", "VCT",
  "ATG", "KNA", "BHS", "FJI", "SLB", "VUT", "WSM", "TON", "TUV", "KIR", "MHL", "FSM",
  "PLW", "NRU", "TLS", "DJI", "GMB", "GNB", "GNQ", "KOS", "PSE", "ESH", "BTN", "MNE",
  "PRT", "MDA"
]);
""",
    "src/map-systems/test3/engine/minor-merge-map.ts": """export const MINOR_MERGE_MAP: Record<string, string> = {
  TUN: "EGY", LBY: "EGY", MRT: "SEN", MLI: "SEN", NER: "NGA", TCD: "SDN", SSD: "SDN",
  CAF: "COD", CMR: "NGA", COG: "COD", GAB: "COD", GNQ: "COD", UGA: "KEN", RWA: "KEN",
  BDI: "TZA", SOM: "ETH", DJI: "ETH", ERI: "ETH", MOZ: "ZAF", MWI: "TZA", ZMB: "AGO",
  ZWE: "ZAF", BWA: "ZAF", NAM: "ZAF", LSO: "ZAF", SWZ: "ZAF", MDG: "ZAF", SLE: "SEN",
  LBR: "CIV", GIN: "SEN", GNB: "SEN", GMB: "SEN", ESH: "EGY", PRT: "ESP", AND: "ESP",
  IRL: "GBR", LUX: "DEU", CZE: "POL", SVK: "POL", HUN: "ROU", SVN: "ITA", HRV: "ITA",
  BIH: "GRC", SRB: "ROU", MNE: "GRC", ALB: "GRC", MKD: "GRC", BGR: "ROU", EST: "FIN",
  LVA: "POL", LTU: "POL", BLR: "RUS", MDA: "UKR", DNK: "DEU", BOL: "ARG", PRY: "ARG",
  URY: "ARG", ECU: "COL", GUY: "VEN", SUR: "VEN", PAN: "MEX", CRI: "MEX", NIC: "MEX",
  HND: "MEX", SLV: "MEX", GTM: "MEX", BLZ: "MEX", MNG: "CHN", PRK: "KOR", NPL: "IND",
  BTN: "IND", BGD: "IND", LKA: "IND", MMR: "CHN", LAO: "VNM", KHM: "THA", TLS: "IDN",
  SGP: "IDN", TJK: "KAZ", KGZ: "KAZ", UZB: "KAZ", TKM: "IRN", CYP: "GRC", TWN: "CHN",
  BFA: "GHA", BEN: "NGA", TGO: "GHA", PNG: "IDN", PSE: "ISR", KOS: "GRC", XKX: "GRC"
};
"""
}

DELETIONS = [
    "src/app/raw-map-test",
    "src/presentation/components/map",
    "src/engine/map",
    "src/engine/world-divider",
    "src/app/world-divider-test",
    "src/app/world-divider-simplified-test",
    "src/app/map-test"
]

def main():
    for target_path, content in FILES_TO_WRITE.items():
        target_dir = os.path.dirname(target_path)
        os.makedirs(target_dir, exist_ok=True)
        with open(target_path, "w", encoding="utf-8") as f:
            f.write(content)

    for path in DELETIONS:
        if os.path.exists(path):
            if os.path.isdir(path):
                shutil.rmtree(path, ignore_errors=True)
            else:
                os.remove(path)

if __name__ == "__main__":
    main()
