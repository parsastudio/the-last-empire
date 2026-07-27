import React from "react";
import { Cpu } from "lucide-react";

export interface PartitionMetrics {
  readTimeMs: number;
  partitionTimeMs: number;
  areaRecalcTimeMs: number;
  writeTimeMs: number;
  totalTimeMs: number;
}

interface PartitionMetricsPanelProps {
  metrics: PartitionMetrics;
}

export function PartitionMetricsPanel({ metrics }: PartitionMetricsPanelProps) {
  return (
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
          <span className="text-emerald-400">{metrics.totalTimeMs} ms</span>
        </div>
      </div>
    </div>
  );
}
