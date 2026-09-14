import React from "react";
import { useTranslations } from "next-intl";
import { Layers, Eye, Coins } from "lucide-react";

export type TacticalLayer = "political" | "gdp";

export interface LayerOption {
  id: TacticalLayer;
  labelKey: "political" | "gdp";
  icon: React.ComponentType<{ size: number; className?: string }>;
  color: string;
}

export const LAYER_OPTIONS: LayerOption[] = [
  {
    id: "political",
    labelKey: "political",
    icon: Eye,
    color: "text-gdp",
  },
  {
    id: "gdp",
    labelKey: "gdp",
    icon: Coins,
    color: "text-treasury",
  },
];

interface LayerControllerProps {
  activeLayer: TacticalLayer;
  onChangeLayer: (layer: TacticalLayer) => void;
}

export function LayerController({
  activeLayer,
  onChangeLayer,
}: LayerControllerProps) {
  const t = useTranslations("map.layers");

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        insetInlineEnd:
          "max(0.75rem, max(env(safe-area-inset-left), env(safe-area-inset-right)))",
        bottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
      className="fixed z-40 flex flex-col gap-2 pointer-events-auto"
    >
      <div className="bg-card/85 backdrop-blur-xl border border-border/80 rounded-xl md:rounded-2xl p-1 md:p-1.5 shadow-2xl flex items-center gap-1 md:gap-1.5">
        <div className="p-1.5 md:p-2 text-muted-foreground border-e border-border/60 flex items-center gap-1.5">
          <Layers size={13} />
          <span className="text-[9px] md:text-[10px] font-extrabold font-sans hidden sm:inline">
            {t("layersLabel")}
          </span>
        </div>

        {LAYER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = activeLayer === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChangeLayer(opt.id)}
              className={`flex items-center gap-1 md:gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-secondary text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              <Icon
                size={12}
                className={isActive ? opt.color : "text-muted-foreground"}
              />
              <span className="font-sans text-[10px] md:text-[11px]">
                {t(opt.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
