import React from "react";
import { RefreshCw, CheckCircle2 } from "lucide-react";

interface CompilationCardProps {
  status: "idle" | "generating" | "success" | "error";
  onGenerate: () => void;
}

export function CompilationCard({ status, onGenerate }: CompilationCardProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-5">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">
          Compilation Unit
        </span>
        <h2 className="text-base font-bold text-slate-100 tracking-tight">
          Compile 4K Mask & Areas
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed pt-1.5">
          Parses Natural Earth GIS data, projects polygons using equirectangular
          formulas, applies distance transform sea depths, and computes cosine
          row-weighted square kilometers.
        </p>
      </div>

      <div className="space-y-3.5 pt-2">
        <button
          onClick={onGenerate}
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
              Map mask successfully written to disk and static country areas
              recalculated.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
