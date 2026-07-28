import React from "react";
import { MapPin, Globe2 } from "lucide-react";

interface AttackCoordinatesBoxProps {
  coordinate: { x: number; y: number };
}

export function AttackCoordinatesBox({
  coordinate,
}: AttackCoordinatesBoxProps) {
  return (
    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
      <div className="flex items-center gap-2 bg-background/50 border border-border p-3 rounded-xl">
        <MapPin size={14} className="text-military shrink-0" />
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground block font-sans">
            مختصات نقطه‌کوبی:
          </span>
          <span className="font-bold text-foreground dir-ltr font-mono block">
            X: {coordinate.x} | Y: {coordinate.y}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-background/50 border border-border p-3 rounded-xl">
        <Globe2 size={14} className="text-primary shrink-0" />
        <div className="space-y-0.5">
          <span className="text-[9px] text-muted-foreground block font-sans">
            محدوده نبرد:
          </span>
          <span className="font-bold text-foreground font-sans block text-[11px]">
            تئاتر ایزوله منطقه
          </span>
        </div>
      </div>
    </div>
  );
}
