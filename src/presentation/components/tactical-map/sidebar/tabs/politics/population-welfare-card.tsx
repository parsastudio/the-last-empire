import React, { useMemo } from "react";
import { Users, Building2, HeartPulse, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Nation } from "@/domain/nation/nation.schema";

interface PopulationWelfareCardProps {
  population?: number;
  maxPopulationCapacity?: number;
  gdp?: number;
  stability?: number;
  nation?: Nation;
}

export function PopulationWelfareCard({
  population = 80000000,
  maxPopulationCapacity,
  nation,
}: PopulationWelfareCardProps) {
  const currentPop = nation ? nation.population : population;
  const capacity = nation
    ? nation.maxPopulationCapacity || Math.floor(currentPop / 0.95)
    : maxPopulationCapacity || Math.floor(currentPop / 0.95);

  const capacityPct = Math.round((currentPop / (capacity || 1)) * 100);
  const stability = nation ? nation.government.stability : 80;

  const formattedPop = useMemo(() => {
    if (currentPop >= 1e9) {
      return `${PersianNumberFormatter.toPersianDigits((currentPop / 1e9).toFixed(2))} میلیارد نفر`;
    }
    return `${PersianNumberFormatter.toPersianDigits((currentPop / 1e6).toFixed(1))} میلیون نفر`;
  }, [currentPop]);

  const demographicStatus = useMemo(() => {
    if (stability > 60) {
      return { text: "رشد مثبت طبیعی + جذب مهاجران نخبگان", color: "text-gdp" };
    }
    if (stability >= 40) {
      return {
        text: "تعادل دموگرافیک (رشد ثبات خنثی)",
        color: "text-treasury",
      };
    }
    return {
      text: "کاهش جمعیت + خروج آوارگان و فرار مغزها",
      color: "text-military",
    };
  }, [stability]);

  return (
    <div className="space-y-2.5 text-right dir-rtl">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Users size={13} className="text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            جمعیت ملی و پایش تراکم مسکن
          </span>
        </div>
        <span className="text-xs font-extrabold text-foreground font-mono bg-secondary/80 px-2 py-0.5 rounded-lg border border-border/60">
          {formattedPop}
        </span>
      </div>

      <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3.5">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground font-sans">
            وضعیت جریان جمعیت کشوری:
          </span>
          <span
            className={`font-bold text-xs flex items-center gap-1 ${demographicStatus.color}`}
          >
            <HeartPulse size={13} />
            {demographicStatus.text}
          </span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          <div className="bg-secondary/40 p-3 rounded-xl space-y-1.5 border border-border/40">
            <div className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5 font-sans">
                <Building2 size={12} className="text-treasury" />
                <span>میزان اشغال ظرفیت زیستی زیرساخت:</span>
              </div>
              <span className="font-bold text-foreground">
                {PersianNumberFormatter.toPersianDigits(capacityPct)}٪
              </span>
            </div>
            <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  capacityPct > 100
                    ? "bg-military"
                    : capacityPct >= 95
                      ? "bg-treasury"
                      : "bg-gdp"
                }`}
                style={{ width: `${Math.min(100, capacityPct)}%` }}
              />
            </div>
          </div>
        </div>

        {capacityPct > 100 && (
          <div className="p-3 bg-military/15 border border-military/30 rounded-xl flex items-center gap-2 text-[10px] text-military font-sans">
            <ShieldAlert size={14} className="shrink-0" />
            <span>
              کمبود مسکن و فشار تراکم! ارتقای زیرساخت یا فتح قلمروهای جدید برای
              افزایش ظرفیت زیستی الزامی است.
            </span>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground leading-relaxed bg-secondary/30 p-2.5 rounded-xl border border-border/40 font-sans">
          ثبات سیاسی بالا باعث زادومولد طبیعی و جذب مهاجران باکیفیت می‌شود. هر
          لِوِل ارتقای صنعت و آموزش ۲٪ به بهره‌وری سرانه می‌افزاید (سقف ۳۰۰ هزار
          دلار).
        </p>
      </div>
    </div>
  );
}
