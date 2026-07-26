import React from "react";
import { Globe, CheckCircle2, AlertTriangle, Cpu } from "lucide-react";
import { PARTITION_COUNTRIES_LIST } from "@/application/map-rendering/partition-config";

interface PartitionMetrics {
  readTimeMs: number;
  partitionTimeMs: number;
  areaRecalcTimeMs: number;
  writeTimeMs: number;
  totalTimeMs: number;
}

interface PartitionCardProps {
  partitionStatus: "idle" | "compiling" | "success" | "error";
  errorMessage: string;
  metrics: PartitionMetrics | null;
  onPartitionCompile: (source: "default" | "edited") => void;
}

export function PartitionCard({
  partitionStatus,
  errorMessage,
  metrics,
  onPartitionCompile,
}: PartitionCardProps) {
  return (
    <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-3xl space-y-5">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest font-mono">
          Symmetric Border Partition
        </span>
        <h2 className="text-base font-bold text-slate-100 tracking-tight">
          Compile Partition & Remove Countries
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed pt-1.5">
          Eliminates specified minor countries and cleanly and symmetrically
          divides their territory among land neighbors proportionally.
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
        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => onPartitionCompile("default")}
            disabled={partitionStatus === "compiling"}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-rose-500/20 shadow-lg shadow-rose-950/20 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe
              size={14}
              className={partitionStatus === "compiling" ? "animate-spin" : ""}
            />
            {partitionStatus === "compiling"
              ? "Compiling..."
              : "Partition Default Map"}
          </button>
          <button
            onClick={() => onPartitionCompile("edited")}
            disabled={partitionStatus === "compiling"}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-amber-500/20 shadow-lg shadow-amber-950/20 text-xs uppercase tracking-wider font-mono flex items-center justify-center gap-2 cursor-pointer"
          >
            <Globe
              size={14}
              className={partitionStatus === "compiling" ? "animate-spin" : ""}
            />
            {partitionStatus === "compiling"
              ? "Compiling..."
              : "Partition Edited Map"}
          </button>
        </div>
      </div>

      {partitionStatus === "success" && (
        <div className="space-y-4">
          <div className="p-4 bg-emerald-950/15 border border-emerald-900/40 rounded-2xl flex gap-3 text-emerald-400 text-xs">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Partition Complete</div>
              <div className="text-[10px] text-emerald-500/90 mt-1">
                Deleted territories integrated into neighbors. Loaded optimized
                view.
              </div>
            </div>
          </div>

          {metrics && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-900 font-mono text-[10px] space-y-2">
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold border-b border-slate-900 pb-2">
                <Cpu size={12} className="text-emerald-400" />
                <span>8.3M PIXELS BENCHMARKS</span>
              </div>
              <div className="space-y-1.5 text-slate-400">
                <div className="flex justify-between">
                  <span>I/O Disk Read & PNG Decode</span>
                  <span className="text-slate-200 font-bold">
                    {metrics.readTimeMs} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Symmetric BFS Conquest</span>
                  <span className="text-emerald-400 font-bold">
                    {metrics.partitionTimeMs} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cosine Area Calibration</span>
                  <span className="text-slate-200 font-bold">
                    {metrics.areaRecalcTimeMs} ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>4K PNG Encode & Disk I/O Write</span>
                  <span className="text-slate-200 font-bold">
                    {metrics.writeTimeMs} ms
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-2 text-[11px] font-bold text-white">
                  <span>Total Compile Cycle</span>
                  <span className="text-emerald-400">
                    {metrics.totalTimeMs} ms
                  </span>
                </div>
              </div>
            </div>
          )}
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
  );
}
