import React from "react";
import { X } from "lucide-react";

export type ContextActionType = "attack" | "profile";

interface MapContextMenuProps {
  position: { x: number; y: number };
  countryName: string;
  countryCode: string;
  onSelectAction: (action: ContextActionType) => void;
  onClose: () => void;
}

export function MapContextMenu({
  position,
  countryName,
  onSelectAction,
  onClose,
}: MapContextMenuProps) {
  return (
    <div
      className="absolute z-50 -translate-x-1/2 -translate-y-full mb-3 pointer-events-auto animate-fade-smooth"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      dir="rtl"
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-1.5 flex items-center gap-1">
        <button
          onClick={() => onSelectAction("attack")}
          className="px-3.5 py-2 hover:bg-rose-500/15 text-rose-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer group"
          title={`طرح حمله به ${countryName}`}
        >
          <span className="text-sm group-hover:scale-110 transition-transform">
            ⚔️
          </span>
          <span className="text-[11px] font-bold">حمله</span>
        </button>

        <div className="w-[1px] h-5 bg-border/60" />

        <button
          onClick={() => onSelectAction("profile")}
          className="px-3.5 py-2 hover:bg-sky-500/15 text-sky-500 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer group"
          title={`مشاهده نمایه ${countryName}`}
        >
          <span className="text-sm group-hover:scale-110 transition-transform">
            📊
          </span>
          <span className="text-[11px] font-bold">نمایه</span>
        </button>

        <button
          onClick={onClose}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors mr-1 cursor-pointer"
        >
          <X size={12} />
        </button>
      </div>

      <div className="w-2.5 h-2.5 bg-card/95 border-r border-b border-border/80 rotate-45 mx-auto -mt-1.5 shadow-sm" />
    </div>
  );
}
