"use client";

import React, { useState, useEffect } from "react";
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Database, 
  Search, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  areaSqKm: number;
}

export default function MapGeneratorPage() {
  const [status, setStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCached, setIsCached] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/map-generator");
        const json = await res.json();
        if (active && json.success) {
          setCountries(json.data.countries || []);
          setIsCached(!!json.cached);
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
  }, []);

  const handleGenerate = async () => {
    setStatus("generating");
    setErrorMessage("");
    try {
      const res = await fetch("/api/map-generator", { method: "GET", headers: { "pragma": "no-cache", "cache-control": "no-cache" } });
      const json = await res.json();
      if (json.success) {
        setCountries(json.data.countries || []);
        setIsCached(false);
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(json.error || "Generation process failed");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Network communication error during 4K build");
    }
  };

  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
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
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono">
              <Database size={12} className={isCached ? "text-emerald-400" : "text-amber-500"} />
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
                Parses Natural Earth GIS data, projects polygons using equirectangular formulas, applies distance transform sea depths, and computes cosine row-weighted square kilometers.
              </p>
            </div>

            <div className="space-y-3.5 pt-2">
              <button
                onClick={handleGenerate}
                disabled={status === "generating"}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-emerald-500/20 shadow-lg shadow-emerald-950/20 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} className={status === "generating" ? "animate-spin" : ""} />
                {status === "generating" ? "Compiling Raster..." : "Rebuild 4K Topology"}
              </button>
            </div>

            {status === "success" && (
              <div className="p-4 bg-emerald-950/15 border border-emerald-900/40 rounded-2xl flex gap-3 text-emerald-400 text-xs">
                <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Compilation Complete</div>
                  <div className="text-[10px] text-emerald-500/90 mt-1">
                    Map mask successfully written to disk and static country areas recalculated.
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="p-4 bg-rose-950/15 border border-rose-900/40 rounded-2xl flex gap-3 text-rose-400 text-xs">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Rasterization Error</div>
                  <div className="text-[10px] text-rose-500/90 mt-1">{errorMessage}</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider">
              Topology Insights
            </h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900">
                <span className="text-[10px] text-slate-500 block">Sovereign States</span>
                <span className="text-base font-bold text-slate-200 block mt-1">
                  {countries.length > 0 ? countries.length - 1 : 0}
                </span>
              </div>
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-900">
                <span className="text-[10px] text-slate-500 block">Surface Area</span>
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
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
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
                <div key={c.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <span className="w-1.5 h-1.5 bg-emerald-500/30 rounded-full flex items-center justify-center">
                      <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-200">{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">ISO_A3: {c.code}</div>
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="text-slate-300 font-semibold">
                      {c.id === 0 ? "Infinite" : `${new Intl.NumberFormat("en-US").format(c.areaSqKm)} km²`}
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
