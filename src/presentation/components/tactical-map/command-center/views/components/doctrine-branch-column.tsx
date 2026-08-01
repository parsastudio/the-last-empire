import React from "react";
import { CheckCircle, Lock } from "lucide-react";
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
  onUnlock: (doctrine: DoctrineItem) => void;
}

export function DoctrineBranchColumn({
  title,
  doctrines,
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
        {doctrines.map((doc) => (
          <div
            key={doc.id}
            className={`p-3 rounded-xl border transition-all space-y-2 ${
              doc.unlocked
                ? "bg-gdp/10 border-gdp/40"
                : doc.canUnlock
                  ? "bg-secondary/60 border-border/60 hover:bg-secondary"
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
                <span className="flex items-center gap-1 text-[10px] font-bold text-gdp shrink-0">
                  <CheckCircle size={13} />
                  <span>آنلاک‌شده</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono text-amber-500 font-bold shrink-0">
                  {PersianNumberFormatter.toPersianDigits(doc.cost)} RP
                </span>
              )}
            </div>

            <p className="text-[10px] text-muted-foreground leading-relaxed font-sans">
              {doc.desc}
            </p>

            {!doc.unlocked && (
              <div className="pt-1 flex items-center justify-between">
                {!doc.canUnlock ? (
                  <span className="text-[9px] text-military font-sans flex items-center gap-1">
                    <Lock size={11} />
                    <span>نیازمند پیش‌نیاز سطح قبل</span>
                  </span>
                ) : (
                  <span className="text-[9px] text-muted-foreground font-sans">
                    آماده آنلاک
                  </span>
                )}

                <button
                  onClick={() => onUnlock(doc)}
                  disabled={!doc.canUnlock}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm ${
                    doc.canUnlock
                      ? "bg-gdp hover:bg-gdp/90 text-primary-foreground cursor-pointer"
                      : "bg-secondary text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  آنلاک با {PersianNumberFormatter.toPersianDigits(doc.cost)} RP
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
