"use client";

import React, { useEffect, useState } from "react";
import type { GeoJsonData } from "@/engine/map/grid-generator";

export default function RawMapTestPage() {
  const [geoData, setGeoJsonData] = useState<GeoJsonData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRawFile() {
      try {
        const response = await fetch(
          "/ne_50m_admin_1_states_provinces_lakes.geojson",
        );
        if (!response.ok)
          throw new Error("Map file not found in public folder");
        const json = await response.json();
        setGeoJsonData(json as GeoJsonData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Load failed");
      } finally {
        setLoading(false);
      }
    }
    loadRawFile();
  }, []);

  const paths = React.useMemo(() => {
    if (!geoData) return [];
    const list: {
      id: string;
      pathData: string;
      name: string;
      country: string;
    }[] = [];

    geoData.features.forEach((feature, idx) => {
      const stateName = feature.properties?.name || "Region";
      const countryCode = (
        feature.properties?.adm0_a3 ||
        feature.properties?.ISO_A3 ||
        feature.properties?.iso_a2 ||
        "UNKNOWN"
      )
        .toString()
        .toUpperCase();

      const rings: number[][] = [];
      const geometry = feature.geometry;

      if (geometry.type === "Polygon") {
        const polygonCoords = geometry.coordinates as number[][][];
        polygonCoords.forEach((ring) => {
          rings.push(ring);
        });
      } else if (geometry.type === "MultiPolygon") {
        const multiPolygonCoords = geometry.coordinates as number[][][][];
        multiPolygonCoords.forEach((polygon) => {
          polygon.forEach((ring) => {
            rings.push(ring);
          });
        });
      }

      let pathStr = "";
      rings.forEach((ring) => {
        let ringPath = "";
        ring.forEach((coord, coordIdx) => {
          if (coord[0] !== undefined && coord[1] !== undefined) {
            const x = ((coord[0] + 180) / 360) * 1200;
            const y = ((90 - coord[1]) / 180) * 600;
            if (coordIdx === 0) {
              ringPath += `M ${x.toFixed(1)},${y.toFixed(1)}`;
            } else {
              ringPath += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
            }
          }
        });
        if (ringPath) {
          ringPath += " Z";
          pathStr += ringPath + " ";
        }
      });

      if (pathStr) {
        list.push({
          id: `feature-${idx}`,
          pathData: pathStr.trim(),
          name: stateName,
          country: countryCode,
        });
      }
    });

    return list;
  }, [geoData]);

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-col p-6 overflow-hidden select-none">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
        <div>
          <h1 className="text-lg font-bold text-white uppercase tracking-wider">
            Raw GeoJSON File Integrity Test
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rendering raw, unfiltered vector features from public GeoJSON file
            to verify actual contents.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-emerald-400">
            {paths.length} raw features found
          </span>
        </div>
      </div>

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading raw file directly...</p>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-rose-950/80 border border-rose-800 p-4 rounded-xl text-rose-400 text-sm">
            Error: {error}
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="flex-1 relative border border-slate-800 bg-slate-900/30 rounded-2xl overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 1200 600" className="w-full h-full max-h-[85vh]">
            <rect width="1200" height="600" fill="rgb(10, 15, 30)" />
            {paths.map((p) => (
              <path
                key={p.id}
                d={p.pathData}
                fill="rgba(16, 185, 129, 0.15)"
                stroke="rgba(16, 185, 129, 0.45)"
                strokeWidth="0.5"
                className="hover:fill-emerald-500/40 hover:stroke-emerald-400 transition-colors duration-150 cursor-pointer"
                title={`${p.name} (${p.country})`}
              />
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
