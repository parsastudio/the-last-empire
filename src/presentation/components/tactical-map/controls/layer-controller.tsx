import React from "react";
import { Layers } from "lucide-react";
import { LAYER_OPTIONS } from "./layer-options.config";

export type TacticalLayer = "political" | "gdp" | "military";

interface LayerControllerProps {
  activeLayer: TacticalLayer;
  onChangeLayer: (layer: TacticalLayer) => void;
}

export function LayerController({
  activeLayer,
  onChangeLayer,
}: LayerControllerProps) {
  return (
    <div className="absolute top-6 right-6 z-40 flex flex-col gap-3">
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-900 rounded-3xl p-2.5 shadow-2xl flex flex-col gap-1.5">
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-slate-900 mb-1">
          <Layers size={13} className="text-slate-500" />
          <span className="text-[10px] font-extrabold text-slate-400 tracking-wider font-sans uppercase">
            لایه‌های اطلاعات تاکتیکی
          </span>
        </div>
        {LAYER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeLayer === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChangeLayer(opt.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-[11px] font-bold transition-all text-right dir-rtl cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white border border-slate-800 shadow-inner"
                  : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent"
              }`}
            >
              <Icon
                size={14}
                className={isActive ? opt.color : "text-slate-500"}
              />
              <span className="font-sans">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
