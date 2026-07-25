"use client";

import React, { useEffect, useState, useMemo } from "react";

interface CountryPhase1 {
  code: string;
  name: string;
  rings: [number, number][][];
}

interface IslandPhase2 {
  id: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number][];
  area: number;
  center: [number, number];
}

interface ApiResponse {
  success: boolean;
  phase1: CountryPhase1[];
  phase2: IslandPhase2[];
  error?: string;
}

export default function MapTest4Page() {
  const [phase, setPhase] = useState<1 | 2>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [hoveredIsland, setHoveredIsland] = useState<string | null>(null);

  const mapWidth = 1200;
  const mapHeight = 600;

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/map-test4");
        const json = (await res.json()) as ApiResponse;
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || "Failed to process map data.");
        }
      } catch {
        setError("Error fetching map data from local server API.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getCountryColor = (code: string): string => {
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (Math.abs((hash & 0xff0000) >> 16) % 120) + 40;
    const g = (Math.abs((hash & 0x00ff00) >> 8) % 120) + 40;
    const b = (Math.abs(hash & 0x0000ff) % 120) + 40;
    return `rgb(${r}, ${g}, ${b})`;
  };

  const renderPhase1 = useMemo(() => {
    if (!data?.phase1) return null;

    return data.phase1.map((country) => {
      const color = getCountryColor(country.code);
      const isHovered = hoveredCountry === country.code;

      let dPath = "";
      country.rings.forEach((ring) => {
        let ringPath = "";
        ring.forEach((pt, idx) => {
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
          key={country.code}
          d={dPath.trim()}
          fill={isHovered ? "rgb(16, 185, 129)" : color}
          stroke={isHovered ? "#ffffff" : "rgba(0,0,0,0.3)"}
          strokeWidth={isHovered ? "1.5" : "0.5"}
          className="transition-all duration-100 cursor-pointer"
          onMouseEnter={() => setHoveredCountry(country.code)}
          onMouseLeave={() => setHoveredCountry(null)}
        />
      );
    });
  }, [data, hoveredCountry]);

  const renderPhase2 = useMemo(() => {
    if (!data?.phase2) return null;

    return data.phase2.map((island) => {
      const color = getCountryColor(island.countryCode);
      const isHovered = hoveredIsland === island.id;

      let dPath = "";
      let ringPath = "";
      island.coordinates.forEach((pt, idx) => {
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

      return (
        <path
          key={island.id}
          d={dPath.trim()}
          fill={isHovered ? "rgb(244, 63, 94)" : color}
          stroke={isHovered ? "#ffffff" : "rgba(0,0,0,0.2)"}
          strokeWidth={isHovered ? "1.2" : "0.4"}
          className="transition-all duration-75 cursor-pointer"
          onMouseEnter={() => setHoveredIsland(island.id)}
          onMouseLeave={() => setHoveredIsland(null)}
        />
      );
    });
  }, [data, hoveredIsland]);

  const activeHoveredCountryName = useMemo(() => {
    if (!hoveredCountry || !data?.phase1) return null;
    const found = data.phase1.find((c) => c.code === hoveredCountry);
    return found ? `${found.name} (${found.code})` : hoveredCountry;
  }, [hoveredCountry, data]);

  const activeHoveredIslandDetails = useMemo(() => {
    if (!hoveredIsland || !data?.phase2) return null;
    const found = data.phase2.find((i) => i.id === hoveredIsland);
    return found ? found : null;
  }, [hoveredIsland, data]);

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans text-left">
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider">
            Advanced Geopolitical Atlas Engine - Stage 4
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Phase 1: Full countries. Phase 2: Isolated contiguous islands with
            precise coordinate area evaluation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhase(1)}
            className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all ${
              phase === 1
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
            }`}
          >
            Phase 1: Complete Countries
          </button>
          <button
            onClick={() => setPhase(2)}
            className={`px-4 py-2 rounded-lg text-xs font-mono border transition-all ${
              phase === 2
                ? "bg-rose-600 border-rose-500 text-white"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800"
            }`}
          >
            Phase 2: Island Area Calculations
          </button>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Processing Local Map Assets...
          </p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-xl mx-auto space-y-4">
          <div className="p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl">
            <h2 className="text-sm font-bold mb-2">Required Asset Missing</h2>
            <p className="text-xs">{error}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 space-y-2 text-left">
            <p className="font-bold text-white">
              How to install the offline map asset:
            </p>
            <ol className="list-decimal pl-4 space-y-1">
              <li>
                Download the natural earth vector dataset from the following
                link:
              </li>
              <li className="text-blue-400 break-all select-all font-mono py-1">
                https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
              </li>
              <li>
                Rename or save it as{" "}
                <code className="text-emerald-400 font-mono">
                  ne_110m_admin_0_countries.geojson
                </code>
              </li>
              <li>
                Place it inside the{" "}
                <code className="text-emerald-400 font-mono">public/</code>{" "}
                directory of this project.
              </li>
              <li>Refresh this page.</li>
            </ol>
          </div>
        </div>
      )}

      {!loading && !error && data && (
        <div className="flex-1 relative bg-slate-950 overflow-hidden flex items-center justify-center">
          <div className="w-full h-full max-h-[85vh] flex items-center justify-center">
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="w-full h-full"
            >
              <rect
                width={mapWidth}
                height={mapHeight}
                fill="rgb(10, 15, 30)"
              />
              {phase === 1 ? renderPhase1 : renderPhase2}
            </svg>
          </div>

          {phase === 1 && activeHoveredCountryName && (
            <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs backdrop-blur-sm">
              <div className="text-slate-400">Selected Country</div>
              <div className="text-sm font-bold text-white mt-1">
                {activeHoveredCountryName}
              </div>
            </div>
          )}

          {phase === 2 && activeHoveredIslandDetails && (
            <div className="absolute bottom-6 left-6 p-4 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl z-40 max-w-sm pointer-events-none font-mono text-xs space-y-1.5 backdrop-blur-sm">
              <div className="text-slate-400">Isolated Geopolitical Sector</div>
              <div className="text-sm font-bold text-white">
                {activeHoveredIslandDetails.id}
              </div>
              <hr className="border-slate-800" />
              <div>
                <span className="text-slate-500">Country:</span>{" "}
                {activeHoveredIslandDetails.countryName} (
                {activeHoveredIslandDetails.countryCode})
              </div>
              <div>
                <span className="text-slate-500">Calculated Area:</span>{" "}
                {activeHoveredIslandDetails.area.toFixed(6)} sq. deg
              </div>
              <div>
                <span className="text-slate-500">Projected Center:</span>{" "}
                {activeHoveredIslandDetails.center[0].toFixed(2)},{" "}
                {activeHoveredIslandDetails.center[1].toFixed(2)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
