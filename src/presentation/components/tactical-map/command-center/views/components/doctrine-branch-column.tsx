import React from "react";
import { CheckCircle, Lock, AlertCircle } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DoctrineItem {
  id: string;
  name: string;
  desc: string;
  tier: number;
  cost: number;
  unlocked: boolean;
  canUnlock: boolean;
  prerequisites: string[];
}

interface DoctrineBranchColumnProps {
  title: string;
  doctrines: DoctrineItem[];
  activePoints?: number;
  onUnlock: (doctrine: DoctrineItem) => void;
}

export function DoctrineBranchColumn({
  title,
  doctrines,
  activePoints = 0,
  onUnlock,
}: DoctrineBranchColumnProps) {
  return (
    <div className="bg-background/40 border border-border/60 p-4 rounded-2xl space-y-3 dir-rtl text-right">
      <div className="pb-2 border-b border-border/40">
        <h3 className="text-xs font-extrabold text-foreground font-sans">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {doctrines.map((doc) => {
          const hasEnoughPoints = activePoints >= doc.cost;

          return (
            <div
              key={doc.id}
              className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                doc.unlocked
                  ? "bg-emerald-500/10 border-emerald-500/40 shadow-sm"
                  : doc.canUnlock
                    ? hasEnoughPoints
                      ? "bg-secondary/70 border-border/70 hover:bg-secondary"
                      : "bg-secondary/40 border-amber-500/30"
                    : "bg-background/20 border-border/30 opacity-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold bg-secondary border border-border/60 px-1.5 py-0.5 rounded text-muted-foreground">
                    سطح {PersianNumberFormatter.toPersianDigits(doc.tier)}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {doc.name}
                  </span>
                </div>

                {doc.unlocked ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/15 px-2 py-0.5 rounded-lg border border-emerald-500/30 shrink-0">
                    <CheckCircle size={12} />
                    <span>فعال‌سازی شده</span>
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-mono font-bold shrink-0 ${
                      hasEnoughPoints ? "text-emerald-500" : "text-amber-500"
                    }`}
                  >
                    {PersianNumberFormatter.toPersianDigits(doc.cost)} RP
                  </span>
                )}
              </div>

              <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
                {doc.desc}
              </p>

              {!doc.unlocked && (
                <div className="pt-1 flex items-center justify-between border-t border-border/30">
                  {!doc.canUnlock ? (
                    <span className="text-[9px] text-military font-sans flex items-center gap-1">
                      <Lock size={11} />
                      <span>نیازمند پیش‌نیاز سطح قبل</span>
                    </span>
                  ) : !hasEnoughPoints ? (
                    <span className="text-[9px] text-amber-500 font-sans flex items-center gap-1">
                      <AlertCircle size={11} />
                      <span>امتیاز پژوهشی بیشتر نیاز است</span>
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-500 font-sans">
                      آماده آنلاک
                    </span>
                  )}

                  {!doc.canUnlock ? (
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg text-[10px] font-bold bg-secondary/50 text-muted-foreground border border-border/40 cursor-not-allowed flex items-center gap-1"
                    >
                      <Lock size={11} />
                      <span>قفل پیش‌نیاز</span>
                    </button>
                  ) : !hasEnoughPoints ? (
                    <button
                      disabled
                      className="px-3 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/30 cursor-not-allowed opacity-80"
                    >
                      موجودی RP ناکافی
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnlock(doc)}
                      className="px-3 py-1 rounded-lg text-[10px] font-bold bg-gdp hover:bg-gdp/90 text-primary-foreground transition-all shadow-sm cursor-pointer"
                    >
                      آنلاک با{" "}
                      {PersianNumberFormatter.toPersianDigits(doc.cost)} RP
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
