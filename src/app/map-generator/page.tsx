"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Database,
  Search,
  ArrowLeft,
  Download,
  Upload,
  Globe,
} from "lucide-react";
import Link from "next/link";
import { PARTITION_COUNTRIES_LIST } from "@/application/map-rendering/partition-config";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  areaSqKm: number;
}

export default function MapGeneratorPage() {
  const [status, setStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [partitionStatus, setPartitionStatus] = useState<
    "idle" | "compiling" | "success" | "error"
  >("idle");
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCached, setIsCached] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [mapType, setMapType] = useState<"default" | "edited" | "partition">(
    "default",
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        let apiPath = "/api/map-generator";
        if (mapType === "edited") {
          apiPath = "/api/map-generator?type=edited";
        } else if (mapType === "partition") {
          apiPath = "/api/map-generator?type=edited&source=partition";
          const res = await fetch("/api/map-generator");
          const json = await res.json();
          if (active && json.success) {
            try {
              const resPart = await fetch("/partition-mask/mappings.json");
              const jsonPart = await resPart.json();
              if (active) {
                setCountries(jsonPart.countries || []);
                setIsCached(true);
              }
              return;
            } catch {
              if (active) {
                setCountries([]);
                setIsCached(false);
              }
              return;
            }
          }
        }
        const res = await fetch(apiPath);
        const json = await res.json();
        if (active && json.success) {
          setCountries(json.data.countries || []);
          setIsCached(!!json.cached);
        } else if (
          active &&
          !json.success &&
          (mapType === "edited" || mapType === "partition")
        ) {
          setCountries([]);
          setIsCached(false);
        }
      } catch {
        if (active) {
          setErrorMessage("Failed to check active map status");
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [mapType]);

  const handleGenerate = async () => {
    setStatus("generating");
    setErrorMessage("");
    try {
      const res = await fetch("/api/map-generator?rebuild=true", {
        method: "GET",
        headers: { pragma: "no-cache", "cache-control": "no-cache" },
      });
      const json = await res.json();
      if (json.success) {
        setCountries(json.data.countries || []);
        setIsCached(false);
        setStatus("success");
        setMapType("default");
      } else {
        setStatus("error");
        setErrorMessage(json.error || "Generation process failed");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network communication error during 4K build");
    }
  };

  const handlePartitionCompile = async () => {
    setPartitionStatus("compiling");
    setErrorMessage("");
    try {
      const targetSource = mapType === "edited" ? "edited" : "default";
      const res = await fetch(
        `/api/map-generator/partition?source=${targetSource}`,
        {
          method: "POST",
        },
      );
      const json = await res.json();
      if (json.success) {
        setCountries(json.data.countries || []);
        setMapType("partition");
        setPartitionStatus("success");
      } else {
        setPartitionStatus("error");
        setErrorMessage(json.error || "Symmetric partition process failed");
      }
    } catch {
      setPartitionStatus("error");
      setErrorMessage(
        "Network communication error during dynamic partition compiler",
      );
    }
  };

  const handleExportFlatMap = () => {
    const img = new Image();
    let srcPath = "/test6/world-mask.png";
    if (mapType === "edited") {
      srcPath = "/edited-mask/world-mask.png";
    } else if (mapType === "partition") {
      srcPath = "/partition-mask/world-mask.png";
    }
    img.src = srcPath;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 4096;
      canvas.height = 2048;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, 4096, 2048);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const b = data[i + 2];
        if (b !== undefined && b >= 11) {
          data[i] = 150 + ((b * 7) % 105);
          data[i + 1] = 100 + ((b * 13) % 120);
          data[i + 2] = b;
        } else if (b !== undefined) {
          data[i] = 20;
          data[i + 1] = 30;
          data[i + 2] = b;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      const link = document.createElement("a");
      link.download = "world-flat-edit.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    };
  };

  const handleImportFlatMap = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        canvas.width = 4096;
        canvas.height = 2048;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsImporting(false);
          return;
        }
        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, 4096, 2048);
        const data = imgData.data;
        const raw = new Uint8Array(4096 * 2048);
        for (let i = 0; i < raw.length; i++) {
          raw[i] = data[i * 4 + 2] || 0;
        }
        try {
          const res = await fetch("/api/map-generator/import-raw", {
            method: "POST",
            headers: {
              "Content-Type": "application/octet-stream",
            },
            body: raw,
          });
          const json = await res.json();
          if (json.success) {
            setMapType("edited");
            window.location.reload();
          } else {
            alert(json.error || "Import failed");
          }
        } catch {
          alert("Network error during import");
        } finally {
          setIsImporting(false);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalArea = countries.reduce((acc, c) => acc + c.areaSqKm, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans text-left flex flex-col">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-slate-900 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                Tactical Map Compiler
              </h1>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Precision Rasterizer & Area Weighting Deck
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setMapType("default")}
                className={`px-3 py-1 rounded-md transition-colors ${mapType === "default" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                DEFAULT
              </button>
              <button
                onClick={() => setMapType("edited")}
                className={`px-3 py-1 rounded-md transition-colors ${mapType === "edited" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                EDITED
              </button>
              <button
                onClick={() => setMapType("partition")}
                className={`px-3 py-1 rounded-md transition-colors ${mapType === "partition" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
              >
                OPTIMIZED
              </button>
            </div>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
              <Database
                size={12}
                className={isCached ? "text-emerald-400" : "text-amber-500"}
              />
              {isCached ? "CACHED MASK" : "UNCOMPILED"}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
                Compilation Unit
              </span>
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Compile 4K Mask & Areas
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed pt-1.5">
                Parses Natural Earth GIS data, projects polygons using
                equirectangular formulas, applies distance transform sea depths,
                and computes cosine row-weighted square kilometers.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <button
                onClick={handleGenerate}
                disabled={status === "generating"}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-emerald-500/20 shadow-lg shadow-emerald-950/20 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw
                  size={14}
                  className={status === "generating" ? "animate-spin" : ""}
                />
                {status === "generating"
                  ? "Compiling Raster..."
                  : "Rebuild 4K Topology"}
              </button>
            </div>

            {status === "success" && (
              <div className="p-4 bg-emerald-950/15 border border-emerald-900/40 rounded-2xl flex gap-3 text-emerald-400 text-xs">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Compilation Complete</div>
                  <div className="text-[10px] text-emerald-500/90 mt-1">
                    Map mask successfully written to disk and static country
                    areas recalculated.
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono">
                Symmetric Border Partition
              </span>
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Compile Partition & Remove Countries
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed pt-1.5">
                Eliminates specified minor countries and cleanly and
                symmetrically divides their territory among land neighbors
                proportionally.
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs font-mono">
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-900 space-y-2">
                <div className="text-[10px] text-slate-500 uppercase font-bold">
                  Involved Deletions:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {PARTITION_COUNTRIES_LIST.map((code) => (
                    <span
                      key={code}
                      className="px-2 py-0.5 bg-rose-950/30 border border-rose-900/20 rounded-md text-rose-400 text-[10px]"
                    >
                      {code}
                    </span>
                  ))}
                </div>
              </div>
              <button
                onClick={handlePartitionCompile}
                disabled={partitionStatus === "compiling"}
                className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-rose-500/20 shadow-lg shadow-rose-950/20 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
              >
                <Globe
                  size={14}
                  className={
                    partitionStatus === "compiling" ? "animate-spin" : ""
                  }
                />
                {partitionStatus === "compiling"
                  ? "Partitioning Map..."
                  : `Partition Active Map (${mapType === "edited" ? "Edited" : "Default"})`}
              </button>
            </div>

            {partitionStatus === "success" && (
              <div className="p-4 bg-emerald-950/15 border border-emerald-900/40 rounded-2xl flex gap-3 text-emerald-400 text-xs">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Partition Complete</div>
                  <div className="text-[10px] text-emerald-500/90 mt-1">
                    Deleted territories integrated into neighbors. Loaded
                    optimized view.
                  </div>
                </div>
              </div>
            )}

            {partitionStatus === "error" && (
              <div className="p-4 bg-rose-950/15 border border-rose-900/40 rounded-2xl flex gap-3 text-rose-400 text-xs">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Process Error</div>
                  <div className="text-[10px] text-rose-500/90 mt-1">
                    {errorMessage}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest font-mono">
                Manual Map Editor
              </span>
              <h2 className="text-base font-bold text-slate-100 tracking-tight">
                Export & Re-import 4K Flat Canvas
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed pt-1.5">
                Download a pixel-perfect, flat, warm-colored map image, perform
                edits in Photoshop or GIMP (add/remove islands, close seas), and
                import it back seamlessly.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleExportFlatMap}
                className="w-full py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-slate-200 rounded-2xl font-bold transition-all text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} />
                Export Flat Map
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isImporting}
                className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-amber-500/20 shadow-lg shadow-amber-950/20 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload
                  size={14}
                  className={isImporting ? "animate-pulse" : ""}
                />
                {isImporting ? "Importing..." : "Import Edited Map"}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png"
                onChange={handleImportFlatMap}
                className="hidden"
              />
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
              Topology Insights
            </h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900">
                <span className="text-[10px] text-slate-500 block">
                  Sovereign States
                </span>
                <span className="text-base font-bold text-slate-200 block mt-1">
                  {countries.length > 0 ? countries.length - 1 : 0}
                </span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900">
                <span className="text-[10px] text-slate-500 block">
                  Surface Area
                </span>
                <span className="text-base font-bold text-slate-200 block mt-1">
                  {totalArea > 0 ? `${(totalArea / 1e6).toFixed(1)}M km²` : "0"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col bg-slate-900/20 border border-slate-900 rounded-3xl overflow-hidden min-h-[500px]">
          <div className="p-5 border-b border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/30">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Sovereign Territory Database
              </h3>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                Real-time Cosine Weighted Projections
              </p>
            </div>
            <div className="relative max-w-xs w-full">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
                size={14}
              />
              <input
                type="text"
                placeholder="Search code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-900 pl-10 pr-4 py-2 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[550px] p-4 divide-y divide-slate-900/60 scrollbar-thin scrollbar-thumb-slate-900 scrollbar-track-transparent">
            {filteredCountries.length === 0 ? (
              <div className="py-20 text-center text-slate-600 text-xs italic">
                No matching territories detected in topology.
              </div>
            ) : (
              filteredCountries.map((c) => (
                <div
                  key={c.id}
                  className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full flex items-center justify-center">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">
                        {c.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ISO_A3: {c.code}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="text-slate-300 font-semibold">
                      {c.id === 0
                        ? "Infinite"
                        : `${new Intl.NumberFormat("en-US").format(c.areaSqKm)} km²`}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      INDEX ID: {c.id}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
