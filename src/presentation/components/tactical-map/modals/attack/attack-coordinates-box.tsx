import React from "react";
import { MapPin } from "lucide-react";
import { AttackTransitTypeBadge } from "./attack-transit-type-badge";

interface AttackCoordinatesBoxProps {
  coordinate: { x: number; y: number };
  isLandAttack?: boolean;
}

export function AttackCoordinatesBox({
  coordinate,
  isLandAttack = true,
}: AttackCoordinatesBoxProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
      <div className="flex items-center gap-2 bg-background/50 border border-border p-3 rounded-xl">
        <MapPin size={14} className="text-military shrink-0" />
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground block font-sans">
            مختصات نقطه‌کوبی تئاتر:
          </span>
          <span className="font-bold text-foreground dir-ltr font-mono block">
            X: {coordinate.x} | Y: {coordinate.y}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background/50 border border-border p-2 rounded-xl">
        <AttackTransitTypeBadge isLandAttack={isLandAttack} />
      </div>
    </div>
  );
}
