"use client";

import React, { useState } from "react";
import {
  Swords,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plane,
  ShieldAlert,
  BarChart3,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { BattlePhaseCards } from "./components/battle-phase-cards";
import { BattleCasualtyTable } from "./components/battle-casualty-table";

interface BattleDebriefModalProps {
  isOpen: boolean;
  reportData: BattleFullReportData | null;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  onClose: () => void;
}

export function BattleDebriefModal({
  isOpen,
  reportData,
  nationsMap,
  humanNationId,
  onClose,
}: BattleDebriefModalProps) {
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4>(1);

  if (!isOpen || !reportData) return null;

  const attacker = nationsMap?.[reportData.attackerId];
  const defender = nationsMap?.[reportData.defenderId];

  const attackerName = attacker ? attacker.name : reportData.attackerId;
  const defenderName = defender ? defender.name : reportData.defenderId;

  const attackerFlag = getFlagEmoji(
    attacker?.flagCode || reportData.attackerId,
  );
  const defenderFlag = getFlagEmoji(
    defender?.flagCode || reportData.defenderId,
  );

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="اتاق فرماندهی: گزارش زنده و آنالیز ۳ فاز نبرد"
      subtitle={`شرح درگیری تاکتیکی ارتش ${attackerName} و ارتش ${defenderName}`}
      maxWidthClass="max-w-4xl"
      onClose={onClose}
    >
      <div className="space-y-5 text-right dir-rtl font-sans pb-2">
        <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4.5 rounded-3xl flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{attackerFlag}</span>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-foreground block">
                {attackerName}
              </span>
              <span className="text-[11px] text-primary font-mono font-bold">
                فرماندهی تهاجم (
                {reportData.attackType === "NAVAL"
                  ? "هجوم دریایی"
                  : "تهاجم زمینی"}
                )
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 rounded-2xl bg-military/15 text-military border border-military/30 shadow-lg">
              <Swords size={22} className="animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground font-black tracking-widest">
              VERSUS
            </span>
          </div>

          <div className="flex items-center gap-3 text-left dir-ltr">
            <span className="text-3xl select-none">{defenderFlag}</span>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-foreground block">
                {defenderName}
              </span>
              <span className="text-[11px] text-military font-mono font-bold">
                دولت مدافع
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 font-sans">
          {[
            { step: 1, title: "۱. موشکی و پدافند", icon: Flame },
            { step: 2, title: "۲. نبرد هوایی", icon: Plane },
            { step: 3, title: "۳. درگیری زمینی", icon: ShieldAlert },
            { step: 4, title: "۴. جدول تلفات", icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(item.step as 1 | 2 | 3 | 4)}
                className={`py-3 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                <Icon size={16} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>

        {activeStep <= 3 ? (
          <BattlePhaseCards
            activeStep={activeStep as 1 | 2 | 3}
            reportData={reportData}
            attackerName={attackerName}
            defenderName={defenderName}
            attackerFlag={attackerFlag}
            defenderFlag={defenderFlag}
          />
        ) : (
          <BattleCasualtyTable
            reportData={reportData}
            attackerName={attackerName}
            defenderName={defenderName}
            attackerFlag={attackerFlag}
            defenderFlag={defenderFlag}
            humanNationId={humanNationId}
          />
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <button
            onClick={() =>
              setActiveStep((prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4)
            }
            disabled={activeStep === 1}
            className="py-3 px-5 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border border-border/60"
          >
            <ChevronRight size={16} />
            <span>فاز قبلی</span>
          </button>

          <button
            onClick={() => {
              if (activeStep < 4) {
                setActiveStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
              } else {
                onClose();
              }
            }}
            className="py-3 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2 border border-primary/40"
          >
            <span>
              {activeStep === 4 ? "بستن پرونده نبرد" : "مشاهده فاز بعدی"}
            </span>
            {activeStep < 4 && <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
