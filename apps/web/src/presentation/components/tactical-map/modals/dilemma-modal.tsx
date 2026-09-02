"use client";

import React, { useState } from "react";
import { Radio, AlertOctagon, Sparkles } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { DilemmaEvent, ActionFactory } from "@geopolitics/domain";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { DilemmaVisualStyleUtility } from "./dilemma/utils/dilemma-visual-style.utility";
import { DilemmaChoiceCard } from "./dilemma/components/dilemma-choice-card";

interface DilemmaModalProps {
  isOpen: boolean;
  dilemma: DilemmaEvent | null;
  humanNationId: string;
  onClose: () => void;
}

export function DilemmaModal({
  isOpen,
  dilemma,
  humanNationId,
  onClose,
}: DilemmaModalProps) {
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const { dispatchAction, isSubmitting } = useGameActions();

  if (!isOpen || !dilemma) return null;

  const categoryVisual = DilemmaVisualStyleUtility.getCategoryVisual(
    dilemma.category,
  );
  const urgencyBadgeClass = DilemmaVisualStyleUtility.getUrgencyBadgeClass(
    dilemma.urgency,
  );
  const urgencyLabel = DilemmaVisualStyleUtility.getUrgencyLabel(
    dilemma.urgency,
  );
  const CategoryIcon = categoryVisual.icon;

  const handleSelectChoice = async (choiceId: string) => {
    setSelectedChoiceId(choiceId);
    TacticalSound.playCoinSound();

    const action = ActionFactory.resolveDilemma(
      humanNationId,
      dilemma.id,
      choiceId,
    );

    const res = await dispatchAction(action);
    if (res.success) {
      onClose();
    }
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title=""
      maxWidthClass="max-w-2xl"
      onClose={() => {}}
    >
      <div className="space-y-5 text-right dir-rtl font-sans pb-2">
        <div
          className={`relative overflow-hidden bg-gradient-to-r ${categoryVisual.glowGradient} border ${categoryVisual.borderColor} p-6 rounded-3xl shadow-2xl space-y-3.5 backdrop-blur-2xl`}
        >
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-pulse" />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg shrink-0 ${categoryVisual.bgBadge}`}
              >
                <CategoryIcon size={22} className="animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-widest block">
                  NATIONAL CRISIS & GEOPOLITICAL DILEMMA
                </span>
                <span
                  className={`text-xs font-black ${categoryVisual.textColor}`}
                >
                  {categoryVisual.labelFa}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono font-bold px-3 py-1 rounded-xl border flex items-center gap-1.5 ${urgencyBadgeClass}`}
              >
                <Radio size={12} className="animate-ping" />
                <span>{urgencyLabel}</span>
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <h3 className="text-lg font-black text-foreground tracking-tight">
              {dilemma.titleFa}
            </h3>
            <span className="text-xs font-extrabold text-amber-400 block font-mono">
              {dilemma.headlineFa}
            </span>
          </div>

          <div className="bg-background/80 border border-border/70 p-4 rounded-2xl shadow-inner space-y-2">
            <p className="text-xs text-foreground/90 leading-relaxed font-sans font-medium">
              {dilemma.descriptionFa}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles size={13} className="text-primary" />
              گزینه‌های تصمیم‌گیری و ابلاغ فرمان حاکم
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">
              یکی از گزینه‌ها را برای ادامه بازی انتخاب کنید
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {dilemma.choices.map((choice, idx) => (
              <DilemmaChoiceCard
                key={choice.id}
                choice={choice}
                choiceIndex={idx}
                isSelected={selectedChoiceId === choice.id}
                isSubmitting={isSubmitting}
                onExecute={handleSelectChoice}
              />
            ))}
          </div>
        </div>

        <div className="p-3 bg-secondary/40 border border-border/60 rounded-2xl flex items-center justify-between text-[11px] font-mono">
          <span className="text-muted-foreground font-sans flex items-center gap-1.5">
            <AlertOctagon size={13} className="text-amber-400 shrink-0" />
            پیامد راهبردی:
          </span>
          <span className="font-extrabold text-foreground font-sans text-[10px]">
            تصمیم اتخاذشده بلافاصله ثبت و در تاریخچه ملی بایگانی می‌گردد.
          </span>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
