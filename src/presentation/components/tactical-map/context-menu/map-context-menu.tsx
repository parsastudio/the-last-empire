import React from "react";
import { Swords, Coins, Handshake, Shield, Flame, X } from "lucide-react";
import { QuickActionButton } from "./quick-action-button";

export type ContextActionType =
  | "attack"
  | "tribute"
  | "pact"
  | "access"
  | "proxy"
  | "profile";

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
  countryCode,
  onSelectAction,
  onClose,
}: MapContextMenuProps) {
  return (
    <div
      className="absolute z-50 -translate-x-1/2 -translate-y-full mb-3 pointer-events-auto animate-fade-smooth dir-rtl"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl p-2 flex items-center gap-1 max-w-md overflow-x-auto scrollbar-none">
        <div className="px-2 py-1 text-[10px] font-mono font-bold text-muted-foreground border-l border-border/60 shrink-0">
          {countryName} ({countryCode})
        </div>

        <QuickActionButton
          icon={Swords}
          label="حمله"
          colorClass="text-military"
          bgHoverClass="hover:bg-military/15"
          onClick={() => onSelectAction("attack")}
        />

        <QuickActionButton
          icon={Coins}
          label="طلب باج"
          colorClass="text-treasury"
          bgHoverClass="hover:bg-treasury/15"
          onClick={() => onSelectAction("tribute")}
        />

        <QuickActionButton
          icon={Handshake}
          label="پیمان"
          colorClass="text-gdp"
          bgHoverClass="hover:bg-gdp/15"
          onClick={() => onSelectAction("pact")}
        />

        <QuickActionButton
          icon={Shield}
          label="حق عبور"
          colorClass="text-primary"
          bgHoverClass="hover:bg-primary/15"
          onClick={() => onSelectAction("access")}
        />

        <QuickActionButton
          icon={Flame}
          label="جنگ نیابتی"
          colorClass="text-military"
          bgHoverClass="hover:bg-military/15"
          onClick={() => onSelectAction("proxy")}
        />

        <button
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer mr-1 shrink-0"
        >
          <X size={13} />
        </button>
      </div>

      <div className="w-2.5 h-2.5 bg-card/95 border-r border-b border-border/80 rotate-45 mx-auto -mt-1.5 shadow-sm" />
    </div>
  );
}
