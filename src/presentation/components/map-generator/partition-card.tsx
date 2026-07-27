import React from "react";
import { Globe, CheckCircle2, AlertTriangle } from "lucide-react";
import { PARTITION_COUNTRIES_LIST } from "@/application/map-rendering/partition-config";
import {
  PartitionMetricsPanel,
  PartitionMetrics,
} from "./partition-metrics-panel";
import { InvolvedDeletionsList } from "./involved-deletions-list";

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
        <InvolvedDeletionsList deletions={PARTITION_COUNTRIES_LIST} />
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

          {metrics && <PartitionMetricsPanel metrics={metrics} />}
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
