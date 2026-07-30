import React from "react";
import { Info } from "lucide-react";
import { QuickActionButton } from "./quick-action-button";

export type ContextActionType = "profile";

interface MapContextMenuProps {
  position: { x: number; y: number };
  countryName: string;
  countryCode?: string;
  onSelectAction: (action: ContextActionType) => void;
  onClose?: () => void;
}

export function MapContextMenu({
  position,
  countryName,
  onSelectAction,
}: MapContextMenuProps) {
  return (
    <div
      className="absolute z-50 -translate-x-1/2 -translate-y-full mb-3 pointer-events-auto animate-fade-smooth dir-rtl"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-2 flex items-center gap-1.5 w-max whitespace-nowrap">
        <div className="px-2.5 py-1 text-[10px] font-mono font-bold text-muted-foreground border-l border-border/60 shrink-0 whitespace-nowrap">
          {countryName}
        </div>

        <QuickActionButton
          icon={Info}
          label="نمایش اطلاعات"
          colorClass="text-primary"
          bgHoverClass="hover:bg-primary/15"
          onClick={() => onSelectAction("profile")}
        />
      </div>

      <div className="w-2.5 h-2.5 bg-card/95 border-r border-b border-border/80 rotate-45 mx-auto -mt-1.5 shadow-sm" />
    </div>
  );
}
