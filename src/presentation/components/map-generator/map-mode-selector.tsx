import React from "react";

interface MapModeSelectorProps {
  mapType: "default" | "edited" | "partition";
  onMapTypeChange: (type: "default" | "edited" | "partition") => void;
}

export function MapModeSelector({
  mapType,
  onMapTypeChange,
}: MapModeSelectorProps) {
  return (
    <div className="flex bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs font-mono">
      <button
        onClick={() => onMapTypeChange("default")}
        className={`px-3 py-1 rounded-md transition-colors ${
          mapType === "default"
            ? "bg-emerald-600 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        DEFAULT
      </button>
      <button
        onClick={() => onMapTypeChange("edited")}
        className={`px-3 py-1 rounded-md transition-colors ${
          mapType === "edited"
            ? "bg-emerald-600 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        EDITED
      </button>
      <button
        onClick={() => onMapTypeChange("partition")}
        className={`px-3 py-1 rounded-md transition-colors ${
          mapType === "partition"
            ? "bg-emerald-600 text-white"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        OPTIMIZED
      </button>
    </div>
  );
}
