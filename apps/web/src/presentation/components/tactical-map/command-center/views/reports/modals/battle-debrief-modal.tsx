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
  Trophy,
} from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { BattleFullReportData } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { BattlePhaseCards } from "./components/battle-phase-cards";
import { BattleCasualtyTable } from "./components/battle-casualty-table";
import { BattleSpoilsCard } from "./components/battle-spoils-card";

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
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);

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
      title="اتاق فرماندهی: گزارش زنده و آنالیز جامع نبرد و فتوحات"
      subtitle={`شرح تفصیلی عملیات ارتش ${attackerName} و ارتش مدافع ${defenderName}`}
      maxWidthClass="max-w-6xl"
      onClose={onClose}
    >
      <div className="space-y-5 text-right dir-rtl font-sans pb-2">
        <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-5 rounded-3xl flex items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <span className="text-4xl select-none">{attackerFlag}</span>
            <div className="space-y-0.5">
              <span className="text-base font-black text-foreground block">
                {attackerName}
              </span>
              <span className="text-xs text-primary font-mono font-bold">
                فرماندهی تهاجم (
                {reportData.attackType === "NAVAL"
                  ? "هجوم دریایی ⚓"
                  : "تهاجم زمینی ⚔️"}
                )
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-3 rounded-2xl bg-military/15 text-military border border-military/30 shadow-lg">
              <Swords size={26} className="animate-pulse" />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground font-black tracking-widest">
              VERSUS
            </span>
          </div>

          <div className="flex items-center gap-4 text-left dir-ltr">
            <span className="text-4xl select-none">{defenderFlag}</span>
            <div className="space-y-0.5">
              <span className="text-base font-black text-foreground block">
                {defenderName}
              </span>
              <span className="text-xs text-military font-mono font-bold">
                دولت مدافع
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-sans">
          {[
            { step: 1, title: "۱. موشکی و پدافند", icon: Flame },
            { step: 2, title: "۲. نبرد هوایی", icon: Plane },
            { step: 3, title: "۳. درگیری زمینی", icon: ShieldAlert },
            { step: 4, title: "۴. جدول تلفات", icon: BarChart3 },
            { step: 5, title: "۵. غنائم و فتوحات", icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(item.step as 1 | 2 | 3 | 4 | 5)}
                className={`py-3.5 px-3 rounded-2xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/20 scale-[1.02]"
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
        ) : activeStep === 4 ? (
          <BattleCasualtyTable
            reportData={reportData}
            attackerName={attackerName}
            defenderName={defenderName}
            attackerFlag={attackerFlag}
            defenderFlag={defenderFlag}
            humanNationId={humanNationId}
          />
        ) : (
          <BattleSpoilsCard
            reportData={reportData}
            attackerName={attackerName}
            defenderName={defenderName}
            attackerFlag={attackerFlag}
            defenderFlag={defenderFlag}
            humanNationId={humanNationId}
          />
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <button
            onClick={() =>
              setActiveStep(
                (prev) => Math.max(1, prev - 1) as 1 | 2 | 3 | 4 | 5,
              )
            }
            disabled={activeStep === 1}
            className="py-3 px-5 bg-secondary hover:bg-secondary/80 disabled:opacity-30 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 border border-border/60"
          >
            <ChevronRight size={16} />
            <span>مرحله قبل</span>
          </button>

          <button
            onClick={() => {
              if (activeStep < 5) {
                setActiveStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
              } else {
                onClose();
              }
            }}
            className="py-3 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-primary/20 flex items-center gap-2 border border-primary/40"
          >
            <span>
              {activeStep === 5 ? "بستن پرونده نبرد" : "مشاهده گام بعدی"}
            </span>
            {activeStep < 5 && <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
