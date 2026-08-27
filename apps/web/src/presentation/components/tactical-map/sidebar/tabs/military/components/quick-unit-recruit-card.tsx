import React from "react";
import {
  Shield,
  ShieldAlert,
  Crosshair,
  Plane,
  Radio,
  Plus,
  Coins,
  ShieldCheck,
  LucideIcon,
} from "lucide-react";
import { UnitType } from "@geopolitics/domain";
import {
  QuickUnitBatchInfo,
  FloatingFeedback,
} from "@/presentation/components/tactical-map/sidebar/tabs/military/hooks/use-quick-recruit-batch";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

const UNIT_ICONS: Record<
  UnitType,
  { icon: LucideIcon; color: string; bg: string }
> = {
  INFANTRY: {
    icon: Shield,
    color: "text-primary",
    bg: "bg-primary/10 border-primary/20",
  },
  ARMOR: {
    icon: ShieldAlert,
    color: "text-military",
    bg: "bg-military/10 border-military/20",
  },
  AIR_DEFENSE: {
    icon: Crosshair,
    color: "text-diplomacy",
    bg: "bg-diplomacy/10 border-diplomacy/20",
  },
  AIR_FORCE: {
    icon: Plane,
    color: "text-gdp",
    bg: "bg-gdp/10 border-gdp/20",
  },
  DRONE_MISSILE: {
    icon: Radio,
    color: "text-treasury",
    bg: "bg-treasury/10 border-treasury/20",
  },
};

interface QuickUnitRecruitCardProps {
  info: QuickUnitBatchInfo;
  feedbacks: FloatingFeedback[];
  onBuy: (info: QuickUnitBatchInfo) => void;
}

export function QuickUnitRecruitCard({
  info,
  feedbacks,
  onBuy,
}: QuickUnitRecruitCardProps) {
  const iconMeta = UNIT_ICONS[info.type];
  const Icon = iconMeta.icon;

  return (
    <div
      className={`relative p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 font-sans dir-rtl select-none ${
        info.isCapReached
          ? "bg-secondary/30 border-border/60 opacity-60"
          : info.canAfford
            ? "bg-card/90 border-border/80 hover:border-gdp/50 hover:bg-card shadow-sm"
            : "bg-background/40 border-border/60 opacity-60"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${iconMeta.bg} ${iconMeta.color}`}
        >
          <Icon size={18} />
        </div>

        <div className="space-y-0.5 text-right">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-foreground">
              {info.nameFa}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
            <span>
              قیمت واحد: {PersianNumberFormatter.formatCurrency(info.unitPrice)}
            </span>
            <span className="text-[9px] text-foreground font-sans">
              (ظرفیت باقی‌مانده:{" "}
              {PersianNumberFormatter.toPersianDigits(
                info.remainingRoom.toLocaleString("en-US"),
              )}
              )
            </span>
          </div>
        </div>
      </div>

      <div className="relative shrink-0 flex items-center">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center">
          {feedbacks.map((f) => (
            <span
              key={f.id}
              className="text-xs font-black font-mono text-gdp drop-shadow-md animate-out fade-out slide-out-to-top-3 duration-500"
            >
              {f.text}
            </span>
          ))}
        </div>

        {info.isCapReached ? (
          <div className="py-2 px-3 bg-amber-500/15 text-amber-400 rounded-xl text-[10px] font-mono border border-amber-500/30 flex items-center gap-1">
            <ShieldCheck size={12} />
            <span>سقف ظرفیت</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onBuy(info)}
            disabled={!info.canAfford}
            className="py-2.5 px-4 bg-gdp hover:bg-gdp/90 disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-40 text-primary-foreground rounded-xl text-xs font-black font-mono transition-all cursor-pointer shadow-md shadow-gdp/20 hover:scale-[1.03] active:scale-[0.96] flex items-center gap-1.5 border border-gdp/30"
            title={`سفارش با هزینه ${PersianNumberFormatter.formatCurrency(info.batchCost)}`}
          >
            <Plus size={14} strokeWidth={3} />
            <Coins size={12} className="opacity-90 shrink-0" />
            <span className="font-extrabold text-xs">
              {PersianNumberFormatter.formatCurrency(info.batchCost)}
            </span>
            <span className="text-[10px] font-medium opacity-85 mr-0.5">
              ({PersianNumberFormatter.toPersianDigits(info.batchQuantity)}{" "}
              یگان)
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
