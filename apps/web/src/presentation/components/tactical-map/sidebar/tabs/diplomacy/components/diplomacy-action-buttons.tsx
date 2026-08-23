import React from "react";
import { Handshake, CheckCircle2, Swords, HeartHandshake } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { AcceptanceEvaluation } from "@geopolitics/game-engine";

interface DiplomacyActionButtonsProps {
  isWar: boolean;
  isAlliance: boolean;
  isNonAggression: boolean;
  foreignAidCost: number;
  allianceEvaluation?: AcceptanceEvaluation | null;
  napEvaluation?: AcceptanceEvaluation | null;
  onSendAid: () => void;
  onNonAggression: () => void;
  onAlliance: () => void;
  onDeclareWar: () => void;
}

export function DiplomacyActionButtons({
  isWar,
  isAlliance,
  isNonAggression,
  foreignAidCost,
  allianceEvaluation,
  napEvaluation,
  onSendAid,
  onNonAggression,
  onAlliance,
  onDeclareWar,
}: DiplomacyActionButtonsProps) {
  return (
    <div className="space-y-2 font-sans">
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
          <p className="text-[10px] text-muted-foreground">
            بهبود فوری ۲۵+ همسویی دوجانبه و ۴+ اعتبار جهانی برای کشور شما
          </p>
        </button>
      )}

      {!isNonAggression && (
        <button
          onClick={onNonAggression}
          disabled={isWar}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                پیمان عدم تخاصم
              </span>
              {napEvaluation && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    napEvaluation.willAccept
                      ? "bg-gdp/15 text-gdp"
                      : "bg-rose-500/15 text-rose-500"
                  }`}
                >
                  {napEvaluation.willAccept ? "پذیرش قطعی" : "احتمال رد"}
                </span>
              )}
            </div>
            <Handshake size={13} className="text-treasury" />
          </div>
        </button>
      )}

      {!isAlliance && (
        <button
          onClick={onAlliance}
          disabled={isWar}
          className="w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 disabled:opacity-40 border border-border text-right transition-all cursor-pointer space-y-1"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                پیمان اتحاد کامل
              </span>
              {allianceEvaluation && (
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    allianceEvaluation.willAccept
                      ? "bg-gdp/15 text-gdp"
                      : "bg-rose-500/15 text-rose-500"
                  }`}
                >
                  {allianceEvaluation.willAccept ? "پذیرش قطعی" : "احتمال رد"}
                </span>
              )}
            </div>
            <CheckCircle2 size={13} className="text-gdp" />
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
