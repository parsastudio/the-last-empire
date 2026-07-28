import React, { useState } from "react";
import { UserMinus } from "lucide-react";

export function DisbandUnitCard() {
  const [disbandCount, setDisbandAmount] = useState<number>(5);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <UserMinus size={13} className="text-military" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          انحلال یگان و بازیابی نیروی انسانی
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 text-right">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">تعداد پیاده‌نظام:</span>
          <span className="font-mono font-bold text-foreground">
            {disbandCount} یگان
          </span>
        </div>

        <input
          type="range"
          min="1"
          max="50"
          value={disbandCount}
          onChange={(e) => setDisbandAmount(Number(e.target.value))}
          className="w-full accent-rose-600 cursor-pointer h-2 bg-secondary rounded-lg"
        />

        <button
          onClick={() =>
            alert(
              `${disbandCount} یگان پیاده‌نظام منحل شد و ۴۰٪ نیروی انسانی به مخازن ملی بازگشت.`,
            )
          }
          className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          انحلال و بازیابی نیرو
        </button>
      </div>
    </div>
  );
}
