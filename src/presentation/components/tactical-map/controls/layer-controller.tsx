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
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed bottom-6 left-6 z-40 flex flex-col gap-2 pointer-events-auto"
    >
      <div className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1 dir-rtl">
        <div className="p-2 text-muted-foreground border-l border-border/60 flex items-center gap-1.5">
          <Layers size={14} />
          <span className="text-[10px] font-extrabold font-sans hidden sm:inline">
            لایه‌ها:
          </span>
        </div>

        {LAYER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeLayer === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChangeLayer(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-secondary text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Icon
                size={13}
                className={isActive ? opt.color : "text-muted-foreground"}
              />
              <span className="font-sans text-[11px]">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
