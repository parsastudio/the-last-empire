import React from "react";
import { Navigation, Anchor } from "lucide-react";

interface AttackTransitTypeBadgeProps {
  isLandAttack: boolean;
}

export function AttackTransitTypeBadge({
  isLandAttack,
}: AttackTransitTypeBadgeProps) {
  return (
    <div
      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 font-sans ${
        isLandAttack
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
          : "bg-amber-500/10 border-amber-500/30 text-amber-500"
      }`}
    >
      {isLandAttack ? (
        <>
          <Navigation size={14} className="shrink-0" />
          <span>حمله زمینی مستقیم (مرز مشترک)</span>
        </>
      ) : (
        <>
          <Anchor size={14} className="shrink-0" />
          <span>حمله دریایی / آبی-خاکی</span>
        </>
      )}
    </div>
  );
}
