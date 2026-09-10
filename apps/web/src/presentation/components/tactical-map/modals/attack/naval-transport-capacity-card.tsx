import React from "react";
import { Ship, Anchor, AlertTriangle, ShieldCheck } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { NavalDeploymentClamper } from "@geopolitics/game-engine";

interface NavalTransportCapacityCardProps {
  navalFleetCount: number;
  infantryDeployed: number;
  armorDeployed: number;
}

export function NavalTransportCapacityCard({
  navalFleetCount,
  infantryDeployed,
  armorDeployed,
}: NavalTransportCapacityCardProps) {
  const maxCapacity = NavalDeploymentClamper.calculateMaxCapacity(
    "NAVAL",
    navalFleetCount,
  );
  const loadRequired = NavalDeploymentClamper.calculateRequiredCapacity(
    infantryDeployed,
    armorDeployed,
  );
  const isOverCapacity = loadRequired > maxCapacity || maxCapacity === 0;
  const utilizationPct =
    maxCapacity > 0
      ? Math.min(100, Math.round((loadRequired / maxCapacity) * 100))
      : 100;

  return (
    <div
      className={`p-4 rounded-3xl border transition-all space-y-3 font-sans dir-rtl text-right ${
        isOverCapacity
          ? "bg-rose-950/30 border-rose-500/50 text-foreground"
          : "bg-cyan-950/20 border-cyan-500/40 text-foreground"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center border ${
              isOverCapacity
                ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
            }`}
          >
            <Ship size={18} />
          </div>
          <div>
            <h4 className="text-xs font-black">
              پایش ظرفیت ترابری ناوگان دریایی
            </h4>
            <span className="text-[10px] text-muted-foreground font-mono">
              تعداد ناوگان فعال:{" "}
              {PersianNumberFormatter.toPersianDigits(navalFleetCount)} فروند
              (سقف حمل: {PersianNumberFormatter.toPersianDigits(maxCapacity)}{" "}
              واحد)
            </span>
          </div>
        </div>

        <span
          className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
            isOverCapacity
              ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
              : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
          }`}
        >
          {isOverCapacity ? (
            <AlertTriangle size={12} />
          ) : (
            <ShieldCheck size={12} />
          )}
          <span>
            {PersianNumberFormatter.toPersianDigits(loadRequired)} /{" "}
            {PersianNumberFormatter.toPersianDigits(maxCapacity)}
          </span>
        </span>
      </div>

      <div className="space-y-1 font-mono">
        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-sans">
          <span>ضریب اشغال عرشه ناوگان:</span>
          <span
            className={
              isOverCapacity
                ? "text-rose-400 font-bold"
                : "text-cyan-300 font-bold"
            }
          >
            {PersianNumberFormatter.toPersianDigits(utilizationPct)}٪
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden border border-border/40">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverCapacity ? "bg-rose-500" : "bg-cyan-500"
            }`}
            style={{
              width: `${Math.min(100, (loadRequired / Math.max(1, maxCapacity)) * 100)}%`,
            }}
          />
        </div>
      </div>

      {isOverCapacity && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-[10px] text-rose-400 flex items-center gap-2">
          <AlertTriangle size={14} className="shrink-0" />
          <span>
            {maxCapacity === 0
              ? "شما هیچ ناوگان دریایی برای اجرای تهاجم دریایی ندارید. ابتدا از پنل نظامی ناوگان بخرید."
              : "نیروهای انتخابی از سقف ترابری ناوگان فراتر رفته است. تعداد پیاده‌نظام یا تانک‌ها را کاهش دهید."}
          </span>
        </div>
      )}
    </div>
  );
}
