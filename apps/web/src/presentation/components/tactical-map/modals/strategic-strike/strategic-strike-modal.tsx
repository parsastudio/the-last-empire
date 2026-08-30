"use client";

import React, { useState, useMemo } from "react";
import {
  Rocket,
  ShieldAlert,
  Factory,
  Loader2,
  Crosshair,
  AlertTriangle,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";

interface StrategicStrikeModalProps {
  isOpen: boolean;
  attacker: Nation | null;
  targetNation: Nation | null;
  targetProvince: Province | null;
  onClose: () => void;
}

export function StrategicStrikeModal({
  isOpen,
  attacker,
  targetNation,
  targetProvince,
  onClose,
}: StrategicStrikeModalProps) {
  const [dronesToLaunch, setDronesToLaunch] = useState<number>(5);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { dispatchAction } = useGameActions();

  const availableDrones = attacker?.military.droneMissile || 0;
  const defAirDefense = targetNation?.military.airDefense || 0;

  const forecast = useMemo(() => {
    const intercepted = Math.min(dronesToLaunch, defAirDefense * 2);
    const leaked = Math.max(0, dronesToLaunch - intercepted);
    const maxDestructible = targetProvince ? targetProvince.factoriesCount : 0;
    const estimatedDestroyed = Math.min(
      maxDestructible,
      Math.floor(leaked * 0.5),
    );

    return {
      intercepted,
      leaked,
      estimatedDestroyed,
    };
  }, [dronesToLaunch, defAirDefense, targetProvince]);

  const handleLaunchStrike = async () => {
    if (
      !attacker ||
      !targetNation ||
      !targetProvince ||
      dronesToLaunch <= 0 ||
      isSubmitting
    ) {
      return;
    }

    setIsSubmitting(true);
    try {
      const action = ActionFactory.strategicIndustrialStrike(
        attacker.id,
        targetNation.id,
        targetProvince.provinceId,
        dronesToLaunch,
      );

      const res = await dispatchAction(
        action,
        `عملیات ضربت موشکی به ${targetProvince.nameFa} با موفقیت اجرا شد.`,
      );
      if (res.success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !attacker || !targetNation || !targetProvince) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="مرکز فرماندهی آتش موشکی و انهدام صنایع"
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div className="bg-secondary/40 border border-border/80 p-3.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getFlagEmoji(attacker.flagCode)}</span>
            <span className="text-xs font-black">{attacker.name}</span>
          </div>
          <div className="flex items-center gap-1 text-rose-400 font-mono font-bold text-xs">
            <Rocket size={16} />
            <span>عملیات تهاجم موشکی</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black">{targetNation.name}</span>
            <span className="text-2xl">
              {getFlagEmoji(targetNation.flagCode)}
            </span>
          </div>
        </div>

        <div className="bg-background/40 border border-border/60 p-3.5 rounded-2xl space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-foreground">
            <span className="font-sans font-bold flex items-center gap-1.5">
              <Factory size={14} className="text-gdp" />
              <span>کارخانجات فعال استان هدف ({targetProvince.nameFa}):</span>
            </span>
            <span className="font-bold text-sm text-gdp">
              {PersianNumberFormatter.formatNumberWithCommas(
                targetProvince.factoriesCount,
              )}{" "}
              سوله فعال
            </span>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-border/40">
            <div className="flex justify-between items-center text-xs">
              <span className="font-sans text-muted-foreground">
                تعداد موشک/پهپاد پرتابی:
              </span>
              <span className="font-bold text-foreground font-mono">
                {PersianNumberFormatter.formatNumberWithCommas(dronesToLaunch)}{" "}
                فروند
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={Math.max(1, availableDrones)}
              value={dronesToLaunch}
              onChange={(e) => setDronesToLaunch(Number(e.target.value))}
              className="w-full accent-rose-500"
            />
            <span className="text-[10px] text-muted-foreground font-sans block">
              موجودی انبار زرادخانه:{" "}
              {PersianNumberFormatter.formatNumberWithCommas(availableDrones)}{" "}
              فروند
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/40 text-center">
            <div className="bg-secondary/50 p-2 rounded-xl border border-border/40">
              <span className="text-[9px] font-sans text-muted-foreground block">
                رهگیری پدافند
              </span>
              <span className="font-bold text-rose-400">
                {PersianNumberFormatter.formatNumberWithCommas(
                  forecast.intercepted,
                )}
              </span>
            </div>
            <div className="bg-secondary/50 p-2 rounded-xl border border-border/40">
              <span className="text-[9px] font-sans text-muted-foreground block">
                موشک‌های عبورکرده
              </span>
              <span className="font-bold text-primary">
                {PersianNumberFormatter.formatNumberWithCommas(forecast.leaked)}
              </span>
            </div>
            <div className="bg-secondary/50 p-2 rounded-xl border border-border/40">
              <span className="text-[9px] font-sans text-muted-foreground block">
                تخمین انهدام کارخانه
              </span>
              <span className="font-bold text-gdp">
                {PersianNumberFormatter.formatNumberWithCommas(
                  forecast.estimatedDestroyed,
                )}{" "}
                سوله
              </span>
            </div>
          </div>

          <button
            onClick={handleLaunchStrike}
            disabled={availableDrones <= 0 || isSubmitting}
            className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 disabled:bg-secondary disabled:text-muted-foreground text-white rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
          >
            {isSubmitting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Crosshair size={14} />
            )}
            <span>صدور فرمان آتش موشکی به مراکز صنعتی</span>
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
