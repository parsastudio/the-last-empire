import React from "react";
import { ArrowRight, Shield, Coins, Users, Award } from "lucide-react";
import { DiplomaticRelation } from "./diplomacy-detail-view";

interface DiplomacyIntelViewProps {
  relation: DiplomaticRelation;
  onBack: () => void;
}

export function DiplomacyIntelView({
  relation,
  onBack,
}: DiplomacyIntelViewProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowRight size={14} />
        <span>بازگشت به منوی تعامل</span>
      </button>

      <div className="bg-background/40 border border-border/80 p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <span className="text-sm font-extrabold text-foreground block">
              {relation.name}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              گزارش اطلاعاتی سازمان جاسوسی
            </span>
          </div>
          <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded text-muted-foreground">
            {relation.code}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 font-mono text-xs">
          <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <Coins size={12} className="text-gdp" />
              <span>تولید ناخالص (GDP)</span>
            </div>
            <span className="font-bold text-foreground block">
              {relation.intelData.gdp}
            </span>
          </div>

          <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <Users size={12} className="text-primary" />
              <span>جمعیت کل</span>
            </div>
            <span className="font-bold text-foreground block">
              {relation.intelData.population}
            </span>
          </div>

          <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <Shield size={12} className="text-military" />
              <span>قدرت تخمینی ارتش</span>
            </div>
            <span className="font-bold text-foreground block">
              {relation.intelData.militaryStrength}
            </span>
          </div>

          <div className="bg-secondary/40 p-3 rounded-xl space-y-1">
            <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
              <Award size={12} className="text-amber-500" />
              <span>سطح فناوری</span>
            </div>
            <span className="font-bold text-foreground block">
              لِوِل {relation.intelData.techLevel}
            </span>
          </div>
        </div>

        <div className="bg-secondary/30 p-3 rounded-xl space-y-1 text-right">
          <span className="text-[10px] font-bold text-muted-foreground block font-mono">
            وضعیت عمومی ثبات و حکومت
          </span>
          <p className="text-xs text-foreground font-medium">
            {relation.intelData.stabilityDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
