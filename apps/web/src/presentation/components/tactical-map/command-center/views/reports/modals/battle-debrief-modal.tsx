"use client";

import React, { useState, useEffect } from "react";
import {
  Swords,
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
import { TacticalEffects } from "@/presentation/utils/tactical-effects";
import { BattlePhaseCards } from "./components/battle-phase-cards";
import { BattleCasualtyTable } from "./components/battle-casualty-table";
import { BattleSpoilsCard } from "./components/battle-spoils-card";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

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

  const isAttackerWin = reportData?.isAttackerVictory ?? false;
  const isHumanAttacker = humanNationId === reportData?.attackerId;
  const isHumanWinner =
    (isHumanAttacker && isAttackerWin) || (!isHumanAttacker && !isAttackerWin);

  useEffect(() => {
    if (isOpen && isHumanWinner) {
      TacticalEffects.fireVictoryConfetti(120);
      TacticalSound.playVictoryFanfare();
    } else if (isOpen && !isHumanWinner) {
      TacticalSound.playDefeatSound();
    }
  }, [isOpen, isHumanWinner]);

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

  const handleSelectStep = (step: 1 | 2 | 3 | 4 | 5) => {
    setActiveStep(step);
    if (step === 1) TacticalSound.playPhaseMissile();
    else if (step === 2) TacticalSound.playPhaseAir();
    else if (step === 3) TacticalSound.playPhaseGround();
    else if (step === 4) TacticalSound.playUiClick();
    else if (step === 5) TacticalSound.playCoinSound();
  };

  let modalTitle = "";
  if (isHumanAttacker) {
    if (reportData.isFullCapitulation && isAttackerWin) {
      modalTitle = `پیروزی قاطع و فتح کامل ${defenderName}`;
    } else if (isAttackerWin) {
      modalTitle = `پیروزی در حمله به ${defenderName}`;
    } else {
      modalTitle = `شکست در حمله به ${defenderName}`;
    }
  } else if (humanNationId === reportData.defenderId) {
    if (!isAttackerWin) {
      modalTitle = `دفاع موفق مقابل ${attackerName}`;
    } else {
      modalTitle = `شکست دفاعی مقابل ${attackerName}`;
    }
  } else {
    modalTitle = isAttackerWin
      ? `پیروزی ${attackerName} در نبرد با ${defenderName}`
      : `دفاع موفق ${defenderName} مقابل ${attackerName}`;
  }

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={modalTitle}
      maxWidthClass="max-w-3xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans pb-1">
        <div className="bg-gradient-to-r from-secondary/80 via-card to-secondary/80 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <span className="text-3xl select-none">{attackerFlag}</span>
            <div className="space-y-0.5">
              <span className="text-sm font-black text-foreground block">
                {attackerName}
              </span>
              <span className="text-[10px] text-primary font-mono font-bold">
                {reportData.attackType === "NAVAL"
                  ? "متهاجم (هجوم دریایی ⚓)"
                  : "متهاجم (تهاجم زمینی ⚔️)"}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="p-2 rounded-xl bg-military/15 text-military border border-military/30 shadow-sm">
              <Swords size={20} className="animate-pulse" />
            </div>
            <span className="text-[9px] font-mono text-muted-foreground font-black tracking-widest">
              VS
            </span>
          </div>

          <div className="flex items-center gap-3 text-left dir-ltr">
            <span className="text-3xl select-none">{defenderFlag}</span>
            <div className="space-y-0.5 text-right">
              <span className="text-sm font-black text-foreground block">
                {defenderName}
              </span>
              <span className="text-[10px] text-military font-mono font-bold">
                دولت مدافع
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 font-sans">
          {[
            { step: 1, title: "۱. موشکی", icon: Flame },
            { step: 2, title: "۲. هوایی", icon: Plane },
            { step: 3, title: "۳. زمینی", icon: ShieldAlert },
            { step: 4, title: "۴. تلفات", icon: BarChart3 },
            { step: 5, title: "۵. غنائم", icon: Trophy },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeStep === item.step;
            return (
              <button
                key={item.step}
                onClick={() => handleSelectStep(item.step as 1 | 2 | 3 | 4 | 5)}
                className={`py-2 px-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-[1.02]"
                    : "bg-secondary/40 border-border/60 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                <span className="truncate">{item.title}</span>
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
      </div>
    </UnifiedModalShell>
  );
}
