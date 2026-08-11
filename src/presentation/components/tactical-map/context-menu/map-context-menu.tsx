import React from "react";
import { Info, Swords, LucideIcon } from "lucide-react";

export type ContextActionType = "profile" | "attack";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  colorClass: string;
  bgHoverClass: string;
  onClick: () => void;
}

function QuickActionButton({
  icon: Icon,
  label,
  colorClass,
  bgHoverClass,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 ${bgHoverClass} ${colorClass} rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0`}
      title={label}
    >
      <Icon size={13} />
      <span>{label}</span>
    </button>
  );
}

interface MapContextMenuProps {
  position: { x: number; y: number };
  countryName: string;
  onClose?: () => void;
  onSelectAction: (action: ContextActionType) => void;
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
          label="اطلاعات"
          colorClass="text-primary"
          bgHoverClass="hover:bg-primary/15"
          onClick={() => onSelectAction("profile")}
        />

        <QuickActionButton
          icon={Swords}
          label="حمله سریع"
          colorClass="text-military"
          bgHoverClass="hover:bg-military/15"
          onClick={() => onSelectAction("attack")}
        />
      </div>

      <div className="w-2.5 h-2.5 bg-card/95 border-r border-b border-border/80 rotate-45 mx-auto -mt-1.5 shadow-sm" />
    </div>
  );
}
