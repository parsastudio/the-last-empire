import React from "react";
import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";

interface MapGeneratorHeaderProps {
  isCached: boolean;
  mapType: "default" | "edited" | "partition";
  onMapTypeChange: (type: "default" | "edited" | "partition") => void;
}

export function MapGeneratorHeader({
  isCached,
  mapType,
  onMapTypeChange,
}: MapGeneratorHeaderProps) {
  return (
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
              onClick={() => onMapTypeChange("default")}
              className={`px-3 py-1 rounded-md transition-colors ${mapType === "default" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              DEFAULT
            </button>
            <button
              onClick={() => onMapTypeChange("edited")}
              className={`px-3 py-1 rounded-md transition-colors ${mapType === "edited" ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-slate-200"}`}
            >
              EDITED
            </button>
            <button
              onClick={() => onMapTypeChange("partition")}
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
  );
}
