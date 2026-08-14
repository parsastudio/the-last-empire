import React from "react";
import {
  Handshake,
  CheckCircle2,
  Ban,
  Swords,
  HeartHandshake,
} from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DiplomacyActionButtonsProps {
  isWar: boolean;
  isSevered: boolean;
  isAlliance: boolean;
  isNonAggression: boolean;
  foreignAidCost: number;
  onSendAid: () => void;
  onNonAggression: () => void;
  onAlliance: () => void;
  onSeverTrade: () => void;
  onDeclareWar: () => void;
}

export function DiplomacyActionButtons({
  isWar,
  isSevered,
  isAlliance,
  isNonAggression,
  foreignAidCost,
  onSendAid,
  onNonAggression,
  onAlliance,
  onSeverTrade,
  onDeclareWar,
}: DiplomacyActionButtonsProps) {
  return (
    <div className="space-y-2">
      {!isWar && (
        <button
          onClick={onSendAid}
          className="w-full p-3 rounded-xl bg-gdp/15 hover:bg-gdp/25 border border-gdp/30 text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gdp">
              ارسال کمک مالی و دیپلماتیک (
              {PersianNumberFormatter.formatCurrency(foreignAidCost)})
            </span>
            <HeartHandshake size={14} className="text-gdp" />
          </div>
          <p className="text-[10px] text-muted-foreground font-sans">
            بهبود فوری ۲۰+ دیدگاه دوجانبه و ۴+ اعتبار جهانی برای کشور شما
          </p>
        </button>
      )}

      {!isNonAggression && (
        <button
          onClick={onNonAggression}
          disabled={isWar || isSevered}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              پیمان عدم تخاصم
            </span>
            <Handshake size={13} className="text-treasury" />
          </div>
        </button>
      )}

      {!isAlliance && (
        <button
          onClick={onAlliance}
          disabled={isWar || isSevered}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              پیمان اتحاد کامل
            </span>
            <CheckCircle2 size={13} className="text-gdp" />
          </div>
        </button>
      )}

      {!isSevered && !isWar && (
        <button
          onClick={onSeverTrade}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              قطع روابط تجاری
            </span>
            <Ban size={13} className="text-rose-400" />
          </div>
        </button>
      )}

      {!isWar && (
        <button
          onClick={onDeclareWar}
          className="w-full p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold">اعلان جنگ رسمی</span>
            <Swords size={13} />
          </div>
        </button>
      )}
    </div>
  );
}
