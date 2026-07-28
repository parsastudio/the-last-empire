import React from "react";
import {
  X,
  Swords,
  AlertTriangle,
  ShieldAlert,
  Coins,
  Fuel,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface AttackPlanningModalProps {
  isOpen: boolean;
  attackerName: string;
  attackerCode: string;
  targetName: string;
  targetCode: string;
  coordinate: { x: number; y: number };
  stance: string;
  userOilStock?: number;
  onClose: () => void;
  onConfirmAttack: () => void;
}

export function AttackPlanningModal({
  isOpen,
  attackerName,
  attackerCode,
  targetName,
  targetCode,
  coordinate,
  stance = "PEACE",
  userOilStock = 20,
  onClose,
  onConfirmAttack,
}: AttackPlanningModalProps) {
  if (!isOpen) return null;

  const attackerFlag = getFlagEmoji(attackerCode);
  const targetFlag = getFlagEmoji(targetCode);
  const isAtWar = stance === "WAR";
  const requiredOil = 50;
  const isOilDeficit = userOilStock < requiredOil;

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card/95 backdrop-blur-xl border border-border/90 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-5 dir-rtl overflow-hidden pointer-events-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-bold text-military font-mono uppercase tracking-wider">
            <Swords size={13} />
            <span>اتاق عملیات | برنامه‌ریزی تهاجم نظامی</span>
          </div>
          <h2 className="text-lg font-extrabold text-foreground">
            طرح حمله استراتژیک به {targetName}
          </h2>
        </div>

        <div className="bg-secondary/40 border border-border/80 p-4 rounded-2xl flex items-center justify-between font-sans">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-2xl">{attackerFlag}</span>
            <span>{attackerName}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <ArrowLeft size={18} className="text-military animate-pulse" />
            <span className="text-[9px] font-mono text-muted-foreground">
              تئاتر عملیاتی
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm font-bold">
            <span>{targetName}</span>
            <span className="text-2xl">{targetFlag}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-background/50 border border-border p-3 rounded-xl">
          <MapPin size={14} className="text-military shrink-0" />
          <span className="text-muted-foreground">مختصات دقیق نقطه‌کوبی:</span>
          <span className="font-bold text-foreground dir-ltr font-mono">
            X: {coordinate.x} | Y: {coordinate.y}
          </span>
        </div>

        {!isAtWar && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-rose-500">
            <ShieldAlert size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">هشدار وضعیت دیپلماتیک</span>
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                شما در وضعیت صلح هستید! حمله مستقیم بدون اعلام جنگ باعث افت شدید
                ثبات سیاسی (-۳۰٪) و صدمه به اعتبار جهانی خواهد شد.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            برآورد هزینه‌ها و لجستیک عملیات
          </span>

          <div className="bg-background/40 border border-border/80 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
                <Coins size={13} className="text-gdp" />
                ترانزیت نیروها تا مرز
              </span>
              <span className="font-bold text-foreground">$۴,۰۰۰ دلار</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
                <Coins size={13} className="text-treasury" />
                ترابری متقاطع و پشتیبانی سنگین
              </span>
              <span className="font-bold text-foreground">$۱۵,۰۰۰ دلار</span>
            </div>

            <div className="flex justify-between items-center pt-0.5">
              <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
                <Fuel size={13} className="text-primary" />
                سوخت و نفت مورد نیاز سوخت‌رسانی
              </span>
              <span className="font-bold text-foreground">۵۰ بشکه</span>
            </div>
          </div>
        </div>

        {isOilDeficit && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-2.5 text-xs text-amber-500">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">هشدار کمبود سوخت</span>
              <p className="text-[11px] text-foreground/80 leading-relaxed">
                ذخایر نفت کافی نیست! انجام حمله بدون سوخت کافی، ضریب منفی ۴۰٪ به
                قدرت رزمی یگان‌ها اعمال خواهد کرد.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-border">
          <button
            onClick={onConfirmAttack}
            className="w-full py-3.5 bg-military hover:bg-military/90 text-primary-foreground rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-military/10"
          >
            <Swords size={16} />
            <span>تایید و صدور دستور حمله به {targetName}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
