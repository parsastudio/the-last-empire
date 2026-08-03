import React from "react";
import { ShieldAlert, MapPin } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface WebGLHoverHudProps {
  hoverPos: { x: number; y: number } | null;
  hoverData: unknown | null;
}

export function WebGLHoverHud({ hoverPos, hoverData }: WebGLHoverHudProps) {
  if (!hoverPos || !hoverData) return null;

  const data = hoverData as {
    nationId: number;
    enclaveId: number;
    isFrontier: boolean;
    coastalAccess: number;
  };

  const getCoastalLabel = (access: number) => {
    if (access === 1) return "ساحل آب آزاد";
    if (access === 2) return "دریاچه بسته";
    return "درون خشکی";
  };

  return (
    <div
      className="fixed z-50 pointer-events-none w-64 bg-card/90 backdrop-blur-xl border border-border p-3 rounded-2xl shadow-2xl space-y-2 text-right dir-rtl animate-fade-smooth font-sans"
      style={{
        left: `${hoverPos.x + 15}px`,
        top: `${hoverPos.y + 15}px`,
      }}
    >
      <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground">
            شناسنامه پیکسل WebGL
          </span>
        </div>
        <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-lg border border-border/60">
          کد #{PersianNumberFormatter.toPersianDigits(data.nationId)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans">
            اقلیم برون‌مرزی
          </span>
          <span className="font-bold text-foreground block">
            {data.enclaveId === 0
              ? "خاک اصلی"
              : `منطقه ${PersianNumberFormatter.toPersianDigits(data.enclaveId)}`}
          </span>
        </div>

        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans">
            وضعیت ساحلی
          </span>
          <span className="font-bold text-treasury block">
            {getCoastalLabel(data.coastalAccess)}
          </span>
        </div>
      </div>

      {data.isFrontier && (
        <div className="flex items-center gap-1.5 text-[10px] text-military bg-military/15 border border-military/30 p-2 rounded-xl font-bold animate-pulse">
          <ShieldAlert size={13} />
          <span>خط نبرد درگیری مستقیم فعال (Frontier Bit = 1)</span>
        </div>
      )}
    </div>
  );
}
